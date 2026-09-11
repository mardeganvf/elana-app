import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BE2PXd_maQ142gLFDJAybKQ7zXSp3py0U7Jqq72laxy0uuxa0h2nNg4qFoymgpGSDqzVt9ErIiS4LAfwU9WkYWM';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user, updateUser, awardBadge } = useAuth();
  const { showToast } = useToast();

  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window;

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sincroniza estado de inscrição com o PushManager
  const checkSubscription = useCallback(async () => {
    if (!isSupported || !user?.id) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      setPermission(Notification.permission);
    } catch (err) {
      console.warn('Erro ao verificar inscrição de push:', err);
    }
  }, [isSupported, user?.id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Ativa notificações push
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      showToast('error', 'Seu navegador não suporta notificações push.');
      return false;
    }

    if (!user?.id) {
      showToast('info', 'Faça login para receber notificações.');
      return false;
    }

    if (Notification.permission === 'denied') {
      showToast('error', 'As notificações foram bloqueadas nas configurações do seu navegador. Por favor, libere a permissão para ativá-las.');
      return false;
    }

    setIsLoading(true);

    try {
      // 1. Pede permissão ao usuário via prompt nativo do navegador
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        showToast('info', 'Permissão de notificação não foi concedida.');
        setIsLoading(false);
        return false;
      }

      // 2. Garante que o Service Worker está pronto
      const registration = await navigator.serviceWorker.ready;

      // 3. Obtém ou cria a assinatura Push
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // 4. Extrai as chaves de criptografia da assinatura
      const rawKey = subscription.getKey('p256dh');
      const rawAuth = subscription.getKey('auth');
      const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : '';
      const authKey = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : '';

      // 5. Salva a inscrição no Supabase
      try {
        await supabase.from('push_subscriptions').upsert(
          {
            profile_id: user.id,
            endpoint: subscription.endpoint,
            p256dh,
            auth_key: authKey,
            user_agent: navigator.userAgent
          },
          { onConflict: 'profile_id,endpoint' }
        );
      } catch (dbErr) {
        console.warn('Aviso: falha ao salvar push_subscription no Supabase:', dbErr);
      }

      // 6. Atualiza o perfil do usuário
      if (updateUser) {
        await updateUser({ notificationsEnabled: true });
      }

      // 7. Badge de engajamento
      if (awardBadge) {
        awardBadge('b3');
      }

      setIsSubscribed(true);
      showToast('success', 'Notificações ativadas com sucesso! 🔔');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao ativar notificações push:', error);
      showToast('error', 'Não foi possível ativar as notificações: ' + (error?.message || 'Tente novamente.'));
      setIsLoading(false);
      return false;
    }
  };

  // Desativa notificações push
  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove do Supabase
        if (user?.id) {
          try {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('profile_id', user.id)
              .eq('endpoint', subscription.endpoint);
          } catch (dbErr) {
            console.warn('Aviso ao remover subscription do Supabase:', dbErr);
          }
        }

        // Cancela no browser
        await subscription.unsubscribe();
      }

      // Atualiza o perfil do usuário
      if (updateUser) {
        await updateUser({ notificationsEnabled: false });
      }

      setIsSubscribed(false);
      showToast('info', 'Notificações desativadas.');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao desativar notificações push:', error);
      showToast('error', 'Erro ao desativar notificações.');
      setIsLoading(false);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  };
}

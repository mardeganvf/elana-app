import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

const NOTIFICATIONS_STORAGE_KEY = 'elana_journey_notifications_v1';

export const useJourneyNotifications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifiedJourneyIds, setNotifiedJourneyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleJourneyNotification = async (journeyId: string, journeyTitle: string) => {
    const isAlreadyNotified = notifiedJourneyIds.includes(journeyId);
    let updated: string[];

    if (isAlreadyNotified) {
      updated = notifiedJourneyIds.filter(id => id !== journeyId);
      setNotifiedJourneyIds(updated);
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      showToast('info', `Aviso para "${journeyTitle}" cancelado.`);
    } else {
      updated = [...notifiedJourneyIds, journeyId];
      setNotifiedJourneyIds(updated);
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      showToast('success', `Pronto! Avisaremos você assim que a Jornada "${journeyTitle}" for lançada.`);

      // Sincroniza em segundo plano com o Supabase caso a tabela exista
      try {
        await supabase.from('journey_interests').insert({
          journey_id: journeyId,
          user_id: user?.id || null,
          user_email: user?.email || null,
          user_name: user?.name || null
        });
      } catch (err) {
        // Fallback silencioso
      }
    }
  };

  const isJourneyNotified = (journeyId: string) => notifiedJourneyIds.includes(journeyId);

  return {
    notifiedJourneyIds,
    toggleJourneyNotification,
    isJourneyNotified
  };
};

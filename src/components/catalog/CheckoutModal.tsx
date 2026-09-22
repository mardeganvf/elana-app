import React, { useState } from 'react';
import { Journey } from '../../types';
import { useAuth, isAdminUser } from '../../context/AuthContext';
import { X, ShieldCheck, Check, Sparkles, CreditCard, QrCode } from 'lucide-react';

interface CheckoutModalProps {
  journey: Journey | null;
  onClose: () => void;
  onSuccess: (journey: Journey) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ journey, onClose, onSuccess }) => {
  const { user, purchaseJourney } = useAuth();
  const isAdmin = isAdminUser(user);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!journey) return null;

  // Checkout real Stripe
  const handleGoToCheckout = () => {
    if (journey.checkoutUrl) {
      const url = new URL(journey.checkoutUrl);
      if (user?.email) url.searchParams.set('prefilled_email', user.email);
      if (user?.id) url.searchParams.set('client_reference_id', user.id);
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  // Liberação imediata exclusiva para administradores / homologação
  const handleAdminDirectUnlock = async () => {
    setIsProcessing(true);
    await purchaseJourney(journey.id);
    setIsProcessing(false);
    onSuccess(journey);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#101B1E] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-white/10 my-auto relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ backgroundColor: journey.themeColor }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-md">
            Adquirir esta Jornada
          </span>
          <h2 
            className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {journey.title}
          </h2>
          <p className="text-xs opacity-90 italic mt-1">"{journey.tagline}"</p>
        </div>

        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          
          {/* Whats included */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              O que você terá acesso vitalício:
            </h4>
            <div className="space-y-2 bg-[#070D0F] p-4 rounded-2xl border border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold shrink-0" />
                <span>Acesso completo aos <strong>{journey.modules.reduce((s, m) => s + m.lessons.length, 0)} conteúdos</strong> em vídeo e áudio.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold shrink-0" />
                <span>Espaço de notas pessoais e PDFs de apoio para download.</span>
              </div>
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>BÔNUS EXCLUSIVO:</strong> Ganhe <strong>90 dias gratuitos</strong> na Comunidade Elana e salas de acolhimento parental.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold shrink-0" />
                <span>Pontos de Evolução e Certificado Digital de Conclusão.</span>
              </div>
            </div>
          </div>

          {/* Checkout Info Box */}
          <div className="p-4 rounded-2xl bg-[#070D0F] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pagamento Seguro via Stripe</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processado com criptografia bancária de ponta a ponta pela <strong>Stripe</strong>. Aceitamos <strong>PIX Instantâneo</strong> e <strong>Cartão de Crédito</strong>. Seu acesso à jornada e os 90 dias de comunidade são liberados automaticamente.
            </p>
          </div>

          {/* Summary & Guarantee */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 block">Investimento:</span>
                <span className="text-2xl font-extrabold text-white">
                  R$ {journey.price},90
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Garantia incondicional de 7 dias</span>
              </div>
            </div>

            {/* Ação de Compra */}
            {journey.checkoutUrl ? (
              <button
                onClick={handleGoToCheckout}
                className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] hover:brightness-110"
                style={{ backgroundColor: journey.themeColor }}
              >
                <Sparkles className="w-4 h-4 fill-current" />
                Ir para o Pagamento Seguro
              </button>
            ) : (
              <div className="space-y-2">
                {isAdmin ? (
                  <button
                    onClick={handleAdminDirectUnlock}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 hover:brightness-110"
                    style={{ backgroundColor: journey.themeColor }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Liberando Acesso (Modo Admin)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-current" />
                        Liberar Acesso de Teste (Admin)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    As inscrições para esta turma serão abertas em breve. Fique atento aos avisos na comunidade!
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

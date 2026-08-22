import React, { useState } from 'react';
import { Journey } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, Check, Sparkles, CreditCard, QrCode } from 'lucide-react';

interface CheckoutModalProps {
  journey: Journey | null;
  onClose: () => void;
  onSuccess: (journey: Journey) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ journey, onClose, onSuccess }) => {
  const { purchaseJourney } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!journey) return null;

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      purchaseJourney(journey.id);
      setIsProcessing(false);
      onSuccess(journey);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#101B1E] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-white/10 my-8 relative text-white">
        
        {/* Top Header Banner */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ backgroundColor: journey.themeColor }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-md">
            Aquisição Individual de Módulo
          </span>
          <h2 
            className="text-3xl font-bold mt-2 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {journey.title}
          </h2>
          <p className="text-xs opacity-90 italic mt-1">"{journey.tagline}"</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Whats included */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              O que você terá acesso vitalício:
            </h4>
            <div className="space-y-2 bg-[#070D0F] p-4 rounded-2xl border border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold" />
                <span>Acesso completo aos <strong>{journey.modules.reduce((s, m) => s + m.lessons.length, 0)} conteúdos</strong> HD.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold" />
                <span>Espaço de notas pessoais e PDFs de apoio.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold" />
                <span>Participação na Comunidade Elana e tópicos exclusivos.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 font-bold" />
                <span>Pontos de Evolução e Certificado Digital de Conclusão.</span>
              </div>
            </div>
          </div>

          {/* Payment Option Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Forma de Pagamento Simulada:
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-[#FF7F5B] bg-[#FF7F5B]/15 text-[#FF7F5B] shadow-md'
                    : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#8A9A5B]" />
                PIX Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#FF7F5B] bg-[#FF7F5B]/15 text-[#FF7F5B] shadow-md'
                    : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#E66795]" />
                Cartão de Crédito
              </button>
            </div>
          </div>

          {/* Summary & Guarantee */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total a pagar:</span>
                <span className="text-2xl font-extrabold text-white">
                  R$ {journey.price},00
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                Garantia de 7 dias
              </div>
            </div>

            <button
              onClick={handleCompletePurchase}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 hover:brightness-110"
              style={{ backgroundColor: journey.themeColor }}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Liberando Acesso ao Módulo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  Confirmar e Desbloquear Módulo
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

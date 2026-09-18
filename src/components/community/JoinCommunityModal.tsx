import React from 'react';
import { X, Check, HeartHandshake, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  onExploreCatalog?: () => void;
}

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  isOpen,
  onClose,
  checkoutUrl,
  onExploreCatalog
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative w-full max-w-lg bg-[#0E1A1E] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30 flex items-center justify-center mx-auto shadow-inner">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7F5B] block">
            Rede de Apoio & Escuta Real
          </span>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Faça parte da Comunidade Elana
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Um espaço seguro e acolhedor para desabafar, trocar aprendizados e caminhar ao lado de outros pais na mesma fase de vida.
          </p>
        </div>

        {/* 2 Options Cards */}
        <div className="space-y-4">
          {/* Option 1: Monthly Subscription */}
          <div className="bg-[#101B1E] border-2 border-[#FF7F5B]/60 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FF7F5B] text-slate-950">
                Acesso Direto
              </span>
              <span className="text-xl font-black text-white">
                R$ 9,90<span className="text-xs text-slate-400 font-normal">/mês</span>
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8A9A5B] shrink-0" />
                <span>Acesso ilimitado a todas as salas temáticas e faixas etárias</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8A9A5B] shrink-0" />
                <span>Publique desabafos no confessionário anônimo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8A9A5B] shrink-0" />
                <span>Sem fidelidade — cancele com 1 clique a qualquer momento</span>
              </div>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <span>Assinar Comunidade por R$ 9,90/mês</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Option 2: 90 Days Free on Journey Purchase */}
          <div className="bg-[#101B1E]/60 border border-white/10 rounded-2xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/30">
                ⭐ Bônus Especial
              </span>
              <span className="text-xs font-bold text-[#FFD166]">
                90 Dias Grátis
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#FFD166]" />
                <span>Adquira qualquer Jornada Elana</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ao comprar qualquer uma das nossas 06 jornadas em vídeo (a partir de R$ 29,90 em pagamento único), você ganha automaticamente <strong>90 dias de acesso completo e gratuito</strong> à comunidade.
              </p>
            </div>

            {onExploreCatalog && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreCatalog();
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-3 px-4 rounded-xl border border-white/15 transition-all active:scale-98 cursor-pointer"
              >
                <span>Explorar Catálogo de Jornadas</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8A9A5B]" />
          <span>Pagamento 100% seguro via Stripe com Pix ou Cartão de Crédito.</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, X, ChevronRight, Award } from 'lucide-react';

interface QuizCardBannerProps {
  onStartQuiz: () => void;
  userId?: string;
}

export const QuizCardBanner: React.FC<QuizCardBannerProps> = ({ onStartQuiz, userId }) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const key = `elana_superpoder_banner_dismissed_${userId || 'guest'}`;
    const dismissedAt = localStorage.getItem(key);
    if (!dismissedAt) {
      setIsDismissed(false);
      return;
    }
    const dismissedTime = parseInt(dismissedAt, 10);
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime > threeDays) {
      setIsDismissed(false);
    }
  }, [userId]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    const key = `elana_superpoder_banner_dismissed_${userId || 'guest'}`;
    localStorage.setItem(key, Date.now().toString());
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18272B] via-[#101B1E] to-[#1F1713] border border-[#FFD166]/30 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-[#FFD166]/60 group">
      {/* Glow decorativo de fundo */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#FF7F5B]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#FFD166]/10 blur-2xl pointer-events-none" />

      {/* Botão de Fechar Sutil */}
      <button
        onClick={handleDismiss}
        aria-label="Lembrar mais tarde"
        className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
        title="Lembrar mais tarde"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4 max-w-2xl">
          {/* Badge de Ícone */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFD166] to-[#FF7F5B] text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-[#FF7F5B]/20 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FFD166] bg-[#FFD166]/10 border border-[#FFD166]/30 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Diagnóstico Exclusivo
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3" />
                +100 XP
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Qual é o seu Superpoder Parental?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Toda mãe e todo pai têm uma força secreta na criação. Responda a 15 perguntas reflexivas e descubra a sua maior luz, seus pontos cegos e a trilha ideal para o seu momento em família.
            </p>
          </div>
        </div>

        {/* Botão de Chamada para Ação */}
        <button
          onClick={onStartQuiz}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7F5B] to-[#e06847] hover:from-[#ff8b6b] hover:to-[#eb7555] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-xl shadow-[#FF7F5B]/25 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer group-hover:shadow-2xl"
        >
          <span>Descobrir Meu Superpoder</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

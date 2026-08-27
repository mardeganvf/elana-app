import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Award, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USER_LEVELS } from '../../data/gamificationData';

export interface LevelUpInfo {
  level: number;
  title: string;
  icon: string;
  description: string;
  minXp: number;
  maxXp: number;
  nextLevelXp: number;
  nextLevelTitle?: string | null;
}

interface LevelUpModalProps {
  levelInfo: LevelUpInfo | null;
  previousLevel?: number;
  onClose: () => void;
  onOpenAllLevels?: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  levelInfo,
  previousLevel = 1,
  onClose,
  onOpenAllLevels
}) => {
  const { user } = useAuth();
  const [, setAnimationStage] = useState<'charging' | 'revealed'>('charging');

  const prevLevelObj = USER_LEVELS.find(l => l.level === previousLevel) || USER_LEVELS[0];
  const nextLevelObj = levelInfo ? USER_LEVELS.find(l => l.level === levelInfo.level + 1) : null;
  const firstName = user?.name.split(' ')[0] || 'Membro';

  useEffect(() => {
    if (!levelInfo) return;

    // 1. Tocar acorde cristalino de celebração (Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        const now = ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.001, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.09 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.75);
        });
      }
    } catch {
      // Autoplay safe fallback
    }

    // 2. Feedback tátil em smartphones
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } catch {}
    }

    // 3. Chuva épica de confetes em 3 disparos sequenciais
    const end = Date.now() + 2500;
    const colors = ['#FF7F5B', '#FFD166', '#E66795', '#8A9A5B', '#FFFFFF'];

    // Disparo central inicial
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors
    });

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors
      });
    }, 400);

    // 4. Transição de estágio de revelação
    const timer = setTimeout(() => {
      setAnimationStage('revealed');
    }, 450);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [levelInfo]);

  if (!levelInfo) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 select-none overflow-hidden">
      
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#03070A]/95 backdrop-blur-2xl animate-fade-in"
        onClick={onClose}
      />

      {/* Rotating Sunburst God Rays Background */}
      <div 
        className="absolute w-[800px] h-[800px] opacity-40 pointer-events-none animate-[spin_30s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,127,91,0.3) 0deg, transparent 25deg, rgba(230,103,149,0.3) 50deg, transparent 75deg, rgba(255,209,102,0.3) 100deg, transparent 125deg, rgba(138,154,91,0.3) 150deg, transparent 175deg, rgba(255,127,91,0.3) 200deg, transparent 225deg, rgba(230,103,149,0.3) 250deg, transparent 275deg, rgba(255,209,102,0.3) 300deg, transparent 325deg, rgba(255,127,91,0.3) 360deg)',
          borderRadius: '50%'
        }}
      />

      {/* Radial Gradient Ambient Glow */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#E66795]/30 via-[#FF7F5B]/35 to-[#FFD166]/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Main High-Impact Level Up Card */}
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-b from-[#182C31] via-[#101E22] to-[#070E10] border-2 border-[#FFD166]/70 rounded-[36px] p-6 sm:p-9 shadow-[0_0_100px_rgba(255,209,102,0.45)] text-center space-y-6 animate-scale-up overflow-hidden">
        
        {/* Top Floating Golden Shimmer Beam */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E66795] via-[#FFD166] to-[#8A9A5B]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer z-20"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Rank Evolution Badge */}
        <div className="relative pt-2">
          
          {/* Metamorphosis Flow from Previous to New */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            
            {/* Previous Rank Avatar */}
            <div className="flex flex-col items-center opacity-60 scale-90 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#081013] border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                {prevLevelObj.icon}
              </div>
              <span className="text-[10px] text-slate-400 font-bold mt-1">
                {prevLevelObj.title}
              </span>
            </div>

            {/* Glowing Transition Arrow */}
            <div className="flex items-center text-[#FFD166] animate-pulse">
              <ChevronRight className="w-6 h-6 -mr-2" />
              <ChevronRight className="w-6 h-6 text-[#FF7F5B]" />
            </div>

            {/* NEW PROMOTED RANK CREST */}
            <div className="relative">
              
              {/* Pulsing Concentric Ripple Rings */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#FF7F5B] via-[#FFD166] to-[#8A9A5B] opacity-60 blur-md animate-spin-slow" />
              <div className="absolute -inset-1 rounded-full bg-[#FFD166]/40 animate-ping opacity-75" />

              {/* Solid Grand Golden Crest */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-[#1C333A] to-[#0A1417] border-4 border-[#FFD166] flex items-center justify-center shadow-[0_0_50px_rgba(255,209,102,0.9)] transform transition-transform hover:scale-105">
                <span className="text-5xl sm:text-6xl transform animate-bounce">
                  {levelInfo.icon}
                </span>
              </div>

              {/* Top Sparkle Pin */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FFD166] to-[#FF7F5B] p-2 rounded-full border-2 border-[#0A1417] shadow-xl animate-spin-slow">
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              </div>
            </div>

          </div>

        </div>

        {/* Level Up Announcement Headline */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FFD166]/20 via-[#FF7F5B]/20 to-[#E66795]/20 border border-[#FFD166]/60 text-[#FFD166] text-[11px] font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current text-[#FFD166]" />
            <span>NOVO NÍVEL ALCANÇADO!</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            Nível {levelInfo.level} — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] via-[#FF7F5B] to-[#E66795]">{levelInfo.title}</span>
          </h2>
        </div>

        {/* Poetic & Welcoming Emotional Narrative */}
        <div className="bg-[#070D0F]/90 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-2 text-slate-200 text-xs sm:text-sm leading-relaxed text-left shadow-inner">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="text-base">💖</span>
            <span>Parabéns pela sua caminhada, {firstName}!</span>
          </div>
          <p className="text-slate-300 italic">
            "{levelInfo.description}"
          </p>
        </div>

        {/* Level Progression Visual Bar */}
        <div className="bg-[#0A1518] p-3.5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">
              Pontuação Atual: <strong className="text-white">{user?.xp || levelInfo.minXp} XP</strong>
            </span>
            {nextLevelObj && (
              <span className="text-[#FFD166]">
                Próximo: {nextLevelObj.title} ({nextLevelObj.minXp} XP)
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#050A0C] h-2.5 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#FF7F5B] via-[#FFD166] to-[#8A9A5B] rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,209,102,0.8)]"
              style={{ width: `${Math.min(100, Math.max(15, (( (user?.xp || levelInfo.minXp) - levelInfo.minXp) / Math.max(1, (nextLevelObj ? nextLevelObj.minXp : levelInfo.maxXp) - levelInfo.minXp)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#FF7F5B] via-[#E66795] to-[#FFD166] hover:opacity-95 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-[0_10px_35px_rgba(255,127,91,0.5)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider group transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Continuar Minha Jornada {levelInfo.icon}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {onOpenAllLevels && (
            <button
              onClick={() => {
                onClose();
                onOpenAllLevels();
              }}
              className="w-full text-xs text-slate-400 hover:text-[#FFD166] font-bold py-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ver todas as 15 Árvores de Evolução</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

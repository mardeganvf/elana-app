import React from 'react';
import { Sparkles, ArrowRight, Heart, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ALL_BADGES, getLevelFromXP } from '../../data/gamificationData';
import { supabase } from '../../lib/supabase';

interface BadgeRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeRewardModal: React.FC<BadgeRewardModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  if (!isOpen || !user) return null;

  const firstName = user.name.split(' ')[0] || 'Membro';

  const handleClaimReward = async () => {
    // Award 25 XP and unlock "Semente Plantada" badge
    const sementeBadge = ALL_BADGES[0];
    const hasBadge = user.badges.some(b => b.id === sementeBadge.id);
    const updatedBadges = hasBadge ? user.badges : [...user.badges, sementeBadge];
    const newXP = user.xp < 25 ? 25 : user.xp;
    const levelInfo = getLevelFromXP(newXP);

    if (updateUser) {
      await updateUser({
        xp: newXP,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        badges: updatedBadges,
        onboardingCompleted: true,
        familyTag: user.familyTag || 'Membro da Comunidade'
      });
    }

    try {
      await supabase.from('user_badges').upsert({
        profile_id: user.id,
        badge_id: 'b1'
      }, { onConflict: 'profile_id, badge_id' });
    } catch (e) {
      console.warn('Error saving initial badge:', e);
    }

    localStorage.setItem(`elana_spotlight_done_${user.email.toLowerCase().trim()}`, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 select-none overflow-hidden">
      
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#03070A]/90 backdrop-blur-xl animate-fade-in"
        onClick={handleClaimReward}
      />

      {/* Radial Glow Rays in Background */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#E66795]/30 to-[#FF7F5B]/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Main Impact Card */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#152428] via-[#0F1B1E] to-[#091113] border-2 border-[#FF7F5B]/60 rounded-[32px] p-8 shadow-[0_0_80px_rgba(255,127,91,0.4)] text-center space-y-5 animate-scale-up">
        
        {/* Top Floating Badge Icon with Glowing Ring */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          
          {/* Animated Glowing Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] animate-spin-slow opacity-80 blur-sm" />
          
          {/* Solid Ring Frame */}
          <div className="relative w-24 h-24 rounded-full bg-[#0A1316] border-4 border-[#FF7F5B] flex items-center justify-center shadow-[0_0_40px_rgba(255,127,91,0.8)]">
            <span className="text-5xl transform hover:scale-110 transition-transform">🌱</span>
          </div>

          {/* Top Right Mini Sparkle Badge */}
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FF7F5B] to-[#E66795] p-2 rounded-full border-2 border-[#0A1316] shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Semente Plantada 🌸
          </h2>
          <p className="text-xs text-[#FF7F5B] font-bold uppercase tracking-widest">
            Conquista Desbloqueada!
          </p>
        </div>

        {/* Welcoming Message Box */}
        <div className="bg-[#060C0E]/80 border border-white/10 p-5 rounded-2xl space-y-2 text-slate-200 text-xs sm:text-sm leading-relaxed text-left">
          <p className="font-semibold text-white">
            Parabéns, {firstName}! 💖
          </p>
          <p className="text-slate-300">
            Você acabou de plantar sua primeira semente na nossa comunidade. 
            Esta conquista representa o início de uma caminhada com mais acolhimento, leveza e trocas reais.
          </p>
        </div>

        {/* VOCÊ GANHOU 25 PONTOS! */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/50 text-[#FF7F5B] text-xs sm:text-sm font-black uppercase tracking-wider shadow-inner">
          <Award className="w-4 h-4 text-[#FF7F5B]" />
          <span>VOCÊ GANHOU 25 PONTOS!</span>
        </div>

        {/* Motivational Tip */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#FFD166]">
          <Heart className="w-4 h-4 text-[#E66795] fill-current shrink-0" />
          <span>Sua jornada com a gente começa agora!</span>
        </div>

        {/* Claim / Action Button */}
        <button
          onClick={handleClaimReward}
          className="w-full bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] hover:opacity-95 text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-[0_10px_30px_rgba(255,127,91,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider group transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>Começar Minha Jornada ✨</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>

    </div>
  );
};

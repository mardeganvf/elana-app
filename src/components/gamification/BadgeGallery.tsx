import React from 'react';
import { Badge } from '../../types';
import { ALL_BADGES } from '../../data/gamificationData';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';

interface BadgeGalleryProps {
  unlockedBadges?: any[]; // Badges unlocked by the target user
  unlockedBadgeIds?: string[];
  onlyUnlocked?: boolean; // If true (for public profiles), show flat grid of unlocked badges without Elanas rewards
  hideHeaderTitle?: boolean;
}

export const getUnlockedBadgesCount = (unlockedBadges: any[] = [], unlockedBadgeIds: string[] = []) => {
  const unlockedSet = new Set<string>([
    ...unlockedBadges.map(b => b.id || ''),
    ...unlockedBadges.map(b => (b.title || b.name || '').toLowerCase().replace(/\s+/g, '-')),
    ...unlockedBadgeIds
  ]);

  return ALL_BADGES.filter(b => unlockedSet.has(b.id) || unlockedSet.has(b.title)).length;
};

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ unlockedBadges = [], unlockedBadgeIds = [], onlyUnlocked = false, hideHeaderTitle = false }) => {
  // Set of unlocked IDs for fast lookup
  const unlockedSet = new Set<string>([
    ...unlockedBadges.map(b => b.id || ''),
    ...unlockedBadges.map(b => (b.title || b.name || '').toLowerCase().replace(/\s+/g, '-')),
    ...unlockedBadgeIds
  ]);

  // Strict check if badge is unlocked
  const isBadgeUnlocked = (b: Badge) => {
    return unlockedSet.has(b.id) || unlockedSet.has(b.title);
  };

  // Helper to compute progress for quantitative badges
  const getBadgeProgress = (badge: Badge) => {
    if (!badge.targetCount) return null;

    let current = 0;
    if (isBadgeUnlocked(badge)) {
      current = badge.targetCount;
    }

    const percentage = Math.min(100, Math.round((current / badge.targetCount) * 100));
    return { current, target: badge.targetCount, percentage };
  };

  // Group badges by Category
  const categories = Array.from(new Set(ALL_BADGES.map(b => b.category)));
  const totalUnlocked = ALL_BADGES.filter(isBadgeUnlocked).length;

  if (onlyUnlocked) {
    const unlockedList = ALL_BADGES.filter(isBadgeUnlocked);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Award className="w-4 h-4 text-[#FF7F5B]" />
          <span>Conquistas Desbloqueadas ({unlockedList.length})</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {unlockedList.map(b => (
            <div
              key={b.id}
              className="relative p-2.5 bg-[#070D0F] border border-[#FF7F5B]/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-sm hover:border-[#FF7F5B] transition-all group cursor-pointer"
            >
              <span className="text-2xl filter drop-shadow">{b.icon}</span>
              <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{b.title}</span>

              {/* Hover Tooltip Popover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[99999] w-56 p-3 bg-[#0D1619] border border-[#FF7F5B]/50 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 text-left space-y-1.5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base">{b.icon}</span>
                    <span className="text-xs font-bold text-white truncate">{b.title}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#FF7F5B] bg-[#FF7F5B]/10 px-2 py-0.5 rounded-full border border-[#FF7F5B]/20 shrink-0">
                    +{b.rewardXp} XP
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
                  {b.description}
                </p>
                <div className="pt-0.5 flex items-center justify-between text-[9px] font-bold">
                  <span className="text-emerald-400">✓ Conquista Desbloqueada</span>
                  <span className="text-slate-400 uppercase tracking-wider">{b.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Banner Stats */}
      {!hideHeaderTitle && (
        <div className="bg-gradient-to-r from-[#101B1E] via-[#152428] to-[#101B1E] border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E66795] to-[#FF7F5B] flex items-center justify-center text-white shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Galeria de Conquistas da Elana 🏆
              </h2>
              <p className="text-xs text-slate-300">
                Passe o mouse em qualquer conquista para ler seu significado e saber como desbloquear.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#070D0F] px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Desbloqueado</span>
              <span className="text-sm font-black text-white">{totalUnlocked} de {ALL_BADGES.length} Conquistas</span>
            </div>
          </div>
        </div>
      )}

      {/* Badges Categorized Grid */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryBadges = ALL_BADGES.filter(b => b.category === category);
          const categoryUnlockedCount = categoryBadges.filter(isBadgeUnlocked).length;

          return (
            <div key={category} className="bg-[#101B1E]/80 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
              
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7F5B]" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {category}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {categoryUnlockedCount}/{categoryBadges.length}
                </span>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categoryBadges.map(badge => {
                  const unlocked = isBadgeUnlocked(badge);
                  const progress = getBadgeProgress(badge);

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-2 group cursor-pointer ${
                        unlocked
                          ? 'bg-[#070D0F] border-[#FF7F5B]/50 hover:border-[#FF7F5B] shadow-md hover:scale-[1.02]'
                          : 'bg-[#070D0F]/50 border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                      }`}
                    >
                      {/* Hover Tooltip Popover (Floating Card) */}
                      <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-[99999] w-60 p-3.5 bg-[#070D0F] border border-[#FF7F5B]/50 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 text-left space-y-2 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl">{badge.icon}</span>
                            <span className="text-xs font-bold text-white truncate">{badge.title}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-[#FF7F5B] bg-[#FF7F5B]/15 px-2.5 py-0.5 rounded-full border border-[#FF7F5B]/30 shrink-0">
                            +{badge.rewardXp} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-normal">
                          {badge.description}
                        </p>

                        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-bold">
                          <span className={unlocked ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                            {unlocked ? '✨ Conquista Liberada' : '🔒 Bloqueada'}
                          </span>
                          <span className="text-slate-400 uppercase tracking-wider text-[9px]">{badge.category}</span>
                        </div>
                      </div>

                      {/* Badge Icon Container */}
                      <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
                        <span className={`text-2xl transition-transform ${unlocked ? 'group-hover:scale-110' : 'filter grayscale opacity-50'}`}>
                          {badge.icon}
                        </span>

                        {!unlocked && (
                          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </div>
                        )}

                        {unlocked && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border-2 border-[#070D0F]">
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Badge Title & Reward */}
                      <div className="space-y-0.5 min-w-0 w-full">
                        <h4 className={`text-xs font-bold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                          {badge.title}
                        </h4>
                        <span className="text-[10px] font-extrabold text-[#FF7F5B] block">
                          +{badge.rewardXp} XP
                        </span>
                      </div>

                      {/* Optional Progress Bar for Locked Quantitative Badges */}
                      {!unlocked && progress && (
                        <div className="w-full space-y-1 pt-1">
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#E66795] to-[#FF7F5B] h-full transition-all duration-500"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 block text-right">
                            {progress.current}/{progress.target} {badge.unitLabel}
                          </span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

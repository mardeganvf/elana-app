import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '../../types';
import { ALL_BADGES } from '../../data/gamificationData';
import { Award, Lock, CheckCircle2, Sparkles, X, Heart, HelpCircle, ArrowRight } from 'lucide-react';

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

export const getHowToUnlock = (badge: Badge): string => {
  const instructions: Record<string, string> = {
    b1: 'Faça seu cadastro e entre no Elana App pela primeira vez.',
    b2: 'Complete as informações do seu perfil, bio e filhos na aba Perfil.',
    b3: 'Ative o botão de notificações na página do seu Perfil.',
    b4: 'Assista ao primeiro vídeo em qualquer uma das 6 Jornadas Guiadas.',
    b5: 'Conclua 25% de todas as aulas de uma jornada de conhecimento.',
    b6: 'Conclua 50% de todas as aulas de uma jornada de conhecimento.',
    b7: 'Conclua 100% das aulas de uma jornada e emita seu certificado.',
    b8: 'Aproveite uma aula em formato de áudio enquanto realiza suas tarefas.',
    b9: 'Escreva e salve sua primeira reflexão na aba de Anotações da aula.',
    b10: 'Pesquise e encontre um conteúdo na caixa de busca da plataforma.',
    b11: 'Registre seu 1º check-in de sentimentos na aba Comunidade.',
    b12: 'Registre a emoção "Sem Energia" no seu check-in diário.',
    b13: 'Registre a emoção "Com Esperança" no seu check-in diário.',
    b14: 'Registre a emoção "Celebrando" no seu check-in diário.',
    b15: 'Registre a emoção "Precisando de Luz" no seu check-in diário.',
    b16: 'Acumule 10 check-ins emocionais registrados ao longo dos dias.',
    b17: 'Acumule 20 check-ins emocionais registrados ao longo dos dias.',
    b18: 'Acumule 30 check-ins emocionais registrados ao longo dos dias.',
    b19: 'Acumule 60 check-ins emocionais registrados ao longo dos dias.',
    b20: 'Acumule 90 check-ins emocionais registrados ao longo dos dias.',
    b21: 'Abra e visualize seu Diário de Emoções na barra de navegação.',
    b22: 'Ative o Modo Noturno de Amamentação durante a madrugada.',
    b23: 'Complete 1 ciclo de 60 segundos no exercício de Respiro.',
    b24: 'Acesse o aplicativo em 10 dias diferentes.',
    b25: 'Acesse o aplicativo em 20 dias diferentes.',
    b26: 'Acesse o aplicativo em 30 dias diferentes.',
    b27: 'Acesse o aplicativo em 60 dias diferentes.',
    b28: 'Acesse o aplicativo em 90 dias diferentes.',
    b29: 'Publique seu primeiro tópico na Comunidade.',
    b30: 'Publique um relato sincero no Confessionário Anônimo.',
    b31: 'Interaja com um post ou comentário na sala Cantinho da Mel.',
    b32: 'Interaja com um post ou comentário na sala Espaço a Dois.',
    b33: 'Interaja com um post ou comentário na sala Cuidando de Quem Cuida.',
    b34: 'Visite e interaja em todas as 4 salas da Comunidade.',
    b35: 'Experimente usar todos os tipos de reações acolhedoras nos posts.',
    b36: 'Envie sua primeira resposta ou comentário acolhendo outro pai/mãe.',
    b37: 'Responda e acolha publicações de 5 pessoas diferentes.',
    b38: 'Envie 25 comentários e palavras de apoio na Comunidade.',
    b39: 'Apoie 100 membros com respostas carinhosas na Comunidade.',
    b40: 'Apoie 250 membros com respostas carinhosas na Comunidade.',
    b41: 'Apoie 500 membros com respostas carinhosas na Comunidade.',
    b42: 'Vote na sua primeira enquete comunitária.',
    b43: 'Participe e vote em 5 enquetes diferentes.',
    b44: 'Participe e vote em 10 enquetes diferentes.',
    b45: 'Participe e vote em 25 enquetes diferentes.',
    b46: 'Participe e vote em 50 enquetes diferentes.',
    b47: 'Participe e vote em 100 enquetes diferentes.',
    b48: 'Receba seu primeiro carinho ou reação em uma postagem sua.',
    b49: 'Receba 50 reações acumuladas nas suas postagens.',
    b50: 'Receba 250 reações acumuladas nas suas postagens.',
    b51: 'Receba 500 carinhos e reações na Comunidade.',
    b52: 'Receba 1.000 reações acumuladas nas suas postagens.',
    b53: 'Receba 2.500 reações acumuladas nas suas postagens.',
    b54: 'Acompanhe a jornada de outro membro na Comunidade.',
    b55: 'Tenha outros membros acompanhando seu perfil na aldeia.',
    b56: 'Escreva um depoimento carinhoso no perfil de outro membro.',
    b57: 'Receba um depoimento carinhoso publicado no seu perfil.'
  };

  if (instructions[badge.id]) {
    return instructions[badge.id];
  }

  if (badge.targetCount && badge.unitLabel) {
    return `Complete ${badge.targetCount} ${badge.unitLabel} na plataforma para desbloquear.`;
  }

  return badge.description;
};

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ 
  unlockedBadges = [], 
  unlockedBadgeIds = [], 
  onlyUnlocked = false, 
  hideHeaderTitle = false 
}) => {
  // Selected badge for interactive detail modal
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

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
      <>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Award className="w-4 h-4 text-[#FF7F5B]" />
            <span>Conquistas Desbloqueadas ({unlockedList.length})</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
            {unlockedList.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                className="relative p-2.5 bg-[#070D0F] border border-[#FF7F5B]/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-sm hover:border-[#FF7F5B] transition-all group cursor-pointer active:scale-95"
              >
                <span className="text-2xl filter drop-shadow">{b.icon}</span>
                <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{b.title}</span>

                {/* Hover Tooltip Popover */}
                <div className="hidden sm:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[99999] w-56 p-3 bg-[#0D1619] border border-[#FF7F5B]/50 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 text-left space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base">{b.icon}</span>
                      <span className="text-xs font-bold text-white truncate">{b.title}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#FF7F5B] bg-[#FF7F5B]/10 px-2 py-0.5 rounded-full border border-[#FF7F5B]/20 shrink-0">
                      +{b.rewardXp} pontos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
                    {b.description}
                  </p>
                  <div className="pt-0.5 flex items-center justify-between text-[9px] font-bold">
                    <span className="text-emerald-400">✓ Desbloqueada</span>
                    <span className="text-slate-400 uppercase tracking-wider">{b.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Badge Detail Modal */}
        {selectedBadge && renderBadgeDetailModal(selectedBadge, isBadgeUnlocked(selectedBadge), getBadgeProgress(selectedBadge), () => setSelectedBadge(null))}
      </>
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
                Toque ou passe o mouse em qualquer conquista para ver detalhes e como desbloquear.
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

      {/* Badges Categorized Containers */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryBadges = ALL_BADGES.filter(b => b.category === category);
          const categoryUnlockedCount = categoryBadges.filter(isBadgeUnlocked).length;

          return (
            <div key={category} className="bg-[#101B1E] border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 shadow-md">
              
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7F5B]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                    {category}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#FFD166] bg-[#FFD166]/10 px-2.5 py-0.5 rounded-full border border-[#FFD166]/20">
                    {categoryUnlockedCount}/{categoryBadges.length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold md:hidden">
                    (deslize →)
                  </span>
                </div>
              </div>

              {/* ── MOBILE: Thematic Category Horizontal Slider ── */}
              <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
                {categoryBadges.map(badge => {
                  const unlocked = isBadgeUnlocked(badge);

                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`shrink-0 snap-start w-32 p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center space-y-2 transition-all cursor-pointer active:scale-95 ${
                        unlocked
                          ? 'bg-gradient-to-b from-[#152428] to-[#0D181A] border-[#FF7F5B]/50 shadow-md shadow-[#FF7F5B]/10'
                          : 'bg-[#070D0F]/80 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="relative">
                        <span className={`text-3xl filter drop-shadow ${unlocked ? '' : 'grayscale opacity-40'}`}>
                          {badge.icon}
                        </span>
                        {unlocked ? (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070D0F]" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 w-full">
                        <h4 className={`text-[11px] font-bold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                          {badge.title}
                        </h4>
                        <span className="text-[10px] font-black text-[#FF7F5B] block mt-0.5">
                          +{badge.rewardXp} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── DESKTOP: Multi-column Categorized Grid ── */}
              <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categoryBadges.map(badge => {
                  const unlocked = isBadgeUnlocked(badge);
                  const progress = getBadgeProgress(badge);

                  return (
                    <div
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
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
                            +{badge.rewardXp} pontos
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-normal">
                          {badge.description}
                        </p>

                        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-bold">
                          <span className={unlocked ? 'text-emerald-400 flex items-center gap-1' : 'text-slate-400 flex items-center gap-1'}>
                            {unlocked ? '✨ Conquista Liberada' : '🔒 Bloqueada (Clique p/ ver)'}
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
                          +{badge.rewardXp} pontos
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

      {/* ── Interactive Badge Detail Modal (Mobile Bottom Sheet + Desktop Centered) ── */}
      {selectedBadge && renderBadgeDetailModal(
        selectedBadge, 
        isBadgeUnlocked(selectedBadge), 
        getBadgeProgress(selectedBadge), 
        () => setSelectedBadge(null)
      )}

    </div>
  );
};

// Helper renderer for Badge Detail Modal / Bottom Sheet
function renderBadgeDetailModal(
  badge: Badge, 
  isUnlocked: boolean, 
  progress: { current: number; target: number; percentage: number } | null, 
  onClose: () => void
) {
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-end md:items-center justify-center select-none overflow-hidden text-white">
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Radial Glow Rays */}
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-[#E66795]/20 to-[#FF7F5B]/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Sheet / Modal Container */}
      <div className="relative z-10 w-full md:max-w-md bg-[#101B1E] border border-white/15 md:rounded-3xl rounded-t-[32px] p-6 sm:p-7 pb-safe shadow-2xl space-y-5 animate-slide-up md:animate-scale-up overflow-y-auto max-h-[92dvh] md:max-h-[90vh]">
        
        {/* Mobile Drag Handle */}
        <div className="md:hidden w-10 h-1 bg-white/20 rounded-full mx-auto -mt-2 mb-2" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Icon Hero Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-[#070D0F] border-2 border-white/10 shadow-xl">
            {isUnlocked && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] animate-pulse opacity-40 blur-sm" />
            )}
            
            <span className={`text-5xl select-none ${isUnlocked ? '' : 'filter grayscale opacity-50'}`}>
              {badge.icon}
            </span>

            {isUnlocked ? (
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-[#101B1E] shadow-md">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              <div className="absolute -top-1 -right-1 bg-slate-800 text-slate-300 p-1.5 rounded-full border-2 border-[#101B1E] shadow-md">
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {badge.title}
            </h3>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-black text-[#FF7F5B] bg-[#FF7F5B]/15 px-3 py-1 rounded-full border border-[#FF7F5B]/30">
                +{badge.rewardXp} pontos
              </span>
              <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {badge.category}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: O que é esta conquista (Significado) */}
        <div className="bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2 text-left">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            ✨ Significado & Acolhimento:
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            "{badge.description}"
          </p>
        </div>

        {/* Section 2: Como conquistar / Status Atual */}
        <div className="bg-[#0D181A] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3 text-left">
          <span className="text-[10px] font-extrabold text-[#FF7F5B] uppercase tracking-wider block">
            🎯 Como Conquistar:
          </span>

          {isUnlocked ? (
            <div className="flex items-center gap-2.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Parabéns! Você já conquistou e garantiu essa insígnia na sua caminhada. 💖</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {getHowToUnlock(badge)}
              </p>

              {/* Quantitative progress if applicable */}
              {progress && (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Seu Progresso Atual:</span>
                    <span className="text-[#FFD166]">
                      {progress.current} de {progress.target} {badge.unitLabel} ({progress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#FF7F5B] to-[#FFD166] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          Entendi ✨
        </button>

      </div>
    </div>,
    document.body
  );
}


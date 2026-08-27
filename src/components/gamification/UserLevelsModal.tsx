import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { USER_LEVELS, getLevelFromXP } from '../../data/gamificationData';

interface UserLevelsModalProps {
  currentXp: number;
  onClose: () => void;
}

export const UserLevelsModal: React.FC<UserLevelsModalProps> = ({ currentXp, onClose }) => {
  const currentLevelInfo = getLevelFromXP(currentXp);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#101B1E] rounded-3xl max-w-2xl w-full border border-white/15 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#FF7F5B]/20 via-[#101B1E] to-[#8A9A5B]/20 border-b border-white/10 shrink-0 relative">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-10"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#FF7F5B]/20 rounded-2xl border border-[#FF7F5B]/30 text-[#FF7F5B]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#FF7F5B] uppercase tracking-wider block">
                SUA EVOLUÇÃO
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Níveis de Desenvolvimento
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Conforme você marca presença, assiste aos vídeos e troca carinho na comunidade, você acumula <strong>pontos</strong> e sua árvore ganha vida e força!
          </p>

          {/* Current User Status Summary */}
          <div className="mt-4 p-3.5 bg-[#070D0F] rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevelInfo.icon}</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Seu Nível Atual:</span>
                <span className="font-black text-white text-sm">{currentLevelInfo.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FFD166]/15 text-[#FFD166] border border-[#FFD166]/30 px-3 py-1.5 rounded-full font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{currentXp} pontos conquistados</span>
            </div>
          </div>
        </div>

        {/* Scrollable Levels Timeline */}
        <div className="p-6 sm:p-8 space-y-3 overflow-y-auto custom-scrollbar flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Trilha das 15 Árvores de Evolução</span>
            <span>Pontos Necessários</span>
          </div>

          {USER_LEVELS.map((level) => {
            const isCurrent = level.level === currentLevelInfo.level;
            const isUnlocked = currentXp >= level.minXp;
            const thresholdPoints = level.minXp === 0 ? 0 : level.minXp - 1;

            return (
              <div
                key={level.level}
                className={`p-4 rounded-2xl border transition-all relative flex flex-col gap-2 ${
                  isCurrent
                    ? 'bg-[#162327] border-[#FF7F5B] shadow-xl scale-[1.01]'
                    : isUnlocked
                    ? 'bg-[#070D0F] border-emerald-500/30'
                    : 'bg-[#070D0F]/60 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white/5 rounded-xl shrink-0">{level.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400">
                          Nível {String(level.level).padStart(2, '0')}
                        </span>
                        <h4 className="text-sm font-black text-white">{level.title}</h4>

                        {isCurrent && (
                          <span className="text-[9px] font-extrabold bg-[#FF7F5B] text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                            <Sparkles className="w-2.5 h-2.5 fill-current" /> Você está aqui!
                          </span>
                        )}

                        {isUnlocked && !isCurrent && (
                          <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Alcançado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-black text-[#FFD166] bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {thresholdPoints.toLocaleString('pt-BR')} pontos
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed pt-1 pl-1 border-t border-white/5">
                  "{level.description}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070D0F] border-t border-white/10 shrink-0 text-center">
          <button
            onClick={onClose}
            className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md"
          >
            VOLTAR PARA O PERFIL
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

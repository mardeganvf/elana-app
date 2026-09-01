import React, { useState } from 'react';
import { Vote, X, CheckCircle2, Sparkles, ChevronRight, BarChart2 } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { CommunityPoll, PollOption } from '../../types';

interface CommunityPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll?: CommunityPoll | null;
}

export const CommunityPollModal: React.FC<CommunityPollModalProps> = ({
  isOpen,
  onClose,
  poll: propPoll
}) => {
  const { activePoll, userVotedPollsMap, votePoll } = useCommunity();
  const poll = propPoll || activePoll;
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !poll || poll.status !== 'open') return null;

  const votedOptionId = (userVotedPollsMap && poll.id && userVotedPollsMap[poll.id]) || poll.userVotedOptionId;
  const hasVoted = !!votedOptionId;

  // Garantir que options seja sempre um array válido de objetos { id, text, votesCount }
  let rawOptions: any = poll.options;
  if (typeof rawOptions === 'string') {
    try {
      rawOptions = JSON.parse(rawOptions);
    } catch {
      rawOptions = [];
    }
  }
  if (!Array.isArray(rawOptions)) {
    rawOptions = [];
  }

  const safeOptions: PollOption[] = rawOptions.map((option: any, idx: number): PollOption => {
    if (typeof option === 'string') {
      return { id: `opt-${idx + 1}`, text: option, votesCount: 0 };
    }
    return {
      id: option?.id || `opt-${idx + 1}`,
      text: option?.text || '',
      votesCount: Number(option?.votesCount || 0)
    };
  });

  if (safeOptions.length === 0) return null;

  const handleVote = async (optionId: string) => {
    if (hasVoted || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await votePoll(poll.id, optionId);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = Math.max(1, poll.totalVotes || 0);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-[#101B1E] to-[#070D0F] border border-[#FF7F5B]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-white relative overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7F5B]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/40 text-[#FF7F5B] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Vote className="w-3.5 h-3.5 animate-pulse" />
              <span>Sua Voz Importa</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 relative z-10">
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
            <span className="text-[#FF7F5B] font-black uppercase tracking-wider mr-1.5">ENQUETE:</span>
            <span>{poll.title}</span>
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 relative z-10">
          {safeOptions.map((option: PollOption) => {
            const isSelected = votedOptionId === option.id;
            const percentage = Math.round((option.votesCount / total) * 100);

            if (hasVoted) {
              return (
                <div
                  key={option.id}
                  className={`relative overflow-hidden rounded-2xl p-4 border transition-all text-xs select-none ${
                    isSelected
                      ? 'bg-[#FF7F5B]/20 border-[#FF7F5B] text-white font-bold shadow-lg'
                      : 'bg-[#070D0F] border-white/10 text-slate-300'
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 rounded-2xl ${
                      isSelected
                        ? 'bg-[#FF7F5B]/30 border-r border-[#FF7F5B]'
                        : 'bg-white/5'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#FF7F5B] shrink-0" />
                      )}
                      <span className="leading-snug">{option.text}</span>
                    </div>
                    <span className={`font-mono font-bold shrink-0 text-sm ${isSelected ? 'text-[#FF7F5B]' : 'text-slate-400'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isSubmitting}
                className="w-full text-left p-4 rounded-2xl bg-[#070D0F] hover:bg-[#FF7F5B]/15 border border-white/10 hover:border-[#FF7F5B]/60 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group/btn cursor-pointer active:scale-[0.99] shadow-md"
              >
                <span className="leading-snug text-slate-200 group-hover/btn:text-white transition-colors">
                  {option.text}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/5 group-hover/btn:bg-[#FF7F5B] group-hover/btn:text-white text-slate-400 flex items-center justify-center transition-all shrink-0 ml-3">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10 text-xs">
          {hasVoted ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Voto registrado com sucesso! ✨</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Sua opinião fortalece nossa comunidade</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            {hasVoted ? 'Concluir' : 'Responder mais tarde'}
          </button>
        </div>
      </div>
    </div>
  );
};

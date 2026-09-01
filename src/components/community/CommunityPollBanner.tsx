import React, { useState } from 'react';
import { Vote, CheckCircle2, BarChart2, Sparkles, ChevronRight } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { CommunityPoll } from '../../types';

interface CommunityPollBannerProps {
  poll?: CommunityPoll | null;
}

export const CommunityPollBanner: React.FC<CommunityPollBannerProps> = ({ poll: propPoll }) => {
  const { activePoll, userVotedPollsMap, votePoll } = useCommunity();
  const poll = propPoll || activePoll;
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!poll || poll.status !== 'open') return null;

  // Garantir que userVotedPollsMap seja seguro
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

  const safeOptions = rawOptions.map((option: any, idx: number) => {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = Math.max(1, poll.totalVotes || 0);

  return (
    <div className="bg-gradient-to-br from-[#101B1E] via-[#0E1618] to-[#070D0F] border border-[#FF7F5B]/30 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden animate-fade-in group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7F5B]/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/40 text-[#FF7F5B] text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
            <Vote className="w-3 h-3 animate-pulse" />
            <span>Sua Voz Importa</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <BarChart2 className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>{poll.totalVotes || 0} {(poll.totalVotes || 0) === 1 ? 'voto' : 'votos'}</span>
        </div>
      </div>

      {/* Question Title */}
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
          {poll.title}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {safeOptions.map((option) => {
          const isSelected = votedOptionId === option.id;
          const percentage = Math.round((option.votesCount / total) * 100);

          if (hasVoted) {
            return (
              <div
                key={option.id}
                className={`relative overflow-hidden rounded-2xl p-3 sm:p-3.5 border transition-all text-xs select-none ${
                  isSelected
                    ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] text-white font-bold'
                    : 'bg-[#070D0F]/80 border-white/10 text-slate-300'
                }`}
              >
                {/* Background Percentage Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 rounded-2xl ${
                    isSelected
                      ? 'bg-[#FF7F5B]/25 border-r border-[#FF7F5B]/60'
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
                  <span className={`font-mono font-bold shrink-0 ${isSelected ? 'text-[#FF7F5B]' : 'text-slate-400'}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          }

          // Unvoted state: Clickable Option Button
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isSubmitting}
              className="w-full text-left p-3 sm:p-3.5 rounded-2xl bg-[#070D0F]/90 hover:bg-[#FF7F5B]/15 border border-white/10 hover:border-[#FF7F5B]/50 text-white text-xs font-semibold transition-all flex items-center justify-between group/btn cursor-pointer active:scale-[0.99]"
            >
              <span className="leading-snug text-slate-200 group-hover/btn:text-white transition-colors">
                {option.text}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/5 group-hover/btn:bg-[#FF7F5B] group-hover/btn:text-white text-slate-400 flex items-center justify-center transition-all shrink-0 ml-2">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Feedback */}
      {hasVoted ? (
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Voto registrado com sucesso! ✨</span>
          </div>
          <span className="text-[10px] text-slate-500">Obrigado por fortalecer nossa comunidade</span>
        </div>
      ) : (
        <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FFD166]" />
          <span>Sua opinião fortalece a nossa comunidade.</span>
        </div>
      )}
    </div>
  );
};

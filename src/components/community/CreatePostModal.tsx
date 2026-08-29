import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCommunity } from '../../context/CommunityContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { TRANSVERSAL_ROOMS, AGE_BRACKET_ROOMS } from '../../data/communityData';
import { EmotionalIntention } from '../../types';
import { X, Send, Lock, EyeOff } from 'lucide-react';

export type ActiveSelection = 
  | { type: 'jornada'; journeyId: string; subOption: 'ajuda' | 'celebrar' | 'desabafar' | 'abertas' }
  | { type: 'geral'; roomId: string }
  | { type: 'idade'; ageId: string }
  | null;

interface CreatePostModalProps {
  onClose: () => void;
  activeSelection?: ActiveSelection;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  onClose,
  activeSelection
}) => {
  const { createPost } = useCommunity();

  // Resolve current active room context
  const postType: 'jornada' | 'transversal' | 'idade' = activeSelection?.type === 'geral' 
    ? 'transversal' 
    : activeSelection?.type === 'idade' 
    ? 'idade' 
    : 'jornada';

  const selectedJourneyId = activeSelection?.type === 'jornada' ? activeSelection.journeyId : 'pais-recem-nascidos';
  const selectedTransversalId = activeSelection?.type === 'geral' ? activeSelection.roomId : 'confessionario';
  const selectedAgeId = activeSelection?.type === 'idade' ? activeSelection.ageId : '0-2';

  // Compute default emotional intention if in journey
  const initialIntention: EmotionalIntention = activeSelection?.type === 'jornada'
    ? (activeSelection.subOption === 'ajuda' ? 'ajuda' : activeSelection.subOption === 'celebrar' ? 'celebrar' : 'desabafar')
    : 'desabafar';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isConfessionario = postType === 'transversal' && selectedTransversalId === 'confessionario';

  // Compute location name for the subtitle
  const getLocationName = () => {
    if (postType === 'jornada') {
      const j = JOURNEYS_DATA.find(item => item.id === selectedJourneyId);
      const baseTitle = j ? j.title : 'Jornada';
      if (activeSelection?.type === 'jornada') {
        const subLabels: Record<string, string> = {
          ajuda: 'Preciso de Ajuda',
          celebrar: 'Vamos Celebrar',
          desabafar: 'Preciso Desabafar',
          abertas: 'Abertas pela Comunidade'
        };
        if (activeSelection.subOption && subLabels[activeSelection.subOption]) {
          return `${baseTitle} - ${subLabels[activeSelection.subOption]}`;
        }
      }
      return baseTitle;
    }
    if (postType === 'transversal') {
      const r = TRANSVERSAL_ROOMS.find(item => item.id === selectedTransversalId);
      return r ? r.name : 'Sala Transversal';
    }
    if (postType === 'idade') {
      const a = AGE_BRACKET_ROOMS.find(item => item.id === selectedAgeId);
      return a ? a.name : '0–2 anos';
    }
    return 'Comunidade Elana';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost({
      journeyId: postType === 'jornada' ? selectedJourneyId : undefined,
      transversalRoomId: postType === 'transversal' ? selectedTransversalId : undefined,
      ageBracketId: postType === 'idade' ? selectedAgeId : undefined,
      emotionalIntention: postType === 'jornada' ? initialIntention : undefined,
      moduleTopic: 'Geral',
      title: title.trim(),
      content: content.trim(),
      isAnonymous: isConfessionario
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center md:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-[#101B1E] md:rounded-3xl rounded-t-[32px] max-w-lg w-full p-6 sm:p-8 pb-safe shadow-2xl border border-white/15 text-white space-y-5 max-h-[92dvh] md:max-h-[90vh] overflow-y-auto animate-slide-up md:animate-scale-up">
        
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pb-2 -mt-2">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Clean Header with Subtitle Text Below Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] text-white flex items-center justify-center text-xl shadow-md shrink-0">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Criar Novo Tópico
              </h3>
              <p className="text-sm font-medium text-slate-300 mt-0.5">
                em: <span className="text-[#FF7F5B] font-bold">{getLocationName()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ml-2"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {/* Confessionario Anonymous Callout */}
          {isConfessionario && (
            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-purple-200">
              <EyeOff className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Postagem 100% anônima com apelido aleatório.</span>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assunto:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Meu bebê falou a primeira palavra hoje."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-white/15 text-base sm:text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Mensagem:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Escreva com o coração. Este é um espaço de acolhimento mútuo."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-white/15 text-base sm:text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] transition-all resize-none"
            />
          </div>

          {/* Clean Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#8A9A5B]" />
              <span>Sua segurança importa.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                DIVIDIR COM A COMUNIDADE
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};

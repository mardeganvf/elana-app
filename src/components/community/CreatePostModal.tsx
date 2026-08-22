import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCommunity } from '../../context/CommunityContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { TRANSVERSAL_ROOMS, AGE_BRACKET_ROOMS, EMOTIONAL_INTENTIONS } from '../../data/communityData';
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

  const [emotionalIntention, setEmotionalIntention] = useState<EmotionalIntention>(initialIntention);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isConfessionario = postType === 'transversal' && selectedTransversalId === 'confessionario';

  // Compute location name for the header badge
  const getLocationName = () => {
    if (postType === 'jornada') {
      const j = JOURNEYS_DATA.find(item => item.id === selectedJourneyId);
      return j ? `Jornada: ${j.title}` : 'Jornada Oficial';
    }
    if (postType === 'transversal') {
      const r = TRANSVERSAL_ROOMS.find(item => item.id === selectedTransversalId);
      return r ? `Sala: ${r.name}` : 'Sala Transversal';
    }
    if (postType === 'idade') {
      const a = AGE_BRACKET_ROOMS.find(item => item.id === selectedAgeId);
      return a ? `Faixa Etária: ${a.name} (${a.range})` : 'Faixa Etária';
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
      emotionalIntention: postType === 'jornada' ? emotionalIntention : undefined,
      moduleTopic: 'Geral',
      title: title.trim(),
      content: content.trim(),
      isAnonymous: isConfessionario
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-[#101B1E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-white m-auto space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Clean Header with Forum Badge to the Right */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] text-white flex items-center justify-center text-xl shadow-md shrink-0">
              💬
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Criar Novo Tópico
              </h3>
              <span className="text-[11px] font-bold text-[#FF7F5B] bg-[#FF7F5B]/10 px-2.5 py-0.5 rounded-full border border-[#FF7F5B]/20">
                {getLocationName()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Emotional Intention Pills (Only for Journeys) */}
          {postType === 'jornada' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Intenção da Postagem:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EMOTIONAL_INTENTIONS.map(ei => (
                  <button
                    key={ei.id}
                    type="button"
                    onClick={() => setEmotionalIntention(ei.id as EmotionalIntention)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                      emotionalIntention === ei.id
                        ? 'border-[#FF7F5B] bg-[#FF7F5B]/20 text-white shadow-md font-extrabold'
                        : 'border-white/10 bg-[#070D0F] text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {ei.badge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confessionario Anonymous Callout */}
          {isConfessionario && (
            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-purple-200">
              <EyeOff className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Postagem 100% anônima (assinada como <em>Luz em Aprendizado #XXX</em>).</span>
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
              placeholder="Ex: Como encontrar oxigênio emocional em dias difíceis?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-2xl border border-white/15 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] transition-all"
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
              className="w-full p-3 rounded-2xl border border-white/15 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] transition-all resize-none"
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

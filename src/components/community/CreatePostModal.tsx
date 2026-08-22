import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { TRANSVERSAL_ROOMS, AGE_BRACKET_ROOMS, EMOTIONAL_INTENTIONS } from '../../data/communityData';
import { EmotionalIntention } from '../../types';
import { X, Send, Lock, EyeOff } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
  defaultTab?: 'jornadas' | 'transversais' | 'idades';
  defaultJourneyId?: string;
  defaultRoomId?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  onClose,
  defaultTab = 'jornadas',
  defaultJourneyId = 'pais-recem-nascidos',
  defaultRoomId = 'confessionario'
}) => {
  const { createPost } = useCommunity();

  const [postType, setPostType] = useState<'jornada' | 'transversal' | 'idade'>(
    defaultTab === 'transversais' ? 'transversal' : defaultTab === 'idades' ? 'idade' : 'jornada'
  );
  
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(defaultJourneyId);
  const [selectedTransversalId, setSelectedTransversalId] = useState<string>(defaultRoomId);
  const [selectedAgeId, setSelectedAgeId] = useState<string>('0-2');
  const [emotionalIntention, setEmotionalIntention] = useState<EmotionalIntention>('desabafar');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(postType === 'transversal' && selectedTransversalId === 'confessionario');

  const isConfessionario = postType === 'transversal' && selectedTransversalId === 'confessionario';

  const handleLocationSelect = (value: string) => {
    if (value.startsWith('jornada-')) {
      setPostType('jornada');
      setSelectedJourneyId(value.replace('jornada-', ''));
      setIsAnonymous(false);
    } else if (value.startsWith('transversal-')) {
      const roomId = value.replace('transversal-', '');
      setPostType('transversal');
      setSelectedTransversalId(roomId);
      setIsAnonymous(roomId === 'confessionario');
    } else if (value.startsWith('idade-')) {
      setPostType('idade');
      setSelectedAgeId(value.replace('idade-', ''));
      setIsAnonymous(false);
    }
  };

  const currentSelectValue = postType === 'jornada' 
    ? `jornada-${selectedJourneyId}`
    : postType === 'transversal'
    ? `transversal-${selectedTransversalId}`
    : `idade-${selectedAgeId}`;

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
      isAnonymous: isConfessionario || isAnonymous
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
      <div className="bg-[#101B1E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-white my-auto space-y-5">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] text-white flex items-center justify-center text-xl shadow-md">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Criar Novo Tópico
              </h3>
              <p className="text-xs text-slate-400">Espaço seguro de troca, acolhimento e empatia.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Streamlined Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Onde deseja publicar?
            </label>
            <select
              value={currentSelectValue}
              onChange={(e) => handleLocationSelect(e.target.value)}
              className="w-full p-3 rounded-2xl border border-white/15 text-xs bg-[#070D0F] text-white focus:outline-none focus:border-[#FF7F5B] transition-all cursor-pointer"
            >
              <optgroup label="Jornadas de Aprendizado">
                {JOURNEYS_DATA.map(j => (
                  <option key={`jornada-${j.id}`} value={`jornada-${j.id}`}>
                    Jornada: {j.title}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Salas de Acolhimento & Transversais">
                {TRANSVERSAL_ROOMS.map(r => (
                  <option key={`transversal-${r.id}`} value={`transversal-${r.id}`}>
                    {r.emoji} Sala: {r.name} {r.isAnonymous ? '(100% Anônima)' : ''}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Por Faixa Etária">
                {AGE_BRACKET_ROOMS.map(a => (
                  <option key={`idade-${a.id}`} value={`idade-${a.id}`}>
                    Faixa Etária: {a.name} ({a.range})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Emotional Intention Pills (Only for Journeys) */}
          {postType === 'jornada' && (
            <div className="space-y-1.5 pt-1">
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
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Título do Tópico:
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
              Sua Mensagem:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Escreva com o coração... Lembre-se que este é um espaço seguro de acolhimento mútuo."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-2xl border border-white/15 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] transition-all resize-none"
            />
          </div>

          {/* Clean Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#8A9A5B]" />
              <span>Espaço seguro e acolhedor</span>
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
                Publicar Tópico
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

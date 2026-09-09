import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCommunity, checkContentSensitivity } from '../../context/CommunityContext';
import { useToast } from '../../context/ToastContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { TRANSVERSAL_ROOMS, AGE_BRACKET_ROOMS } from '../../data/communityData';
import { EmotionalIntention } from '../../types';
import { X, Send, Lock, EyeOff } from 'lucide-react';

export type ActiveSelection = 
  | { type: 'jornada'; journeyId: string; subOption: EmotionalIntention }
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
  const { showToast } = useToast();

  // Resolve current active room context as dynamic state
  const [postType, setPostType] = useState<'jornada' | 'transversal' | 'idade'>(
    activeSelection?.type === 'geral' ? 'transversal' : activeSelection?.type === 'idade' ? 'idade' : 'jornada'
  );

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    activeSelection?.type === 'jornada' ? activeSelection.journeyId : 'pais-recem-nascidos'
  );
  const [selectedTransversalId, setSelectedTransversalId] = useState<string>(
    activeSelection?.type === 'geral' ? activeSelection.roomId : 'cantinho-mel'
  );
  const [selectedAgeId, setSelectedAgeId] = useState<string>(
    activeSelection?.type === 'idade' ? activeSelection.ageId : '0-2'
  );

  const [selectedIntention, setSelectedIntention] = useState<EmotionalIntention>(
    activeSelection?.type === 'jornada'
      ? (activeSelection.subOption || 'ajuda')
      : 'ajuda'
  );

  const [isChangingRoom, setIsChangingRoom] = useState<boolean>(!activeSelection);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isConfessionario = postType === 'transversal' && selectedTransversalId === 'confessionario';

  // Compute location name for the subtitle
  const getLocationName = () => {
    if (postType === 'jornada') {
      const j = JOURNEYS_DATA.find(item => item.id === selectedJourneyId);
      const baseTitle = j ? j.title : 'Jornada';
      const subLabels: Record<string, string> = {
        ajuda: 'Preciso de Ajuda',
        celebrar: 'Vamos Celebrar',
        desabafar: 'Preciso Desabafar',
        abertas: 'Abertas pela Comunidade'
      };
      if (subLabels[selectedIntention]) {
        return `${baseTitle} • ${subLabels[selectedIntention]}`;
      }
      return baseTitle;
    }
    if (postType === 'transversal') {
      const r = TRANSVERSAL_ROOMS.find(item => item.id === selectedTransversalId);
      return r ? `${r.emoji} ${r.name}` : 'Sala Geral';
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

    const fullText = `${title.trim()} ${content.trim()}`;
    const sensitivity = checkContentSensitivity(fullText);

    createPost({
      journeyId: postType === 'jornada' ? selectedJourneyId : undefined,
      transversalRoomId: postType === 'transversal' ? selectedTransversalId : undefined,
      ageBracketId: postType === 'idade' ? selectedAgeId : undefined,
      emotionalIntention: postType === 'jornada' ? selectedIntention : undefined,
      moduleTopic: 'Geral',
      title: title.trim(),
      content: content.trim(),
      isAnonymous: isConfessionario
    });

    if (sensitivity.isFlagged && sensitivity.type === 'vulnerabilidade') {
      showToast('info', 'Recebemos seu relato com carinho, mas notamos algo sensível. Nossa equipe está dando uma olhadinha na publicação. Você não está sozinha.');
    }

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

        {/* Room Selection Box */}
        {isChangingRoom ? (
          <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/15 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                Selecione a Sala de Destino:
              </label>
              {activeSelection && (
                <button 
                  type="button" 
                  onClick={() => setIsChangingRoom(false)} 
                  className="text-[11px] font-bold text-slate-400 hover:text-white"
                >
                  Concluir
                </button>
              )}
            </div>

            {/* Categorias: Jornadas | Geral | Idades */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setPostType('jornada')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  postType === 'jornada' ? 'bg-[#FF7F5B] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌿 Jornadas
              </button>
              <button
                type="button"
                onClick={() => setPostType('transversal')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  postType === 'transversal' ? 'bg-[#8A9A5B] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                💬 Geral
              </button>
              <button
                type="button"
                onClick={() => setPostType('idade')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  postType === 'idade' ? 'bg-[#E66795] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                👶 Idades
              </button>
            </div>

            {/* Opções de Jornada */}
            {postType === 'jornada' && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Jornada:
                  </label>
                  <select
                    value={selectedJourneyId}
                    onChange={(e) => setSelectedJourneyId(e.target.value)}
                    className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#FF7F5B]"
                  >
                    {JOURNEYS_DATA.map(j => (
                      <option key={j.id} value={j.id} className="bg-[#101B1E] text-white">
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subtópico / Intenção:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'ajuda' as const, label: 'Preciso de Ajuda', emoji: '🆘' },
                      { id: 'celebrar' as const, label: 'Vamos Celebrar', emoji: '🎉' },
                      { id: 'desabafar' as const, label: 'Preciso Desabafar', emoji: '💧' },
                      { id: 'abertas' as const, label: 'Abertas', emoji: '💬' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedIntention(opt.id)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                          selectedIntention === opt.id
                            ? 'bg-[#FF7F5B]/20 text-[#FF7F5B] border-[#FF7F5B]/50 shadow-sm'
                            : 'bg-[#101B1E] text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <span>{opt.emoji}</span>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Opções de Salas Gerais (Transversais) */}
            {postType === 'transversal' && (
              <div className="space-y-1.5 pt-1 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sala Geral:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TRANSVERSAL_ROOMS.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedTransversalId(r.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                        selectedTransversalId === r.id
                          ? 'bg-[#8A9A5B]/20 text-white border-[#8A9A5B]/60 shadow-sm'
                          : 'bg-[#101B1E] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opções de Faixa Etária (Idades) */}
            {postType === 'idade' && (
              <div className="space-y-1.5 pt-1 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Faixa Etária:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {AGE_BRACKET_ROOMS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAgeId(a.id)}
                      className={`flex items-center justify-center p-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedAgeId === a.id
                          ? 'bg-[#E66795]/20 text-white border-[#E66795]/60 shadow-sm'
                          : 'bg-[#101B1E] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[#070D0F] px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-xs text-slate-400 shrink-0">Postando em:</span>
              <span className="text-xs font-black text-white truncate">{getLocationName()}</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsChangingRoom(true)} 
              className="text-[11px] font-bold text-[#FF7F5B] hover:underline shrink-0"
            >
              Alterar
            </button>
          </div>
        )}

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

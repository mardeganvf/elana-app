import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { TRANSVERSAL_ROOMS, AGE_BRACKET_ROOMS, EMOTIONAL_INTENTIONS } from '../../data/communityData';
import { EmotionalIntention } from '../../types';
import { X, Send, Sparkles, ShieldCheck, EyeOff } from 'lucide-react';

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
  const [moduleTopic] = useState<string>('Geral');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(postType === 'transversal' && selectedTransversalId === 'confessionario');

  const selectedTransversalRoom = TRANSVERSAL_ROOMS.find(r => r.id === selectedTransversalId);
  const isConfessionario = postType === 'transversal' && selectedTransversalId === 'confessionario';

  const handleTransversalChange = (roomId: string) => {
    setSelectedTransversalId(roomId);
    if (roomId === 'confessionario') {
      setIsAnonymous(true);
    } else {
      setIsAnonymous(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost({
      journeyId: postType === 'jornada' ? selectedJourneyId : undefined,
      transversalRoomId: postType === 'transversal' ? selectedTransversalId : undefined,
      ageBracketId: postType === 'idade' ? selectedAgeId : undefined,
      emotionalIntention: postType === 'jornada' ? emotionalIntention : undefined,
      moduleTopic: postType === 'jornada' ? moduleTopic : undefined,
      title: title.trim(),
      content: content.trim(),
      isAnonymous: isConfessionario || isAnonymous
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#101B1E] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] text-white flex items-center justify-center font-black shadow-lg">
              💬
            </div>
            <div>
              <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Criar Novo Tópico na Comunidade
              </h3>
              <p className="text-xs text-slate-400">Tom acolhedor • Empatia antes de solução</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brandbook Guidelines Banner */}
        <div className="bg-[#003B46]/40 border border-[#003B46] p-3.5 rounded-2xl mb-5 text-xs text-slate-200 space-y-1">
          <span className="font-bold text-[#FFD166] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#8A9A5B]" /> Diretrizes de Convivência Elana:
          </span>
          <p className="text-[11px] leading-relaxed">
            Perguntar, não interrogar • Validar o sentimento antes de orientar • Sem julgamentos ou tons de autoridade ("você deve").
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Post Location Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Onde deseja publicar?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPostType('jornada')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  postType === 'jornada'
                    ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md'
                    : 'bg-[#070D0F] text-slate-400 border-white/10 hover:bg-white/5'
                }`}
              >
                Jornadas (6)
              </button>
              <button
                type="button"
                onClick={() => setPostType('transversal')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  postType === 'transversal'
                    ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md'
                    : 'bg-[#070D0F] text-slate-400 border-white/10 hover:bg-white/5'
                }`}
              >
                Salas Transversais
              </button>
              <button
                type="button"
                onClick={() => setPostType('idade')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  postType === 'idade'
                    ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md'
                    : 'bg-[#070D0F] text-slate-400 border-white/10 hover:bg-white/5'
                }`}
              >
                Por Idade
              </button>
            </div>
          </div>

          {/* Sub-selectors based on Post Location */}
          {postType === 'jornada' && (
            <div className="space-y-3 bg-[#070D0F] p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Selecione a Jornada:
                </label>
                <select
                  value={selectedJourneyId}
                  onChange={(e) => setSelectedJourneyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#101B1E] text-white focus:outline-none focus:border-[#FF7F5B]"
                >
                  {JOURNEYS_DATA.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.targetAudience})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Intenção Emocional da Postagem:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {EMOTIONAL_INTENTIONS.map(ei => (
                    <button
                      key={ei.id}
                      type="button"
                      onClick={() => setEmotionalIntention(ei.id as EmotionalIntention)}
                      className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                        emotionalIntention === ei.id
                          ? 'border-[#FF7F5B] bg-[#FF7F5B]/20 text-white shadow-sm'
                          : 'border-white/10 bg-[#101B1E] text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div>{ei.badge}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {postType === 'transversal' && (
            <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/10">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Selecione a Sala Transversal:
              </label>
              <select
                value={selectedTransversalId}
                onChange={(e) => handleTransversalChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#101B1E] text-white focus:outline-none focus:border-[#FF7F5B]"
              >
                {TRANSVERSAL_ROOMS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.emoji} {r.name} {r.isAnonymous ? '(100% Anônima)' : ''}
                  </option>
                ))}
              </select>
              {selectedTransversalRoom && (
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  "{selectedTransversalRoom.description}"
                </p>
              )}
            </div>
          )}

          {postType === 'idade' && (
            <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/10">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Selecione a Faixa Etária do Filho:
              </label>
              <select
                value={selectedAgeId}
                onChange={(e) => setSelectedAgeId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#101B1E] text-white focus:outline-none focus:border-[#FF7F5B]"
              >
                {AGE_BRACKET_ROOMS.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.range}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Anonymous Option Indicator for Confessionario */}
          {isConfessionario && (
            <div className="bg-purple-900/30 border border-purple-500/40 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-purple-200">
              <EyeOff className="w-5 h-5 text-purple-300 shrink-0" />
              <div>
                <strong className="block text-white">Sala Confessionário — Pseudônimo Automático:</strong>
                <span>Sua postagem será assinada publicamente como "Luz em Aprendizado #XXX" para preservar seu anonimato.</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Título do Tópico:
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Como encontrar oxigênio emocional em dias de exaustão?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Seu Relato ou Pergunta:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Escreva com o coração... Lembre-se que este é um espaço seguro de acolhimento mútuo."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B] resize-none"
            />
          </div>

          {/* Elanas Reward Banner */}
          <div className="bg-[#FFD166]/10 p-3 rounded-xl border border-[#FFD166]/30 flex items-center justify-between text-xs text-white">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#FFD166] fill-current" />
              Recompensa por Compartilhar:
            </span>
            <span className="font-extrabold text-[#FF7F5B] bg-[#070D0F] px-2.5 py-0.5 rounded-full border border-[#FF7F5B]/30">
              +20 pontos
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar Tópico
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  ExternalLink, 
  X, 
  Check, 
  AlertCircle,
  Video,
  Image as ImageIcon,
  User,
  ArrowLeft,
  ArrowRight,
  Archive,
  ArchiveRestore,
  ChevronDown
} from 'lucide-react';
import { StoryItem } from '../../types';
import { useDestaques } from '../../context/DestaquesContext';
import { useJourneys } from '../../context/JourneysContext';
import { useToast } from '../../context/ToastContext';

export const AdminDestaquesManager: React.FC = () => {
  const { destaques, addDestaque, updateDestaque, deleteDestaque, reorderDestaques, toggleArchiveDestaque } = useDestaques();
  const { journeys } = useJourneys();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestaque, setEditingDestaque] = useState<StoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStoredOpen, setIsStoredOpen] = useState(false); // Sempre carrega retrátil

  const activeDestaques = destaques.filter(d => !d.isArchived);
  const storedDestaques = destaques.filter(d => d.isArchived);

  const handleMove = async (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDestaques.length) return;

    const reorderedActive = [...activeDestaques];
    const [movedItem] = reorderedActive.splice(index, 1);
    reorderedActive.splice(targetIndex, 0, movedItem);

    const fullList = [...reorderedActive, ...storedDestaques];
    await reorderDestaques(fullList);
    showToast('success', 'Ordem dos destaques atualizada!');
  };

  const handleToggleArchive = async (id: string, willArchive: boolean) => {
    try {
      await toggleArchiveDestaque(id);
      showToast('success', willArchive ? 'Destaque armazenado com sucesso!' : 'Destaque reativado e publicado na Home!');
    } catch (err) {
      showToast('error', 'Erro ao alterar status do destaque.');
    }
  };

  // Garante que a tela comece no topo absoluto ao abrir qualquer janela de cadastro/edição
  useEffect(() => {
    if (isModalOpen || deleteConfirmId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [isModalOpen, deleteConfirmId]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    journeyIds: [] as string[],
    authorName: '',
    authorHandle: '',
    authorAvatar: '',
    videoUrl: '',
    posterUrl: '',
    duration: '0:45'
  });

  const openNewModal = () => {
    setEditingDestaque(null);
    setFormData({
      title: '',
      journeyIds: journeys.length > 0 ? [journeys[0].id] : [],
      authorName: '',
      authorHandle: '',
      authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      videoUrl: '',
      posterUrl: '',
      duration: '0:45'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (destaque: StoryItem) => {
    setEditingDestaque(destaque);
    setFormData({
      title: destaque.title,
      journeyIds: destaque.journeyIds && destaque.journeyIds.length > 0 
        ? destaque.journeyIds 
        : (destaque.category ? [journeys.find(j => j.title === destaque.category)?.id || ''] : []),
      authorName: destaque.authorName,
      authorHandle: destaque.authorHandle,
      authorAvatar: destaque.authorAvatar,
      videoUrl: destaque.videoUrl,
      posterUrl: destaque.posterUrl,
      duration: destaque.duration
    });
    setIsModalOpen(true);
  };

  const toggleJourneySelection = (journeyId: string) => {
    setFormData(prev => {
      const exists = prev.journeyIds.includes(journeyId);
      if (exists) {
        // Se desmarcar, garante que mantenha pelo menos as outras
        return { ...prev, journeyIds: prev.journeyIds.filter(id => id !== journeyId) };
      } else {
        return { ...prev, journeyIds: [...prev.journeyIds, journeyId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Por favor, informe o título do destaque.');
      return;
    }
    if (!formData.videoUrl.trim()) {
      showToast('error', 'Por favor, informe o link do vídeo.');
      return;
    }
    if (formData.journeyIds.length === 0) {
      showToast('error', 'Selecione pelo menos uma jornada para conectar este destaque.');
      return;
    }

    setIsSaving(true);

    // Categoria primária (primeira jornada selecionada)
    const primaryJourney = journeys.find(j => j.id === formData.journeyIds[0]);
    const categoryName = primaryJourney ? primaryJourney.title : 'Geral';

    try {
      if (editingDestaque) {
        await updateDestaque(editingDestaque.id, {
          title: formData.title.trim(),
          journeyIds: formData.journeyIds,
          category: categoryName,
          authorName: formData.authorName.trim() || 'Especialista Elana',
          authorHandle: formData.authorHandle.trim() || '@elana.academy',
          authorAvatar: formData.authorAvatar.trim() || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
          videoUrl: formData.videoUrl.trim(),
          posterUrl: formData.posterUrl.trim() || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600',
          duration: formData.duration.trim() || '0:45'
        });
        showToast('success', 'Destaque atualizado com sucesso!');
      } else {
        await addDestaque({
          title: formData.title.trim(),
          journeyIds: formData.journeyIds,
          category: categoryName,
          authorName: formData.authorName.trim() || 'Especialista Elana',
          authorHandle: formData.authorHandle.trim() || '@elana.academy',
          authorAvatar: formData.authorAvatar.trim() || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
          videoUrl: formData.videoUrl.trim(),
          posterUrl: formData.posterUrl.trim() || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600',
          duration: formData.duration.trim() || '0:45',
          date: 'Hoje',
          likes: 0
        });
        showToast('success', 'Novo destaque criado e publicado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('error', 'Ocorreu um erro ao salvar o destaque.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDestaque(id);
      showToast('success', 'Destaque excluído com sucesso.');
      setDeleteConfirmId(null);
    } catch (err) {
      showToast('error', 'Erro ao excluir o destaque.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#101B1E] px-6 py-4 rounded-2xl border border-white/10 shadow-md flex items-center justify-between gap-4">
        <h3 className="text-xl font-black text-white truncate" style={{ fontFamily: 'var(--font-heading)' }}>
          Destaques
        </h3>

        <button
          type="button"
          onClick={openNewModal}
          className="px-4 py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Destaque</span>
        </button>
      </div>

      {/* Destaques Grid (Vertical Cards 9:16 Preview) */}
      {/* Destaques Grid (Ativos na Página Inicial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {activeDestaques.map((destaque, idx) => {
          // Jornadas associadas a este destaque
          const associatedJourneys = journeys.filter(j => 
            destaque.journeyIds?.includes(j.id) || destaque.category === j.title
          );

          return (
            <div
              key={destaque.id}
              className="group bg-[#101B1E] rounded-2xl border border-white/10 overflow-hidden shadow-md hover:border-[#FF7F5B]/50 transition-all flex flex-col justify-between"
            >
              {/* Top: 9:16 Aspect Thumbnail Container */}
              <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden">
                <img
                  src={destaque.posterUrl}
                  alt={destaque.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101B1E] via-transparent to-black/40 pointer-events-none" />

                {/* Author Avatar & Handle + Order Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={destaque.authorAvatar}
                      alt={destaque.authorName}
                      className="w-7 h-7 rounded-full object-cover border border-white/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-white block truncate leading-tight">
                        {destaque.authorName}
                      </span>
                      <span className="text-[9px] text-slate-300 block truncate">
                        {destaque.authorHandle}
                      </span>
                    </div>
                  </div>

                  {/* Número da Ordem */}
                  <span 
                    className="text-[10px] font-black bg-[#FF7F5B] text-slate-950 px-2 py-0.5 rounded-md shadow-md shrink-0"
                    title={`Posição ${idx + 1} na ordem de exibição`}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {/* Play Icon Preview */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-[#FF7F5B] text-slate-950 flex items-center justify-center shadow-xl">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom of Image: Title */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h4 
                    className="text-xs font-bold text-white leading-snug line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading)' }}
                    title={destaque.title}
                  >
                    {destaque.title}
                  </h4>
                </div>
              </div>

              {/* Bottom: Journey Badges & Actions */}
              <div className="p-3.5 space-y-3 bg-[#0c1517]">
                {/* Associated Journeys Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Jornadas Conectadas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {associatedJourneys.length > 0 ? (
                      associatedJourneys.map(j => (
                        <span
                          key={j.id}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200 truncate max-w-full"
                          title={j.title}
                        >
                          {j.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">
                        Nenhuma jornada vinculada
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Reorder, Edit, Archive & Delete */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                  {/* Botões de Mover Ordem */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'prev')}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover para a esquerda (anterior)"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === activeDestaques.length - 1}
                      onClick={() => handleMove(idx, 'next')}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover para a direita (próximo)"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(destaque)}
                    className="flex-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleArchive(destaque.id, true)}
                    className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                    title="Armazenar destaque (não exibir na tela inicial)"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(destaque.id)}
                    className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                    title="Excluir este destaque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeDestaques.length === 0 && (
        <div className="text-center py-12 bg-[#101B1E] rounded-3xl border border-white/10 space-y-3">
          <Sparkles className="w-9 h-9 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum destaque ativo na página inicial</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cadastre um novo destaque ou reative um dos vídeos armazenados abaixo.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="px-4 py-2 bg-[#FF7F5B] text-slate-950 font-black rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Primeiro Destaque</span>
          </button>
        </div>
      )}

      {/* SEÇÃO EXPANSÍVEL / RETRÁTIL DE DESTAQUES ARMAZENADOS */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => setIsStoredOpen(!isStoredOpen)}
          className="w-full bg-[#101B1E] hover:bg-[#142327] border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between transition-all cursor-pointer shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <span>Destaques Armazenados</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-amber-300 font-mono font-bold">
                  {storedDestaques.length}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Vídeos arquivados que não estão visíveis na página inicial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-bold hidden sm:inline">
              {isStoredOpen ? 'Recolher' : 'Expandir'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isStoredOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isStoredOpen && (
          <div className="space-y-4 animate-fade-in">
            {storedDestaques.length === 0 ? (
              <div className="text-center py-10 bg-[#0c1517] rounded-2xl border border-white/5 space-y-2">
                <p className="text-xs text-slate-400">
                  Nenhum destaque armazenado no momento.
                </p>
                <p className="text-[11px] text-slate-500">
                  Você pode usar o botão de arquivar (ícone de caixa) nos destaques ativos para guardá-los aqui sem excluí-los.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {storedDestaques.map((destaque) => {
                  const associatedJourneys = journeys.filter(j => 
                    destaque.journeyIds?.includes(j.id) || destaque.category === j.title
                  );

                  return (
                    <div
                      key={destaque.id}
                      className="group bg-[#101B1E] opacity-90 hover:opacity-100 rounded-2xl border border-amber-500/20 overflow-hidden shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Top 9:16 Thumbnail */}
                      <div className="relative aspect-[9/16] bg-slate-950 overflow-hidden">
                        <img
                          src={destaque.posterUrl}
                          alt={destaque.title}
                          className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101B1E] via-transparent to-black/40 pointer-events-none" />

                        {/* Top: Author & Tag Armazenado */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={destaque.authorAvatar}
                              alt={destaque.authorName}
                              className="w-7 h-7 rounded-full object-cover border border-white/30 shrink-0"
                            />
                            <span className="text-[11px] font-bold text-white block truncate leading-tight">
                              {destaque.authorName}
                            </span>
                          </div>

                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md shadow shrink-0">
                            Armazenado
                          </span>
                        </div>

                        {/* Bottom: Title */}
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                          <h4 
                            className="text-xs font-bold text-white leading-snug line-clamp-2"
                            style={{ fontFamily: 'var(--font-heading)' }}
                            title={destaque.title}
                          >
                            {destaque.title}
                          </h4>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="p-3.5 space-y-3 bg-[#0c1517]">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Jornadas Conectadas:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {associatedJourneys.length > 0 ? (
                              associatedJourneys.map(j => (
                                <span
                                  key={j.id}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200 truncate max-w-full"
                                >
                                  {j.title}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">
                                Nenhuma jornada vinculada
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions for stored */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                          {/* Botão de Reativar / Desarquivar */}
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(destaque.id, false)}
                            className="flex-1 px-2.5 py-1.5 bg-[#FF7F5B]/15 hover:bg-[#FF7F5B]/25 text-[#FF7F5B] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Reativar e exibir na página inicial"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            <span>Reativar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(destaque)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                            title="Editar este destaque"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(destaque.id)}
                            className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                            title="Excluir este destaque definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-10 sm:pt-14 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-4 mb-12">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingDestaque ? 'Editar Destaque' : 'Novo Destaque'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Título ou Frase do Destaque <span className="text-[#FF7F5B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: 5 dicas valiosas para a 1ª semana com o bebê em casa."
                  className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>

              {/* Caixa de Seleção Múltipla de Jornadas */}
              <div className="space-y-2 p-4 bg-[#070D0F] rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white uppercase tracking-wider block">
                    JORNADAS <span className="text-[#FF7F5B]">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formData.journeyIds.length} selecionada(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {journeys.map((j) => {
                    const isSelected = formData.journeyIds.includes(j.id);

                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => toggleJourneySelection(j.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] text-white font-bold shadow-sm'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: j.themeColor || '#FF7F5B' }}
                          />
                          <span className="text-xs truncate">{j.title}</span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#FF7F5B] border-[#FF7F5B] text-slate-950'
                              : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Links de Vídeo e Capa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#FF7F5B]" />
                    <span>Link do Vídeo <span className="text-[#FF7F5B]">*</span></span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://... ou Panda Video embed URL"
                    className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF7F5B]" />
                    <span>Capa 9:16</span>
                  </label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dados do Autor / Especialista */}
              <div className="space-y-3 p-4 bg-[#070D0F] rounded-2xl border border-white/10">
                <label className="text-xs font-black text-white uppercase tracking-wider block">
                  ESPECIALISTA
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Nome</label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="Ex: Dra. Mariana Costa"
                      className="w-full bg-[#101B1E] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">@</label>
                    <input
                      type="text"
                      value={formData.authorHandle}
                      onChange={(e) => setFormData({ ...formData, authorHandle: e.target.value })}
                      placeholder="Ex: @mariana.pediatria"
                      className="w-full bg-[#101B1E] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Avatar (URL)</label>
                    <input
                      type="url"
                      value={formData.authorAvatar}
                      onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#101B1E] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : editingDestaque ? 'Atualizar Destaque' : 'Publicar Destaque'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Excluir Destaque?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Este vídeo será removido da seção Destaques na HomePage e não poderá ser recuperado.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Edit3, 
  Trash2, 
  Video, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles, 
  BookOpen, 
  Check, 
  X, 
  Clock, 
  Link2, 
  UploadCloud, 
  AlertCircle,
  Eye,
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';
import { useJourneys } from '../../context/JourneysContext';
import { Journey, CourseModule, Lesson, LessonResource } from '../../types';
import { uploadFileToStorage } from '../../lib/storage';

interface AdminContentManagerProps {
  showToast?: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({ showToast }) => {
  const { 
    journeys, 
    isLoading, 
    saveJourney, 
    deleteJourney, 
    addModule, 
    updateModule, 
    deleteModule, 
    addContent, 
    updateContent, 
    deleteContent 
  } = useJourneys();

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(() => journeys[0]?.id || '');
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<{ journeyId: string; module?: CourseModule } | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<{
    journeyId: string;
    moduleId: string;
    content?: Lesson;
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'journey' | 'module' | 'content';
    journeyId: string;
    moduleId?: string;
    contentId?: string;
    title: string;
  } | null>(null);

  // Form states for Journey Modal
  const [journeyFormTitle, setJourneyFormTitle] = useState('');
  const [journeyFormSubtitle, setJourneyFormSubtitle] = useState('');
  const [journeyFormTagline, setJourneyFormTagline] = useState('');
  const [journeyFormDesc, setJourneyFormDesc] = useState('');
  const [journeyFormPillar, setJourneyFormPillar] = useState<'luz' | 'raizes' | 'movimento'>('movimento');
  const [journeyFormPillarAttr, setJourneyFormPillarAttr] = useState('');
  const [journeyFormCategory, setJourneyFormCategory] = useState<'comecam' | 'transformam'>('comecam');
  const [journeyFormAudience, setJourneyFormAudience] = useState('');
  const [journeyFormThemeColor, setJourneyFormThemeColor] = useState('#FF7F5B');
  const [journeyFormPrice, setJourneyFormPrice] = useState(197);

  // Form states for Module Modal
  const [moduleFormTitle, setModuleFormTitle] = useState('');
  const [moduleFormDesc, setModuleFormDesc] = useState('');

  // Form states for Content Modal
  const [contentFormTitle, setContentFormTitle] = useState('');
  const [contentFormDesc, setContentFormDesc] = useState('');
  const [contentFormDuration, setContentFormDuration] = useState('15 min');
  const [contentFormVideoUrl, setContentFormVideoUrl] = useState('');
  const [contentFormPdfUrl, setContentFormPdfUrl] = useState('');
  const [contentFormPdfTitle, setContentFormPdfTitle] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [contentModalTab, setContentModalTab] = useState<'details' | 'media'>('details');

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    if (showToast) showToast(type, message);
  };

  // Garante que a jornada selecionada seja válida
  const activeJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];

  const toggleModule = (modId: string) => {
    setExpandedModuleIds(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // ----------------------------------------------------
  // HANDLERS: JORNADA
  // ----------------------------------------------------
  const openCreateJourney = () => {
    setEditingJourney(null);
    setJourneyFormTitle('');
    setJourneyFormSubtitle('Jornadas que Começam');
    setJourneyFormTagline('');
    setJourneyFormDesc('');
    setJourneyFormPillar('movimento');
    setJourneyFormPillarAttr('Evolução');
    setJourneyFormCategory('comecam');
    setJourneyFormAudience('Pais de 0 a 3 anos');
    setJourneyFormThemeColor('#FF7F5B');
    setJourneyFormPrice(197);
    setIsJourneyModalOpen(true);
  };

  const openEditJourney = (journey: Journey) => {
    setEditingJourney(journey);
    setJourneyFormTitle(journey.title);
    setJourneyFormSubtitle(journey.subtitle || '');
    setJourneyFormTagline(journey.tagline || '');
    setJourneyFormDesc(journey.description || '');
    setJourneyFormPillar(journey.pillar || 'movimento');
    setJourneyFormPillarAttr(journey.pillarAttribute || '');
    setJourneyFormCategory(journey.category || 'comecam');
    setJourneyFormAudience(journey.targetAudience || '');
    setJourneyFormThemeColor(journey.themeColor || '#FF7F5B');
    setJourneyFormPrice(journey.price || 197);
    setIsJourneyModalOpen(true);
  };

  const handleSaveJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journeyFormTitle.trim()) {
      notify('error', 'Por favor, informe o título da Jornada.');
      return;
    }

    const journeyId = editingJourney 
      ? editingJourney.id 
      : journeyFormTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `jornada-${Date.now()}`;

    const newJourney: Journey = {
      id: journeyId,
      title: journeyFormTitle.trim(),
      subtitle: journeyFormSubtitle.trim(),
      tagline: journeyFormTagline.trim(),
      description: journeyFormDesc.trim(),
      pillar: journeyFormPillar,
      pillarAttribute: journeyFormPillarAttr.trim() || (journeyFormPillar === 'luz' ? 'Clareza' : journeyFormPillar === 'raizes' ? 'Presença' : 'Evolução'),
      category: journeyFormCategory,
      targetAudience: journeyFormAudience.trim(),
      themeColor: journeyFormThemeColor,
      bgLight: '#fff0eb',
      iconName: 'Sun',
      price: journeyFormPrice,
      modules: editingJourney?.modules || []
    };

    const ok = await saveJourney(newJourney);
    if (ok) {
      setSelectedJourneyId(journeyId);
      setIsJourneyModalOpen(false);
      notify('success', editingJourney ? 'Jornada atualizada com sucesso! ✨' : 'Nova Jornada criada com sucesso! 🌿');
    } else {
      notify('error', 'Erro ao salvar jornada. Tente novamente.');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: SUBTEMA (MÓDULO)
  // ----------------------------------------------------
  const openCreateModule = (journeyId: string) => {
    setEditingModule({ journeyId });
    setModuleFormTitle('');
    setModuleFormDesc('');
    setIsModuleModalOpen(true);
  };

  const openEditModule = (journeyId: string, module: CourseModule) => {
    setEditingModule({ journeyId, module });
    setModuleFormTitle(module.title);
    setModuleFormDesc(module.description || '');
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleFormTitle.trim() || !editingModule) {
      notify('error', 'Por favor, informe o título do Subtema.');
      return;
    }

    let ok = false;
    if (editingModule.module) {
      ok = await updateModule(editingModule.journeyId, editingModule.module.id, {
        title: moduleFormTitle.trim(),
        description: moduleFormDesc.trim()
      });
    } else {
      ok = await addModule(editingModule.journeyId, moduleFormTitle.trim(), moduleFormDesc.trim());
    }

    if (ok) {
      setIsModuleModalOpen(false);
      notify('success', editingModule.module ? 'Subtema atualizado! ✨' : 'Novo Subtema criado com sucesso! 🌿');
    } else {
      notify('error', 'Erro ao salvar subtema.');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: CONTEÚDO
  // ----------------------------------------------------
  const openCreateContent = (journeyId: string, moduleId: string) => {
    setEditingContent({ journeyId, moduleId });
    setContentFormTitle('');
    setContentFormDesc('');
    setContentFormDuration('15 min');
    setContentFormVideoUrl('');
    setContentFormPdfUrl('');
    setContentFormPdfTitle('');
    setContentModalTab('details');
    setIsContentModalOpen(true);
  };

  const openEditContent = (journeyId: string, moduleId: string, content: Lesson) => {
    setEditingContent({ journeyId, moduleId, content });
    setContentFormTitle(content.title);
    setContentFormDesc(content.description || '');
    setContentFormDuration(content.duration || '15 min');
    setContentFormVideoUrl(content.videoUrl || '');
    const firstPdf = content.resources?.find(r => r.type === 'pdf');
    setContentFormPdfUrl(firstPdf?.url || '');
    setContentFormPdfTitle(firstPdf?.title || '');
    setContentModalTab('details');
    setIsContentModalOpen(true);
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      notify('info', 'Fazendo upload do vídeo para o servidor...');
      const url = await uploadFileToStorage(file, 'videos');
      if (url) {
        setContentFormVideoUrl(url);
        notify('success', 'Vídeo enviado com sucesso!');
      } else {
        notify('error', 'Erro no upload do vídeo. Verifique sua conexão.');
      }
    } catch (err) {
      notify('error', 'Falha no envio do vídeo.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPdf(true);
      notify('info', 'Fazendo upload do PDF...');
      const url = await uploadFileToStorage(file, 'materials');
      if (url) {
        setContentFormPdfUrl(url);
        if (!contentFormPdfTitle) {
          setContentFormPdfTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        notify('success', 'PDF anexado com sucesso!');
      } else {
        notify('error', 'Erro no upload do PDF.');
      }
    } catch (err) {
      notify('error', 'Falha no upload do material.');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentFormTitle.trim() || !editingContent) {
      notify('error', 'Por favor, informe o título do Conteúdo.');
      return;
    }

    const resources: LessonResource[] = [];
    if (contentFormPdfUrl.trim()) {
      resources.push({
        title: contentFormPdfTitle.trim() || 'Material de Apoio (PDF)',
        type: 'pdf',
        url: contentFormPdfUrl.trim()
      });
    }

    let ok = false;
    if (editingContent.content) {
      ok = await updateContent(editingContent.journeyId, editingContent.moduleId, editingContent.content.id, {
        title: contentFormTitle.trim(),
        description: contentFormDesc.trim(),
        duration: contentFormDuration.trim() || '15 min',
        videoUrl: contentFormVideoUrl.trim(),
        resources
      });
    } else {
      ok = await addContent(editingContent.journeyId, editingContent.moduleId, {
        title: contentFormTitle.trim(),
        description: contentFormDesc.trim(),
        duration: contentFormDuration.trim() || '15 min',
        videoUrl: contentFormVideoUrl.trim(),
        resources
      });
    }

    if (ok) {
      setIsContentModalOpen(false);
      notify('success', editingContent.content ? 'Conteúdo atualizado! ✨' : 'Novo Conteúdo adicionado com sucesso! 🌿');
    } else {
      notify('error', 'Erro ao salvar conteúdo.');
    }
  };

  // ----------------------------------------------------
  // DELETE CONFIRMATION HANDLER
  // ----------------------------------------------------
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    const { type, journeyId, moduleId, contentId } = deleteConfirm;

    let ok = false;
    if (type === 'journey') {
      ok = await deleteJourney(journeyId);
      if (ok && selectedJourneyId === journeyId) {
        const remaining = journeys.filter(j => j.id !== journeyId);
        if (remaining.length > 0) setSelectedJourneyId(remaining[0].id);
      }
    } else if (type === 'module' && moduleId) {
      ok = await deleteModule(journeyId, moduleId);
    } else if (type === 'content' && moduleId && contentId) {
      ok = await deleteContent(journeyId, moduleId, contentId);
    }

    if (ok) {
      notify('success', 'Item removido com sucesso.');
    } else {
      notify('error', 'Erro ao remover item.');
    }
    setDeleteConfirm(null);
  };

  // Estatísticas gerais
  const totalJourneysCount = journeys.length;
  const totalModulesCount = journeys.reduce((acc, j) => acc + (j.modules?.length || 0), 0);
  const totalContentsCount = journeys.reduce((acc, j) => {
    return acc + (j.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0);
  }, 0);

  // Filtro de busca
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DA CENTRAL DE CONTEÚDOS */}
      <div className="bg-[#070D0F] p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Gestão de Conteúdos & Jornadas
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Cadastre novas jornadas, estruture subtemas acolhedores e adicione vídeos e materiais de apoio para as famílias da Aldeia.
          </p>
        </div>

        {/* Estatísticas Rápidas & Botão Principal */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#101B1E] border border-white/10 rounded-2xl text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Jornadas</span>
              <span className="text-sm font-black text-white">{totalJourneysCount}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Subtemas</span>
              <span className="text-sm font-black text-white">{totalModulesCount}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Conteúdos</span>
              <span className="text-sm font-black text-[#FF7F5B]">{totalContentsCount}</span>
            </div>
          </div>

          <button
            onClick={openCreateJourney}
            className="px-4 py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Jornada</span>
          </button>
        </div>
      </div>

      {/* BARRA DE SELEÇÃO DE JORNADAS & BUSCA */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF7F5B]" />
            Selecione a Jornada para Gerenciar:
          </label>

          {/* Busca rápida */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conteúdos ou subtemas..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7F5B]"
            />
          </div>
        </div>

        {/* Chips de Jornadas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {journeys.map(j => {
            const isSelected = activeJourney?.id === j.id;
            return (
              <button
                key={j.id}
                onClick={() => setSelectedJourneyId(j.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] text-white shadow-md' 
                    : 'bg-[#101B1E] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: j.themeColor || '#FF7F5B' }} 
                />
                <span>{j.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                  {j.modules?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALHES DA JORNADA SELECIONADA */}
      {activeJourney ? (
        <div className="space-y-6">
          {/* Card Resumo da Jornada */}
          <div 
            className="p-6 rounded-3xl border shadow-lg relative overflow-hidden transition-all"
            style={{ 
              backgroundColor: '#101B1E', 
              borderColor: `${activeJourney.themeColor}33` 
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${activeJourney.themeColor}22`,
                      color: activeJourney.themeColor 
                    }}
                  >
                    Pilar {activeJourney.pillar?.toUpperCase() || 'MOVIMENTO'} • {activeJourney.pillarAttribute}
                  </span>
                  <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                    Público: {activeJourney.targetAudience}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                    R$ {activeJourney.price || 197}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {activeJourney.title}
                </h3>
                {activeJourney.tagline && (
                  <p className="text-xs text-[#FF7F5B] font-bold">
                    {activeJourney.tagline}
                  </p>
                )}
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  {activeJourney.description}
                </p>
              </div>

              {/* Botões de Ação na Jornada */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditJourney(activeJourney)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Editar dados da jornada"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Jornada</span>
                </button>

                <button
                  onClick={() => setDeleteConfirm({
                    type: 'journey',
                    journeyId: activeJourney.id,
                    title: activeJourney.title
                  })}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Excluir jornada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openCreateModule(activeJourney.id)}
                  className="px-3.5 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Subtema</span>
                </button>
              </div>
            </div>
          </div>

          {/* LISTAGEM DE SUBTEMAS E CONTEÚDOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Subtemas & Conteúdos da Jornada</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white">
                  {activeJourney.modules?.length || 0} subtemas cadastrados
                </span>
              </h4>
            </div>

            {(!activeJourney.modules || activeJourney.modules.length === 0) ? (
              <div className="p-8 bg-[#101B1E] border border-white/10 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                  <FolderPlus className="w-6 h-6 text-[#FF7F5B]" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhum subtema cadastrado nesta jornada</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Subtemas organizam os encontros da jornada (ex: "Cuidando de Quem Cuida", "O Sono do Bebê").
                </p>
                <button
                  onClick={() => openCreateModule(activeJourney.id)}
                  className="px-4 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeiro Subtema</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeJourney.modules.map((mod, modIdx) => {
                  const isExpanded = expandedModuleIds[mod.id] !== false; // Default aberto
                  const lessonsList = mod.lessons || [];
                  const filteredLessons = lessonsList.filter(l => 
                    matchesSearch(l.title) || matchesSearch(l.description) || matchesSearch(mod.title)
                  );

                  return (
                    <div 
                      key={mod.id}
                      className="bg-[#101B1E] border border-white/10 rounded-2xl overflow-hidden transition-all shadow-sm"
                    >
                      {/* BARRA DO SUBTEMA */}
                      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-3">
                        <div 
                          onClick={() => toggleModule(mod.id)} 
                          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                        >
                          <span className="w-7 h-7 rounded-xl bg-[#FF7F5B]/15 text-[#FF7F5B] font-black text-xs flex items-center justify-center border border-[#FF7F5B]/30">
                            {modIdx + 1}
                          </span>
                          <div>
                            <h5 className="text-sm font-bold text-white flex items-center gap-2">
                              <span>{mod.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                                {lessonsList.length} conteúdos
                              </span>
                            </h5>
                            {mod.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Ações do Subtema */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openCreateContent(activeJourney.id, mod.id)}
                            className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Novo Conteúdo</span>
                          </button>

                          <button
                            onClick={() => openEditModule(activeJourney.id, mod)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Editar subtema"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirm({
                              type: 'module',
                              journeyId: activeJourney.id,
                              moduleId: mod.id,
                              title: mod.title
                            })}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Excluir subtema"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* CONTEÚDOS DO SUBTEMA */}
                      {isExpanded && (
                        <div className="p-4 space-y-2.5 bg-[#070D0F]">
                          {filteredLessons.length === 0 ? (
                            <div className="py-6 text-center text-slate-500 text-xs">
                              {searchQuery ? 'Nenhum conteúdo encontrado nesta busca.' : 'Nenhum conteúdo adicionado a este subtema ainda.'}
                            </div>
                          ) : (
                            filteredLessons.map((lesson, lessonIdx) => {
                              const hasPdf = lesson.resources?.some(r => r.type === 'pdf');

                              return (
                                <div
                                  key={lesson.id}
                                  className="p-3.5 bg-[#101B1E] border border-white/5 hover:border-white/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                                >
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-[#FF7F5B]/10 text-[#FF7F5B] flex items-center justify-center shrink-0 mt-0.5">
                                      <Video className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h6 className="text-xs font-bold text-white truncate">
                                          {lesson.title}
                                        </h6>
                                      </div>

                                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                        {lesson.description || 'Sem descrição pedagógica.'}
                                      </p>

                                      {/* Tags e Materiais */}
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md font-mono">
                                          <Clock className="w-3 h-3 text-slate-500" />
                                          {lesson.duration || '15 min'}
                                        </span>

                                        {lesson.videoUrl && (
                                          <a
                                            href={lesson.videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-md font-bold transition-colors"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Ver Vídeo</span>
                                          </a>
                                        )}

                                        {hasPdf && (
                                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                                            <FileCheck className="w-3 h-3" />
                                            <span>PDF Anexo</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Botões de Edição do Conteúdo */}
                                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                    <button
                                      onClick={() => openEditContent(activeJourney.id, mod.id, lesson)}
                                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Editar conteúdo"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline text-[11px]">Editar</span>
                                    </button>

                                    <button
                                      onClick={() => setDeleteConfirm({
                                        type: 'content',
                                        journeyId: activeJourney.id,
                                        moduleId: mod.id,
                                        contentId: lesson.id,
                                        title: lesson.title
                                      })}
                                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir conteúdo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">
          Nenhuma jornada disponível. Clique em "+ Nova Jornada" acima para começar.
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: CRIAR / EDITAR JORNADA */}
      {/* ==================================================== */}
      {isJourneyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingJourney ? 'Editar Jornada' : 'Criar Nova Jornada'}
              </h3>
              <button
                onClick={() => setIsJourneyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJourney} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Título da Jornada:</label>
                <input
                  type="text"
                  value={journeyFormTitle}
                  onChange={(e) => setJourneyFormTitle(e.target.value)}
                  placeholder="Ex: Pais Recém-Nascidos, Construindo Pontes"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Subtítulo / Grupo:</label>
                  <input
                    type="text"
                    value={journeyFormSubtitle}
                    onChange={(e) => setJourneyFormSubtitle(e.target.value)}
                    placeholder="Ex: Jornadas que Começam"
                    className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Pilar Temático:</label>
                  <select
                    value={journeyFormPillar}
                    onChange={(e) => setJourneyFormPillar(e.target.value as any)}
                    className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  >
                    <option value="movimento">Movimento (Evolução / Rotina)</option>
                    <option value="raizes">Raízes (Presença / Conexão)</option>
                    <option value="luz">Luz (Clareza / Propósito)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Frase de Destaque (Tagline):</label>
                <input
                  type="text"
                  value={journeyFormTagline}
                  onChange={(e) => setJourneyFormTagline(e.target.value)}
                  placeholder="Ex: Gestantes e pais de bebês: leveza para o começo da caminhada."
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Descrição Acolhedora:</label>
                <textarea
                  value={journeyFormDesc}
                  onChange={(e) => setJourneyFormDesc(e.target.value)}
                  rows={3}
                  placeholder="Descreva o propósito da jornada e o acolhimento oferecido aos pais..."
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Público-Alvo:</label>
                  <input
                    type="text"
                    value={journeyFormAudience}
                    onChange={(e) => setJourneyFormAudience(e.target.value)}
                    placeholder="Ex: Gestantes e pais de 0 a 3 anos"
                    className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Preço de Acesso (R$):</label>
                  <input
                    type="number"
                    value={journeyFormPrice}
                    onChange={(e) => setJourneyFormPrice(Number(e.target.value))}
                    className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Cor Temática da Jornada:</label>
                <div className="flex items-center gap-3">
                  {['#FF7F5B', '#8A9A5B', '#FFD166', '#3B82F6', '#EC4899', '#A855F7'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setJourneyFormThemeColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        journeyFormThemeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {journeyFormThemeColor === c && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={journeyFormThemeColor}
                    onChange={(e) => setJourneyFormThemeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    title="Escolher outra cor"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsJourneyModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {editingJourney ? 'Salvar Alterações' : 'Criar Jornada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CRIAR / EDITAR SUBTEMA */}
      {/* ==================================================== */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingModule?.module ? 'Editar Subtema' : 'Novo Subtema'}
              </h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Título do Subtema:</label>
                <input
                  type="text"
                  value={moduleFormTitle}
                  onChange={(e) => setModuleFormTitle(e.target.value)}
                  placeholder="Ex: Cuidando de Quem Cuida, O Sono do Bebê..."
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Breve Descrição do Subtema:</label>
                <textarea
                  value={moduleFormDesc}
                  onChange={(e) => setModuleFormDesc(e.target.value)}
                  rows={3}
                  placeholder="Explique os tópicos abordados neste subtema..."
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  {editingModule?.module ? 'Salvar Subtema' : 'Criar Subtema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: CRIAR / EDITAR CONTEÚDO (VÍDEO & MATERIAIS) */}
      {/* ==================================================== */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editingContent?.content ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Adicione vídeos acolhedores e materiais em PDF para apoiar as famílias.
                </p>
              </div>
              <button
                onClick={() => setIsContentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas do Modal de Conteúdo */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setContentModalTab('details')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  contentModalTab === 'details' 
                    ? 'bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Informações do Conteúdo
              </button>
              <button
                type="button"
                onClick={() => setContentModalTab('media')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  contentModalTab === 'media' 
                    ? 'bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>2. Vídeo & Materiais de Apoio</span>
                {(contentFormVideoUrl || contentFormPdfUrl) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              {contentModalTab === 'details' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Título do Conteúdo:</label>
                    <input
                      type="text"
                      value={contentFormTitle}
                      onChange={(e) => setContentFormTitle(e.target.value)}
                      placeholder="Ex: Uma Nova Identidade: Quem sou eu agora?"
                      className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Tempo Estimado de Duração:</label>
                    <input
                      type="text"
                      value={contentFormDuration}
                      onChange={(e) => setContentFormDuration(e.target.value)}
                      placeholder="Ex: 15 min"
                      className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Descrição Acolhedora:</label>
                    <textarea
                      value={contentFormDesc}
                      onChange={(e) => setContentFormDesc(e.target.value)}
                      rows={4}
                      placeholder="Descreva o que a família vai encontrar e vivenciar neste conteúdo..."
                      className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  {/* SEÇÃO DE VÍDEO */}
                  <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                      <Video className="w-4 h-4 text-[#FF7F5B]" />
                      <span>Vídeo do Conteúdo</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block">URL do Vídeo (YouTube, Vimeo, Cloudflare ou MP4 direto):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={contentFormVideoUrl}
                          onChange={(e) => setContentFormVideoUrl(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block my-1">— ou faça upload direto —</span>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-[#FF7F5B]" />
                        <span>{isUploadingVideo ? 'Enviando vídeo...' : 'Upload de Arquivo de Vídeo (MP4/WebM)'}</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          disabled={isUploadingVideo}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* SEÇÃO DE PDF / MATERIAL DE APOIO */}
                  <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                      <FileText className="w-4 h-4 text-[#FFD166]" />
                      <span>Material de Apoio (PDF / Checklist / Guia)</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block">Título do Material:</label>
                      <input
                        type="text"
                        value={contentFormPdfTitle}
                        onChange={(e) => setContentFormPdfTitle(e.target.value)}
                        placeholder="Ex: Guia Prático de Apoio em PDF"
                        className="w-full p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block">Link direto do PDF:</label>
                      <input
                        type="url"
                        value={contentFormPdfUrl}
                        onChange={(e) => setContentFormPdfUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      />
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block my-1">— ou faça upload do PDF —</span>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-[#FFD166]" />
                        <span>{isUploadingPdf ? 'Enviando PDF...' : 'Upload de Arquivo PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfFileUpload}
                          disabled={isUploadingPdf}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {contentModalTab === 'media' ? (
                  <button
                    type="button"
                    onClick={() => setContentModalTab('details')}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Voltar para Informações
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setContentModalTab('media')}
                    className="text-xs text-[#FF7F5B] hover:text-[#e06847] font-bold"
                  >
                    Avançar para Vídeo & Materiais →
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContentModalOpen(false)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                  >
                    {editingContent?.content ? 'Salvar Conteúdo' : 'Adicionar Conteúdo'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ==================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#101B1E] border border-rose-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-white">Tem certeza que deseja excluir?</h4>
              <p className="text-xs text-slate-300 mt-1">
                Você está prestes a remover <strong className="text-rose-400 font-bold">"{deleteConfirm.title}"</strong>.
              </p>
              {deleteConfirm.type === 'journey' && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Todos os subtemas e conteúdos desta jornada também serão removidos.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Sim, Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

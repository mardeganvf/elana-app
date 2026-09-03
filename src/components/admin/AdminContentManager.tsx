import React, { useState, useEffect } from 'react';
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
  FileCheck,
  ArrowLeft,
  Image as ImageIcon,
  Users,
  Download,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useJourneys } from '../../context/JourneysContext';
import { supabase } from '../../lib/supabase';
import { Journey, CourseModule, Lesson, LessonResource } from '../../types';
import { uploadFileToStorage, uploadImageToStorage } from '../../lib/storage';

interface AdminContentManagerProps {
  showToast?: (type: 'success' | 'error' | 'info', msg: string) => void;
  selectedJourneyId?: string;
  onSelectJourneyId?: (id: string) => void;
  selectedModuleId?: string | null;
  onSelectModuleId?: (id: string | null) => void;
  isCreateJourneyModalOpen?: boolean;
  onCloseCreateJourneyModal?: () => void;
}

export const AdminContentManager: React.FC<AdminContentManagerProps> = ({ 
  showToast,
  selectedJourneyId: propSelectedJourneyId,
  onSelectJourneyId: propOnSelectJourneyId,
  selectedModuleId: propSelectedModuleId,
  onSelectModuleId: propOnSelectModuleId,
  isCreateJourneyModalOpen: propIsCreateJourneyModalOpen,
  onCloseCreateJourneyModal: propOnCloseCreateJourneyModal
}) => {
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

  const [internalSelectedJourneyId, setInternalSelectedJourneyId] = useState<string>(() => journeys[0]?.id || '');
  const activeJourneyId = propSelectedJourneyId || internalSelectedJourneyId || journeys[0]?.id || '';

  const setSelectedJourneyId = (id: string) => {
    setInternalSelectedJourneyId(id);
    propOnSelectJourneyId?.(id);
  };

  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);

  // Switch "Possui módulo?" e lista dinâmica de módulos no modal de jornada
  const [journeyFormHasModules, setJourneyFormHasModules] = useState(false);
  const [journeyFormModulesList, setJourneyFormModulesList] = useState<{ id?: string; title: string; lessons?: Lesson[] }[]>([]);
  const [newModuleInput, setNewModuleInput] = useState('');

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
  const [journeyFormIsComingSoon, setJourneyFormIsComingSoon] = useState(false);
  const [journeyFormCoverUrl, setJourneyFormCoverUrl] = useState('');
  const [isUploadingJourneyCover, setIsUploadingJourneyCover] = useState(false);

  // Form states for Module Modal
  const [moduleFormTitle, setModuleFormTitle] = useState('');
  const [moduleFormDesc, setModuleFormDesc] = useState('');

  // Form states for Content Modal
  const [contentFormSubgroup, setContentFormSubgroup] = useState('');
  const [contentFormTitle, setContentFormTitle] = useState('');
  const [contentFormDesc, setContentFormDesc] = useState('');
  const [contentFormDuration, setContentFormDuration] = useState('15 min');
  const [contentFormVideoUrl, setContentFormVideoUrl] = useState('');
  const [contentFormThumbnailUrl, setContentFormThumbnailUrl] = useState('');
  const [contentFormHasResources, setContentFormHasResources] = useState(false);
  const [contentFormPdfUrl, setContentFormPdfUrl] = useState('');
  const [contentFormPdfTitle, setContentFormPdfTitle] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [contentModalTab, setContentModalTab] = useState<'details' | 'media'>('details');

  // Estados do Modal de Interessados (Lista de Espera no Supabase)
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [interestsJourney, setInterestsJourney] = useState<Journey | null>(null);
  const [interestsList, setInterestsList] = useState<any[]>([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);

  const notify = (type: 'success' | 'error' | 'info', message: string) => {
    if (showToast) showToast(type, message);
  };

  const handleOpenInterestsModal = async (journey: Journey) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setInterestsJourney(journey);
    setIsInterestsModalOpen(true);
    setIsLoadingInterests(true);
    try {
      const { data, error } = await supabase
        .from('journey_interests')
        .select('*, profiles:user_id(phone, name, email)')
        .eq('journey_id', journey.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar interessados:', error.message);
        setInterestsList([]);
      } else {
        setInterestsList(data || []);
      }
    } catch (err) {
      console.warn('Exceção ao buscar interessados:', err);
      setInterestsList([]);
    } finally {
      setIsLoadingInterests(false);
    }
  };

  const handleExportInterestsCSV = () => {
    if (interestsList.length === 0) {
      notify('info', 'Não há interessados para exportar.');
      return;
    }

    const headers = ['#', 'Jornada', 'Nome', 'E-mail', 'Telefone / WhatsApp', 'Data de Registro'];
    const rows = interestsList.map((item, idx) => {
      const phone = item.user_phone || item.profiles?.phone || '-';
      const name = item.user_name || item.profiles?.name || 'Usuário Visitante';
      const email = item.user_email || item.profiles?.email || '-';

      return [
        idx + 1,
        `"${interestsJourney?.title || item.journey_id}"`,
        `"${name}"`,
        `"${email}"`,
        `"${phone}"`,
        `"${new Date(item.created_at).toLocaleString('pt-BR')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `interessados_${interestsJourney?.id || 'jornada'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('success', 'Planilha CSV exportada com sucesso! 📊');
  };

  // Garante que a jornada selecionada seja válida
  const activeJourney = journeys.find(j => j.id === activeJourneyId) || journeys[0];

  // Sincroniza abertura do modal disparado pela sidebar lateral
  useEffect(() => {
    if (propIsCreateJourneyModalOpen) {
      openCreateJourney();
      propOnCloseCreateJourneyModal?.();
    }
  }, [propIsCreateJourneyModalOpen]);

  // Se um módulo for selecionado na sidebar lateral, expande ele
  useEffect(() => {
    if (propSelectedModuleId) {
      setExpandedModuleIds(prev => ({
        ...prev,
        [propSelectedModuleId]: true
      }));
    }
  }, [propSelectedModuleId]);

  const toggleModule = (modId: string) => {
    setExpandedModuleIds(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // Garante que a tela comece no topo absoluto ao abrir qualquer janela de cadastro/edição
  useEffect(() => {
    if (isContentModalOpen || isJourneyModalOpen || isModuleModalOpen || deleteConfirm) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isContentModalOpen, isJourneyModalOpen, isModuleModalOpen, deleteConfirm]);

  // ----------------------------------------------------
  // HANDLERS: JORNADA / TRILHA
  // ----------------------------------------------------
  const handleAddModuleToJourney = () => {
    const trimmed = newModuleInput.trim();
    if (!trimmed) return;
    setJourneyFormModulesList(prev => [
      ...prev,
      {
        id: `mod-${Date.now()}-${prev.length + 1}`,
        title: trimmed,
        lessons: []
      }
    ]);
    setNewModuleInput('');
  };

  const handleRemoveModuleFromJourney = (index: number) => {
    setJourneyFormModulesList(prev => prev.filter((_, i) => i !== index));
  };

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
    setJourneyFormHasModules(false);
    setJourneyFormModulesList([]);
    setNewModuleInput('');
    setJourneyFormIsComingSoon(false);
    setJourneyFormCoverUrl('');
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
    setJourneyFormIsComingSoon(Boolean(journey.isComingSoon));
    setJourneyFormCoverUrl(journey.coverImageUrl || '');

    const existingMods = journey.modules || [];
    const hasMultipleMods = existingMods.length > 1 || (existingMods.length === 1 && existingMods[0].title !== 'Conteúdos da Trilha' && existingMods[0].title !== 'Conteúdos da Jornada');
    setJourneyFormHasModules(hasMultipleMods);
    setJourneyFormModulesList(
      existingMods.map(m => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons || []
      }))
    );
    setNewModuleInput('');
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

    let finalModules: CourseModule[] = [];
    if (journeyFormHasModules) {
      if (journeyFormModulesList.length > 0) {
        finalModules = journeyFormModulesList.map((m, idx) => ({
          id: m.id || `mod-${journeyId}-${idx + 1}`,
          number: idx + 1,
          title: m.title.trim() || `Módulo ${idx + 1}`,
          description: '',
          lessons: m.lessons || []
        }));
      } else {
        finalModules = [{
          id: `mod-${journeyId}-1`,
          number: 1,
          title: 'Módulo 1: Primeiros Passos',
          description: '',
          lessons: editingJourney?.modules?.[0]?.lessons || []
        }];
      }
    } else {
      finalModules = [{
        id: editingJourney?.modules?.[0]?.id || `mod-${journeyId}-1`,
        number: 1,
        title: 'Conteúdos da Jornada',
        description: '',
        lessons: editingJourney?.modules?.[0]?.lessons || []
      }];
    }

    const newJourney: Journey = {
      id: journeyId,
      title: journeyFormTitle.trim(),
      subtitle: journeyFormSubtitle.trim() || 'Jornadas que Começam',
      tagline: journeyFormTagline.trim(),
      description: journeyFormDesc.trim(),
      pillar: journeyFormPillar,
      pillarAttribute: journeyFormPillarAttr.trim() || 'Evolução',
      category: journeyFormCategory,
      targetAudience: journeyFormAudience.trim(),
      themeColor: journeyFormThemeColor,
      bgLight: '#fff0eb',
      iconName: 'Sun',
      price: journeyFormPrice,
      isComingSoon: journeyFormIsComingSoon,
      coverImageUrl: journeyFormCoverUrl.trim(),
      modules: finalModules
    };

    const ok = await saveJourney(newJourney);
    if (ok) {
      setSelectedJourneyId(journeyId);
      setIsJourneyModalOpen(false);
      notify('success', editingJourney ? 'Trilha atualizada com sucesso! ✨' : 'Nova Trilha criada com sucesso! 🌿');
    } else {
      notify('error', 'Erro ao salvar trilha. Tente novamente.');
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
    setContentFormSubgroup('');
    setContentFormTitle('');
    setContentFormDesc('');
    setContentFormDuration('15 min');
    setContentFormVideoUrl('');
    setContentFormThumbnailUrl('');
    setContentFormHasResources(false);
    setContentFormPdfUrl('');
    setContentFormPdfTitle('');
    setContentModalTab('details');
    setIsContentModalOpen(true);
  };

  const openEditContent = (journeyId: string, moduleId: string, content: Lesson) => {
    setEditingContent({ journeyId, moduleId, content });
    if (content.subgroup !== undefined) {
      setContentFormSubgroup(content.subgroup);
      setContentFormTitle(content.title);
    } else if (content.title.includes(': ')) {
      const parts = content.title.split(': ');
      setContentFormSubgroup(parts[0].trim());
      setContentFormTitle(parts.slice(1).join(': ').trim());
    } else {
      setContentFormSubgroup('');
      setContentFormTitle(content.title);
    }
    setContentFormDesc(content.description || '');
    setContentFormDuration(content.duration || '15 min');
    setContentFormVideoUrl(content.videoUrl || '');
    setContentFormThumbnailUrl(content.thumbnailUrl || '');
    const firstPdf = content.resources?.find(r => r.type === 'pdf');
    const hasResources = !!(content.resources && content.resources.length > 0 && (firstPdf?.url || firstPdf?.title));
    setContentFormHasResources(hasResources);
    setContentFormPdfUrl(firstPdf?.url || '');
    setContentFormPdfTitle(firstPdf?.title || '');
    setContentModalTab('details');
    setIsContentModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingThumb(true);
      notify('info', 'Processando e enviando thumbnail...');
      const url = await uploadImageToStorage(file, 'community');
      if (url) {
        setContentFormThumbnailUrl(url);
        notify('success', 'Thumbnail anexada com sucesso!');
      } else {
        notify('error', 'Erro ao enviar a imagem da thumbnail.');
      }
    } catch (err) {
      notify('error', 'Falha no envio da thumbnail.');
    } finally {
      setIsUploadingThumb(false);
      e.target.value = '';
    }
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

    const finalSubgroup = contentFormSubgroup.trim();
    const finalTitle = contentFormTitle.trim();

    const resources: LessonResource[] = [];
    if (contentFormHasResources && contentFormPdfUrl.trim()) {
      resources.push({
        title: contentFormPdfTitle.trim() || 'Material de Apoio (PDF)',
        type: 'pdf',
        url: contentFormPdfUrl.trim()
      });
    }

    const cleanVideoUrl = (raw: string): string => {
      const trimmed = raw.trim();
      if (trimmed.startsWith('<iframe')) {
        const match = trimmed.match(/src=["']([^"']+)["']/);
        if (match && match[1]) return match[1];
      }
      return trimmed;
    };
    const processedVideoUrl = cleanVideoUrl(contentFormVideoUrl);

    const fetchPandaHighResThumb = async (url: string): Promise<string | null> => {
      try {
        const vzMatch = url.match(/vz-([a-z0-9-]+)/i);
        const vMatch = url.match(/[?&]v=([a-z0-9-]+)/i);
        if (!vzMatch || !vMatch) return null;
        const pullzone = `vz-${vzMatch[1]}`;
        const videoId = vMatch[1];
        const res = await fetch(`https://config.tv.pandavideo.com.br/${pullzone}/${videoId}.json`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.thumb) {
            return `https://thumbs.tv.pandavideo.com.br/${pullzone}/${data.thumb}`;
          }
        }
        return `https://thumbs.tv.pandavideo.com.br/${pullzone}/${videoId}/cover.jpg`;
      } catch {
        return null;
      }
    };
    const autoThumb = await fetchPandaHighResThumb(processedVideoUrl);
    const finalThumbnailUrl = contentFormThumbnailUrl.trim() || autoThumb || undefined;

    let ok = false;
    if (editingContent.content) {
      ok = await updateContent(editingContent.journeyId, editingContent.moduleId, editingContent.content.id, {
        title: finalTitle,
        subgroup: finalSubgroup || undefined,
        description: contentFormDesc.trim(),
        duration: contentFormDuration.trim() || '15 min',
        videoUrl: processedVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        resources
      });
    } else {
      ok = await addContent(editingContent.journeyId, editingContent.moduleId, {
        title: finalTitle,
        subgroup: finalSubgroup || undefined,
        description: contentFormDesc.trim(),
        duration: contentFormDuration.trim() || '15 min',
        videoUrl: processedVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
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
      if (ok && activeJourneyId === journeyId) {
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

  // Renderizador de um módulo com seus conteúdos/vídeos (reutilizável para módulo focado ou jornada de módulo único)
  const renderModuleWithLessons = (mod: CourseModule, modIdx: number, showModuleHeader: boolean) => {
    const lessonsList = mod.lessons || [];
    const filteredLessons = lessonsList.filter(l => 
      matchesSearch(l.title) || matchesSearch(l.description) || matchesSearch(mod.title)
    );

    return (
      <div 
        key={mod.id}
        id={`module-card-${mod.id}`}
        className="bg-[#101B1E] border border-white/10 rounded-2xl overflow-hidden shadow-sm"
      >
        {/* BARRA DO MÓDULO */}
        {showModuleHeader && (
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 select-none flex-1">
              <span className="w-7 h-7 rounded-xl bg-[#FF7F5B]/15 text-[#FF7F5B] font-black text-xs flex items-center justify-center border border-[#FF7F5B]/30">
                #{modIdx + 1}
              </span>
              <div>
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{mod.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                    {lessonsList.length} {lessonsList.length === 1 ? 'conteúdo' : 'conteúdos'}
                  </span>
                </h5>
                {mod.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {mod.description}
                  </p>
                )}
              </div>
            </div>

            {/* Ações do Módulo */}
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
                title="Editar título do módulo"
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
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Excluir módulo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* CONTEÚDOS DO MÓDULO (SEMPRE VISÍVEIS) */}
        <div className="p-4 space-y-2.5 bg-[#070D0F]">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Vídeos & Materiais ({filteredLessons.length}):
            </span>
            {!showModuleHeader && (
              <button
                onClick={() => openCreateContent(activeJourney.id, mod.id)}
                className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Novo Conteúdo</span>
              </button>
            )}
          </div>

          {filteredLessons.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs bg-[#101B1E]/40 border border-dashed border-white/10 rounded-xl space-y-2">
              <p>{searchQuery ? 'Nenhum conteúdo encontrado nesta busca.' : 'Nenhum conteúdo adicionado a este módulo ainda.'}</p>
              <button
                onClick={() => openCreateContent(activeJourney.id, mod.id)}
                className="px-3 py-1.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Primeiro Conteúdo</span>
              </button>
            </div>
          ) : (
            filteredLessons.map((lesson) => {
              const hasPdf = lesson.resources?.some(r => r.type === 'pdf');

              return (
                <div
                  key={lesson.id}
                  className="p-3.5 bg-[#101B1E] border border-white/5 hover:border-white/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {lesson.thumbnailUrl ? (
                      <img
                        src={lesson.thumbnailUrl}
                        alt={lesson.title}
                        className="w-12 h-8 rounded-lg object-cover border border-white/10 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#FF7F5B]/10 text-[#FF7F5B] flex items-center justify-center shrink-0 mt-0.5">
                        <Video className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(lesson.subgroup || (lesson.title.includes(': ') ? lesson.title.split(': ')[0] : '')) && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30 shrink-0">
                            {lesson.subgroup || lesson.title.split(': ')[0]}
                          </span>
                        )}
                        <h6 className="text-xs font-bold text-white truncate">
                          {lesson.subgroup ? lesson.title : (lesson.title.includes(': ') ? lesson.title.split(': ').slice(1).join(': ') : lesson.title)}
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
      </div>
    );
  };

  const hasMultipleModules = (activeJourney?.modules?.length || 0) > 1;
  const selectedModule = propSelectedModuleId 
    ? activeJourney?.modules?.find(m => m.id === propSelectedModuleId)
    : null;

  return (
    <div className="space-y-6">
      {/* DETALHES DA JORNADA SELECIONADA */}
      {activeJourney ? (
        <div className="space-y-6">
          {/* Header da Jornada Simplificado */}
          <div className="bg-[#101B1E] px-6 py-4 rounded-2xl border border-white/10 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span 
                className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${
                  activeJourney.isComingSoon 
                    ? 'bg-amber-400 ring-2 ring-amber-400/25' 
                    : 'bg-emerald-400 ring-2 ring-emerald-400/25'
                }`}
                title={activeJourney.isComingSoon ? 'Em Breve' : 'Jornada Ativa'}
              />
              <h3 className="text-xl font-black text-white truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                {activeJourney.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenInterestsModal(activeJourney)}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-white/10 active:scale-95"
                title="Ver e exportar lista de usuários interessados nesta jornada"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Interessados</span>
              </button>

              <button
                onClick={() => openEditJourney(activeJourney)}
                className="px-4 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                title="Editar dados desta jornada"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>

          {/* LISTAGEM DE CONTEÚDOS / MÓDULOS */}
          {hasMultipleModules ? (
            /* CASO A: JORNADA COM MÚLTIPLOS MÓDULOS */
            selectedModule ? (
              /* A.1: MÓDULO ESPECÍFICO SELECIONADO -> EXIBE APENAS OS VÍDEOS DESSE MÓDULO */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => propOnSelectModuleId?.(null)}
                    className="text-xs text-[#FF7F5B] hover:text-[#e06847] font-bold flex items-center gap-1.5 cursor-pointer w-fit"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para todos os módulos da jornada</span>
                  </button>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar conteúdos..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7F5B]"
                    />
                  </div>
                </div>

                {renderModuleWithLessons(selectedModule, activeJourney.modules.indexOf(selectedModule), true)}
              </div>
            ) : (
              /* A.2: NENHUM MÓDULO SELECIONADO AINDA -> NÃO MOSTRA VÍDEOS, APENAS VISÃO GERAL DOS MÓDULOS */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>Módulos da Jornada</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                        {activeJourney.modules?.length || 0} módulos
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Selecione um módulo na barra lateral ou clique abaixo para gerenciar seus conteúdos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeJourney.modules?.map((mod, modIdx) => (
                    <div
                      key={mod.id}
                      onClick={() => propOnSelectModuleId?.(mod.id)}
                      className="p-5 bg-[#101B1E] border border-white/10 hover:border-[#FF7F5B]/50 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-7 h-7 rounded-xl bg-[#FF7F5B]/15 text-[#FF7F5B] font-black text-xs flex items-center justify-center border border-[#FF7F5B]/30">
                            #{modIdx + 1}
                          </span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditModule(activeJourney.id, mod)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Editar título do módulo"
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
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Excluir módulo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="text-sm font-bold text-white group-hover:text-[#FF7F5B] transition-colors line-clamp-1">
                          {mod.title}
                        </h5>
                        {mod.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {mod.lessons?.length || 0} {mod.lessons?.length === 1 ? 'conteúdo' : 'conteúdos'}
                        </span>
                        <span className="text-xs font-bold text-[#FF7F5B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Acessar Conteúdos</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* CASO B: JORNADA COM APENAS UM MÓDULO (OU SEM MÓDULOS) -> JÁ EXPANDE OS VÍDEOS DIRETAMENTE */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Conteúdos & Vídeos da Jornada</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {activeJourney.modules?.[0]?.lessons?.length || 0} conteúdos cadastrados
                  </span>
                </h4>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar conteúdos..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7F5B]"
                  />
                </div>
              </div>

              {activeJourney.modules?.[0] ? (
                renderModuleWithLessons(activeJourney.modules[0], 0, false)
              ) : (
                <div className="p-8 bg-[#101B1E] border border-white/10 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
                    <FolderPlus className="w-6 h-6 text-[#FF7F5B]" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Nenhum conteúdo cadastrado nesta jornada</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Adicione o primeiro vídeo ou material de apoio para disponibilizar às famílias.
                  </p>
                  <button
                    onClick={() => openEditJourney(activeJourney)}
                    className="px-4 py-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Jornada para Adicionar Módulos</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">
          Nenhuma jornada disponível. Clique em "Criar Jornada" na barra lateral para começar.
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: CRIAR / EDITAR JORNADA */}
      {/* ==================================================== */}
      {isJourneyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl my-2 sm:my-8 animate-scale-in">
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
                <label className="text-xs font-bold text-slate-300 block">Título:</label>
                <input
                  type="text"
                  value={journeyFormTitle}
                  onChange={(e) => setJourneyFormTitle(e.target.value)}
                  placeholder="Ex: Pais Recém-Nascidos, Construindo Pontes"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Chamada:</label>
                <input
                  type="text"
                  value={journeyFormTagline}
                  onChange={(e) => setJourneyFormTagline(e.target.value)}
                  placeholder="Ex: Gestantes e pais de bebês: leveza para o começo da caminhada."
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Descrição:</label>
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
                  <label className="text-xs font-bold text-slate-300 block">Investimento (R$):</label>
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

              {/* Seletor Slider: Jornada Ativa e Em Breve */}
              <div className="p-3.5 bg-[#070D0F] border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 block">Status da Jornada:</label>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    journeyFormIsComingSoon 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {journeyFormIsComingSoon ? 'Em Breve' : 'Jornada Ativa'}
                  </span>
                </div>
                
                {/* Slider de 2 posições */}
                <div className="relative bg-[#101B1E] p-1 rounded-xl border border-white/10 flex items-center">
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-md ${
                      journeyFormIsComingSoon 
                        ? 'left-[calc(50%+2px)] bg-amber-500' 
                        : 'left-1 bg-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setJourneyFormIsComingSoon(false)}
                    className={`relative z-10 flex-1 py-2 text-xs font-black transition-colors cursor-pointer text-center ${
                      !journeyFormIsComingSoon ? 'text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Jornada Ativa
                  </button>
                  <button
                    type="button"
                    onClick={() => setJourneyFormIsComingSoon(true)}
                    className={`relative z-10 flex-1 py-2 text-xs font-black transition-colors cursor-pointer text-center ${
                      journeyFormIsComingSoon ? 'text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Em Breve
                  </button>
                </div>
              </div>

              {/* Imagem de Fundo do Carrossel (Poster) */}
              <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block">
                      Imagem de Fundo do Carrossel Inicial:
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Exibida exclusivamente como fundo deste slide no topo da página inicial.
                    </span>
                  </div>
                  {journeyFormCoverUrl && (
                    <button
                      type="button"
                      onClick={() => setJourneyFormCoverUrl('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Remover Imagem
                    </button>
                  )}
                </div>

                {/* Preview se houver imagem informada */}
                {journeyFormCoverUrl && (
                  <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-white/15 bg-black/40">
                    <img
                      src={journeyFormCoverUrl}
                      alt="Capa do Carrossel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Ações: Upload do Computador ou Colar Link */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10 shrink-0">
                    <UploadCloud className="w-4 h-4 text-[#FF7F5B]" />
                    <span>{isUploadingJourneyCover ? 'Enviando foto...' : 'Fazer Upload de Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingJourneyCover}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingJourneyCover(true);
                        try {
                          const url = await uploadImageToStorage(file, 'community');
                          if (url) {
                            setJourneyFormCoverUrl(url);
                            notify('success', 'Foto do carrossel carregada com sucesso! 🖼️');
                          } else {
                            notify('error', 'Erro ao processar imagem.');
                          }
                        } catch (err) {
                          notify('error', 'Falha no envio da imagem.');
                        } finally {
                          setIsUploadingJourneyCover(false);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={journeyFormCoverUrl}
                    onChange={(e) => setJourneyFormCoverUrl(e.target.value)}
                    placeholder="Ou cole o link direto da imagem..."
                    className="w-full flex-1 p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FF7F5B]"
                  />
                </div>
              </div>

              {/* Switch: Possui módulo? */}
              <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Possui módulos?</span>
                    <span className="text-[11px] text-slate-400 block">
                      Ative se esta jornada for dividida em múltiplos módulos temáticos.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJourneyFormHasModules(!journeyFormHasModules)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      journeyFormHasModules ? 'bg-[#FF7F5B]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-md ${
                        journeyFormHasModules ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Se o switch for acionado: abre a janela para inserir o nome do módulo e salvar */}
                {journeyFormHasModules && (
                  <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newModuleInput}
                        onChange={(e) => setNewModuleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddModuleToJourney();
                          }
                        }}
                        placeholder="Digite o nome do módulo (ex: Módulo 1: Boas-vindas)..."
                        className="flex-1 p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      />
                      <button
                        type="button"
                        onClick={handleAddModuleToJourney}
                        className="px-3.5 py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>

                    {/* Lista de módulos adicionados com edição inline e exclusão */}
                    {journeyFormModulesList.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Módulos da Jornada ({journeyFormModulesList.length}):
                        </span>
                        {journeyFormModulesList.map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2.5 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white"
                          >
                            <span className="w-5 h-5 rounded-md bg-[#FF7F5B]/15 text-[#FF7F5B] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={m.title}
                              onChange={(e) => {
                                const updated = [...journeyFormModulesList];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setJourneyFormModulesList(updated);
                              }}
                              className="flex-1 bg-transparent border-0 text-xs font-semibold text-white focus:outline-none focus:bg-white/5 px-2 py-0.5 rounded"
                              placeholder="Título do módulo"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveModuleFromJourney(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                              title="Excluir módulo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        💡 Digite o nome do módulo acima e clique em "Adicionar" (você pode inserir quantos módulos quiser).
                      </p>
                    )}
                  </div>
                )}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-2 sm:my-8 animate-scale-in">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-4 shadow-2xl my-2 sm:my-8 animate-scale-in">
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
                  {/* Campo de Subgrupo Temático */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Subgrupo Temático (opcional):
                      </label>
                      <span className="text-[10px] text-slate-500">
                        Ex: Uma Nova Identidade, A Dinâmica do Casal
                      </span>
                    </div>
                    <input
                      type="text"
                      list="subgroup-suggestions-list"
                      value={contentFormSubgroup}
                      onChange={(e) => setContentFormSubgroup(e.target.value)}
                      placeholder="Selecione da lista ou digite um novo subgrupo..."
                      className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                    />
                    <datalist id="subgroup-suggestions-list">
                      {Array.from(new Set(
                        (activeJourney?.modules?.find(m => m.id === editingContent?.moduleId)?.lessons || [])
                          .map(l => l.subgroup || (l.title.includes(': ') ? l.title.split(': ')[0].trim() : ''))
                          .filter(Boolean)
                      )).map(sg => (
                        <option key={sg} value={sg} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Título do Conteúdo:</label>
                    <input
                      type="text"
                      value={contentFormTitle}
                      onChange={(e) => setContentFormTitle(e.target.value)}
                      placeholder="Ex: Quem sou eu agora?"
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
                  {/* SEÇÃO 1: VÍDEO */}
                  <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                      <Video className="w-4 h-4 text-[#FF7F5B]" />
                      <span>Vídeo do Conteúdo</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block">URL do Vídeo (Panda Video, YouTube, Vimeo ou link direto MP4):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={contentFormVideoUrl}
                          onChange={(e) => setContentFormVideoUrl(e.target.value)}
                          placeholder="https://... ou código iframe do Panda Video"
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

                  {/* SEÇÃO 2: THUMBNAIL / CAPA DO VÍDEO */}
                  <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-xs font-bold">
                        <ImageIcon className="w-4 h-4 text-[#FF7F5B]" />
                        <span>Thumbnail / Capa do Conteúdo</span>
                      </div>
                      {contentFormThumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setContentFormThumbnailUrl('')}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover Capa</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Imagem de capa exibida nos carrosséis, na listagem de conteúdos e no player de vídeo antes do play.
                    </p>

                    {/* Preview da Thumbnail */}
                    {(() => {
                      const autoPandaThumb = (() => {
                        const vzMatch = contentFormVideoUrl.match(/vz-([a-z0-9-]+)/i);
                        const vMatch = contentFormVideoUrl.match(/[?&]v=([a-z0-9-]+)/i);
                        if (vzMatch && vMatch) {
                          return `https://thumbs.tv.pandavideo.com.br/vz-${vzMatch[1]}/${vMatch[1]}/cover.jpg`;
                        }
                        return null;
                      })();
                      const activeThumb = contentFormThumbnailUrl || autoPandaThumb;
                      if (!activeThumb) return null;

                      return (
                        <div className="relative aspect-video w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-white/20 bg-slate-950 shadow-md">
                          <img
                            src={activeThumb}
                            alt="Pré-visualização da Thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white font-bold">
                            16:9
                          </div>
                          {!contentFormThumbnailUrl && autoPandaThumb && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-emerald-300 font-bold border border-emerald-500/30 flex items-center justify-center gap-1">
                              <span>✓ Capa oficial detectada do Panda Video</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 block">Link direto da Imagem (opcional):</label>
                      <input
                        type="url"
                        value={contentFormThumbnailUrl}
                        onChange={(e) => setContentFormThumbnailUrl(e.target.value)}
                        placeholder="https://... ou envie uma imagem pelo botão abaixo"
                        className="w-full p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      />
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block my-1">— ou faça upload da capa —</span>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-[#FF7F5B]" />
                        <span>{isUploadingThumb ? 'Enviando imagem...' : 'Upload de Imagem (JPG/PNG/WebP)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          disabled={isUploadingThumb}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* SEÇÃO 3: MATERIAL DE APOIO COM SWITCH */}
                  <div className="p-4 bg-[#070D0F] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-xs font-bold">
                        <FileText className="w-4 h-4 text-[#FFD166]" />
                        <span>Material de Apoio (PDF / Checklist / Guia)</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-[11px] font-bold ${contentFormHasResources ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {contentFormHasResources ? 'Ativado' : 'Desativado'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setContentFormHasResources(!contentFormHasResources)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                            contentFormHasResources ? 'bg-[#FF7F5B]' : 'bg-white/20'
                          }`}
                          title={contentFormHasResources ? 'Desativar material de apoio' : 'Ativar material de apoio'}
                        >
                          <span
                            className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-md ${
                              contentFormHasResources ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {!contentFormHasResources ? (
                      <div className="bg-[#101B1E] border border-white/5 rounded-xl p-3 text-center text-slate-400 text-xs">
                        <span>Este conteúdo não possui material de apoio complementar. A aba de materiais ficará oculta no aplicativo.</span>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-white/10 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-400 block">Título do Material:</label>
                          <input
                            type="text"
                            value={contentFormPdfTitle}
                            onChange={(e) => setContentFormPdfTitle(e.target.value)}
                            placeholder="Ex: Guia Prático de Apoio em PDF"
                            className="w-full p-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                          />
                        </div>

                        <div className="space-y-1.5">
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
                    )}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start animate-fade-in">
          <div className="bg-[#101B1E] border border-rose-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-center my-6 sm:my-16 animate-scale-in">
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

      {/* MODAL: LISTA DE INTERESSADOS NO LANÇAMENTO (SUPABASE) */}
      {isInterestsModalOpen && interestsJourney && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start animate-fade-in">
          <div className="bg-[#101B1E] border border-white/15 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 my-4 sm:my-8">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Interessados no Lançamento
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {interestsJourney.title} • {interestsList.length} {interestsList.length === 1 ? 'interessado' : 'interessados'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInterestsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Lista */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingInterests ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Carregando lista de interessados do Supabase...
                </div>
              ) : interestsList.length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <p className="text-xs text-slate-300 font-bold">Nenhum interessado registrado ainda.</p>
                  <p className="text-[11px] text-slate-500">Quando os usuários clicarem em "Me avisa quando chegar?", os dados aparecerão aqui.</p>
                </div>
              ) : (
                interestsList.map((item, idx) => {
                  const phone = item.user_phone || item.profiles?.phone || null;
                  const name = item.user_name || item.profiles?.name || 'Usuário Visitante';
                  const email = item.user_email || item.profiles?.email || 'E-mail não informado';
                  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
                  const waNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

                  return (
                    <div key={item.id || idx} className="p-3 bg-black/30 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate">{name}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{email}</p>
                      </div>

                      {/* Telefone / WhatsApp direto */}
                      <div className="shrink-0 flex items-center gap-2">
                        {phone && cleanPhone ? (
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Olá, ${name}! Vimos que você pediu para ser avisado sobre o lançamento da Jornada "${interestsJourney.title}" na Elana.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                            title="Abrir conversa direta no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>{phone}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 px-2 py-0.5 rounded bg-white/5">
                            <Phone className="w-3 h-3 text-slate-600" />
                            <span>Sem telefone</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ações do Rodapé */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsInterestsModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={handleExportInterestsCSV}
                disabled={interestsList.length === 0}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Journey, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Play, 
  CheckCircle2, 
  FileText, 
  ChevronLeft, 
  Headphones, 
  Video as VideoIcon, 
  CheckSquare, 
  ListTodo,
  Volume2,
  ChevronDown,
  BookOpen,
  Film
} from 'lucide-react';
import { NotebookModal } from '../components/gamification/NotebookModal';

interface ClassroomPageProps {
  journey: Journey;
  initialLessonId?: string;
  onBackToHome?: () => void;
  onBack?: () => void;
  onOpenCertificate?: (journey: Journey) => void;
}

export const ClassroomPage: React.FC<ClassroomPageProps> = ({
  journey,
  initialLessonId,
  onBackToHome,
  onBack
}) => {
  const handleBack = onBackToHome || onBack || (() => {});
  const { user, completeLesson, saveLessonNote } = useAuth();
  const { showToast } = useToast();
  
  // Find initial lesson or default to first lesson of first module
  const allLessons = journey.modules.flatMap(m => m.lessons);
  const initialLesson = allLessons.find(l => l.id === initialLessonId) || allLessons[0];

  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLesson || {
    id: 'intro',
    title: 'Boas-Vindas e Acolhimento Inicial',
    duration: '03:45 min',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Comece respirando fundo. Aqui você não está só.'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources' | 'practice'>('overview');
  const [noteText, setNoteText] = useState('');
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);

  // Mobile View Tab: 'content' (Player/Tabs) vs 'modules' (List of modules and lessons)
  const [mobileTab, setMobileTab] = useState<'content' | 'modules'>('content');

  // Audio Mode & Speed Controls
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Checklist State for "Para Colocar em Prática Hoje"
  const [completedPractices, setCompletedPractices] = useState<Record<string, boolean>>({});

  // Active Module Dropdown / Accordion Expansion State (Collapsed by default)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Feature 5: Autoplay 5-second countdown state
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const [autoplayTimer, setAutoplayTimer] = useState<number | null>(null);

  // Scroll to top of viewport whenever classroom page opens or lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setExpandedModuleId(null);
    setAutoplayTimer(null);
  }, [activeLesson.id, journey.id]);

  // Carregar anotação existente da aula se houver
  useEffect(() => {
    if (user?.lessonNotes && user.lessonNotes[activeLesson.id]) {
      setNoteText(user.lessonNotes[activeLesson.id]);
    } else {
      setNoteText('');
    }
  }, [activeLesson.id, user?.lessonNotes]);

  // Feature 5: Autoplay Countdown Effect
  useEffect(() => {
    let interval: any;
    if (autoplayTimer !== null && autoplayTimer > 0) {
      interval = setInterval(() => {
        setAutoplayTimer(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (autoplayTimer === 0) {
      if (nextLesson) {
        handleLessonChange(nextLesson);
      }
      setAutoplayTimer(null);
    }
    return () => clearInterval(interval);
  }, [autoplayTimer, nextLesson]);

  const triggerAutoplayCountdown = () => {
    // Marcar aula como concluída no Supabase
    if (completeLesson) {
      completeLesson(activeLesson.id);
    }
    if (nextLesson) {
      setAutoplayTimer(5);
    }
  };

  const cancelAutoplay = () => {
    setAutoplayTimer(null);
  };

  const handleLessonChange = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setAutoplayTimer(null);
    setMobileTab('content');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (saveLessonNote) {
      await saveLessonNote(activeLesson.id, noteText.trim());
    }
    showToast('success', 'Anotação salva com sucesso e sincronizada! 📝');
  };

  const togglePracticeItem = (idx: number) => {
    const key = `${activeLesson.id}-practice-${idx}`;
    setCompletedPractices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute progress percentage
  const completedCount = allLessons.filter(l => user?.completedLessonIds.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  // Practical checklist items generated for current lesson
  const practiceItems = [
    `Aplicar o ritual de respiro de 3 segundos antes de responder ao comportamento do filho.`,
    `Anotar em um papel 1 gatilho de ansiedade observado durante a rotina hoje.`,
    `Dedicar 15 minutos de escuta ativa sem telas ou interrupções no final do dia.`
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto text-white -mt-4">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar às Jornadas
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span 
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: journey.themeColor }}
          ></span>
          <span>{journey.title}</span>
        </div>
      </div>

      {/* ── MOBILE TAB SWITCHER: Aula Atual vs Módulos & Aulas ── */}
      <div className="lg:hidden flex items-center bg-[#101B1E] p-1.5 rounded-2xl border border-white/10 shadow-md">
        <button
          onClick={() => setMobileTab('content')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            mobileTab === 'content'
              ? 'bg-[#FF7F5B] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Aula Atual</span>
        </button>

        <button
          onClick={() => setMobileTab('modules')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            mobileTab === 'modules'
              ? 'bg-[#FF7F5B] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Módulos ({progressPercent}%)</span>
        </button>
      </div>

      {/* Classroom Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Video & Lesson Content Area */}
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === 'content' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Controls Bar for Media Mode & Speed */}
          <div className="bg-[#101B1E] p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Video vs Audio Mode Switcher */}
            <div className="flex items-center bg-[#070D0F] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setMediaMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mediaMode === 'video'
                    ? 'bg-[#FF7F5B] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Vídeo</span>
              </button>

              <button
                onClick={() => setMediaMode('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mediaMode === 'audio'
                    ? 'bg-[#FF7F5B] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Economia de bateria e iluminação reduzida para escuta confortável."
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Só Áudio</span>
              </button>
            </div>

            {/* Right Controls: Playback Speed & Status */}
            <div className="flex items-center gap-2">
              {user?.completedLessonIds.includes(activeLesson.id) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Assistido</span>
                </div>
              )}

              {/* Playback Speed Control */}
              <div className="flex items-center gap-1 bg-[#070D0F] px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Velocidade:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value={1.0} className="bg-[#101B1E]">1.0x Normal</option>
                  <option value={1.25} className="bg-[#101B1E]">1.25x</option>
                  <option value={1.5} className="bg-[#101B1E]">1.5x</option>
                  <option value={2.0} className="bg-[#101B1E]">2.0x Rápido</option>
                </select>
              </div>
            </div>

          </div>

          {/* Media Player Box (Video or Audio Waveform Mode) */}
          {mediaMode === 'video' ? (
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border border-white/10">
              <video
                ref={videoRef}
                key={activeLesson.id}
                controls
                playsInline
                preload="metadata"
                autoPlay={false}
                onEnded={triggerAutoplayCountdown}
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&auto=format&fit=crop&q=80"
              >
                <source src={activeLesson.videoUrl} type="video/mp4" />
                Seu navegador não suporta a execução deste vídeo.
              </video>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#101B1E] to-[#070D0F] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[320px] relative overflow-hidden">
              {/* Animated waveform bars background */}
              <div className="absolute inset-0 flex items-end justify-center gap-[3px] opacity-15 px-8 pb-8 pointer-events-none">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#FF7F5B] rounded-t-full w-1.5"
                    style={{
                      height: `${20 + Math.sin(i * 0.7) * 30 + Math.random() * 25}%`,
                      animation: `audioWave ${0.8 + Math.random() * 0.6}s ease-in-out ${Math.random() * 0.5}s infinite alternate`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 space-y-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/40 text-[#FF7F5B] flex items-center justify-center animate-pulse">
                  <Volume2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider block">
                    🎧 Modo Só Áudio — Mãos Livres
                  </span>
                  <h3 className="text-xl font-bold text-white">{activeLesson.title}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Economia de bateria e iluminação reduzida. Ideal para ouvir enquanto nina, dirige ou descansa.
                  </p>
                </div>

                {/* Audio player + skip controls */}
                <div className="flex items-center gap-3 w-full max-w-md">
                  <button
                    onClick={() => {
                      const audio = document.querySelector<HTMLAudioElement>('#elana-audio-player');
                      if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center text-[10px] font-extrabold transition-all shrink-0"
                    title="Retroceder 10 segundos"
                  >
                    -10s
                  </button>
                  <audio
                    id="elana-audio-player"
                    controls
                    autoPlay
                    onEnded={triggerAutoplayCountdown}
                    className="w-full rounded-xl flex-1"
                  >
                    <source src={activeLesson.videoUrl} type="audio/mp3" />
                  </audio>
                  <button
                    onClick={() => {
                      const audio = document.querySelector<HTMLAudioElement>('#elana-audio-player');
                      if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center text-[10px] font-extrabold transition-all shrink-0"
                    title="Avançar 10 segundos"
                  >
                    +10s
                  </button>
                </div>
              </div>

              <style>{`
                @keyframes audioWave {
                  from { transform: scaleY(0.4); }
                  to   { transform: scaleY(1); }
                }
              `}</style>
            </div>
          )}

          {/* Feature 5: Autoplay 5-Second Countdown Banner Overlay */}
          {autoplayTimer !== null && nextLesson && (
            <div className="bg-gradient-to-r from-[#FF7F5B] via-[#E66795] to-[#FFD166] p-4 sm:p-5 rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black/20 font-black text-base flex items-center justify-center shrink-0 border border-white/30 animate-pulse">
                  {autoplayTimer}s
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                    Autoplay Ativo • Próxima Aula
                  </span>
                  <p className="text-xs font-bold truncate max-w-xs sm:max-w-md">
                    {nextLesson.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    cancelAutoplay();
                    handleLessonChange(nextLesson);
                  }}
                  className="flex-1 sm:flex-initial bg-white text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-slate-100 transition-all text-center"
                >
                  Assistir Agora
                </button>

                <button
                  onClick={cancelAutoplay}
                  className="bg-black/30 hover:bg-black/40 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lesson Overview & Title */}
          <div className="bg-[#101B1E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
            
            <div className="border-b border-white/10 pb-6 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Duração: {activeLesson.duration}</span>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {activeLesson.title}
              </h2>
            </div>

            {/* Lesson Tabs (Overview, Practice Checklist, Notes, Resources) */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-white/10 pb-2 text-xs font-bold overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-[#FF7F5B] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visão Geral
                </button>

                <button
                  onClick={() => setActiveTab('practice')}
                  className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'practice'
                      ? 'border-[#FF7F5B] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5 text-[#FFD166]" />
                  <span>Para Colocar em Prática Hoje</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-[#FF7F5B] text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Minhas Anotações
                </button>

                {activeLesson.resources && activeLesson.resources.length > 0 && (
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === 'resources'
                        ? 'border-[#FF7F5B] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Materiais ({activeLesson.resources.length})
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeLesson.description}
                </p>
              )}

              {/* Tab 2: Para Colocar em Prática Hoje (Checklist) */}
              {activeTab === 'practice' && (
                <div className="space-y-3 bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#FF7F5B]" />
                      Ações Práticas para a Rotina da Família
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Marque conforme você colocar em prática no seu dia a dia:
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {practiceItems.map((item, idx) => {
                      const key = `${activeLesson.id}-practice-${idx}`;
                      const isChecked = !!completedPractices[key];

                      return (
                        <label 
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                            isChecked
                              ? 'bg-[#8A9A5B]/15 border-[#8A9A5B]/40 text-slate-200 line-through opacity-80'
                              : 'bg-[#101B1E] border-white/10 text-white hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePracticeItem(idx)}
                            className="mt-0.5 rounded border-slate-600 text-[#FF7F5B] focus:ring-0"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleSaveNote} className="space-y-3">
                    <textarea
                      rows={4}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Escreva seus pensamentos, reflexões e aprendizados sobre este conteúdo..."
                      className="w-full p-3.5 rounded-xl border border-white/10 text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B]"
                    />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="submit"
                        className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-md"
                      >
                        Salvar Anotação
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsNotebookModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 border border-white/15"
                      >
                        <BookOpen className="w-4 h-4 text-[#FFD166]" />
                        <span>Ver Minhas Anotações & Exportar PDF →</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 4: Materials */}
              {activeTab === 'resources' && activeLesson.resources && (
                <div className="space-y-2">
                  {activeLesson.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      onClick={(e) => { e.preventDefault(); showToast('info', `Download: ${res.title}`); }}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#070D0F] hover:bg-white/5 transition-colors text-xs font-semibold text-white"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FF7F5B]" />
                        <span>{res.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Baixar PDF</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Sidebar: Netflix Episodes Picker with Dropdown & Collapsible Modules */}
        <div className={`space-y-6 ${mobileTab === 'modules' ? 'block animate-fade-in' : 'hidden lg:block'}`}>
          
          {/* Progress Card */}
          <div className="bg-[#101B1E] rounded-3xl p-6 border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Seu Progresso</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, backgroundColor: journey.themeColor }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {completedCount} de {allLessons.length} conteúdos concluídos
            </p>
          </div>

          {/* Module Lessons Suspenso / Accordion Menu */}
          <div className="bg-[#101B1E] rounded-3xl p-6 border border-white/10 shadow-lg space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Módulos e Conteúdos
              </h3>
            </div>

            {/* Collapsible Accordion Modules List */}
            <div className="space-y-3">
              {journey.modules.map(module => {
                const isExpanded = expandedModuleId === module.id;

                return (
                  <div key={module.id} className="border border-white/10 rounded-2xl bg-[#070D0F] overflow-hidden transition-all">
                    
                    {/* Accordion Module Header */}
                    <button
                      onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                      className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                        isExpanded ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="w-6 h-6 rounded-lg bg-[#FF7F5B]/20 text-[#FF7F5B] font-bold text-xs flex items-center justify-center shrink-0">
                          {module.number}
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider truncate">
                          {module.title}
                        </h4>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#FF7F5B]' : ''}`} />
                    </button>

                    {/* Lessons inside Module */}
                    {isExpanded && (
                      <div className="p-2 space-y-1.5 border-t border-white/10 bg-[#101B1E] animate-fade-in">
                        {module.lessons.map(lesson => {
                          const isCurrent = lesson.id === activeLesson.id;
                          const isDone = user?.completedLessonIds.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonChange(lesson)}
                              className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer active:scale-95 ${
                                isCurrent
                                  ? 'bg-[#FF7F5B] text-white font-bold shadow-md'
                                  : 'hover:bg-white/5 text-slate-300'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-400'}`} />
                                ) : (
                                  <Play className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs leading-snug truncate">
                                  {lesson.title}
                                </p>
                                <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>
                                  {lesson.duration}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* Caderno de Anotações & Reflexões Modal */}
      {isNotebookModalOpen && (
        <NotebookModal
          initialJourneyId={journey.id}
          onClose={() => setIsNotebookModalOpen(false)}
        />
      )}

    </div>
  );
};

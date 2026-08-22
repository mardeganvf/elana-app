import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JOURNEYS_DATA } from '../data/journeysData';
import { STORIES_DATA } from '../data/storiesData';
import { Journey, Lesson, CourseModule } from '../types';
import { StoryViewerModal } from '../components/stories/StoryViewerModal';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle2, Lock, Sparkles, X, HelpCircle } from 'lucide-react';

interface HomePageProps {
  onSelectJourney: (journey: Journey) => void;
  onStartLearning: (journey: Journey) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectJourney, onStartLearning }) => {
  const { user } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Active Story modal index state & journey filter
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>('all');

  // Daily Check-in Popup State (Appears on first visit of the day)
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);

  // Check if daily check-in popup has been shown today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userEmail = user?.email || 'guest';
    const hasDoneToday = localStorage.getItem(`elana_daily_checkin_${userEmail}_${todayStr}`);
    if (!hasDoneToday) {
      setIsDailyCheckInOpen(true);
    }
  }, [user?.email]);

  const handleSelectDailyEmotion = (optionId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userEmail = user?.email || 'guest';
    localStorage.setItem(`elana_daily_checkin_${userEmail}_${todayStr}`, optionId);
    setIsDailyCheckInOpen(false);
  };

  // Filtered stories list
  const filteredStories = STORIES_DATA.filter(story => {
    if (selectedStoryFilter === 'all') return true;
    const targetJourney = JOURNEYS_DATA.find(j => j.id === selectedStoryFilter);
    return targetJourney ? story.category === targetJourney.title : true;
  });

  // Selected module index state for each journey
  const [selectedModuleMap, setSelectedModuleMap] = useState<Record<string, number>>({});

  // Background posters matched for each slide
  const SLIDE_POSTERS: Record<string, string> = {
    'pais-recem-nascidos': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1600&auto=format&fit=crop&q=80',
    'construindo-pontes': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&auto=format&fit=crop&q=80',
    'singular': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600&auto=format&fit=crop&q=80',
    'amor-escolhido': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=1600&auto=format&fit=crop&q=80',
    'novos-caminhos': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1600&auto=format&fit=crop&q=80',
    'depois-do-silencio': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&auto=format&fit=crop&q=80'
  };

  // Auto-advance hero slider every 6 seconds unless user hovers
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % JOURNEYS_DATA.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeJourney = JOURNEYS_DATA[currentSlideIndex];

  // Helper for Sentence Case formatting
  const toSentenceCase = (str: string, addPeriod = false) => {
    if (!str) return '';
    const trimmed = str.trim();
    let result = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (addPeriod) {
      result = result.replace(/\?$/, '');
      if (!result.endsWith('.')) {
        result += '.';
      }
    }
    return result;
  };

  // Helper to split subgroup and lesson title
  const formatLessonText = (module: CourseModule, lesson: Lesson) => {
    let subgroup = module.title;
    let videoName = lesson.title;

    if (lesson.title.includes(': ')) {
      const parts = lesson.title.split(': ');
      subgroup = parts[0];
      videoName = parts[1];
    }

    return {
      subgroup: subgroup.toUpperCase(),
      videoName: toSentenceCase(videoName, true)
    };
  };

  return (
    <div className="space-y-14 pb-24 animate-fade-in">
      
      {/* 6-Slider Hero Vitrine */}
      <section 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full min-h-[500px] sm:min-h-[560px] rounded-3xl overflow-hidden flex items-end p-6 sm:p-14 shadow-2xl border border-white/10 my-4 group select-none"
      >
        
        {/* Background Image Slider */}
        {JOURNEYS_DATA.map((journey, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div 
              key={journey.id}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={SLIDE_POSTERS[journey.id]}
                alt={journey.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 hero-vignette"></div>
            </div>
          );
        })}

        {/* Content Details Box */}
        <div className="relative z-10 max-w-2xl space-y-4 animate-fade-in key={activeJourney.id}">
          
          <h1 
            className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md cursor-pointer hover:text-[#FF7F5B] transition-colors"
            style={{ fontFamily: 'var(--font-heading)' }}
            onClick={() => onSelectJourney(activeJourney)}
          >
            {activeJourney.title}
          </h1>

          <div className="space-y-1.5 font-normal leading-relaxed">
            <p className="text-sm sm:text-base font-semibold text-slate-100 italic drop-shadow-sm">
              "{activeJourney.tagline}"
            </p>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-[75%]">
              {activeJourney.description}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => onStartLearning(activeJourney)}
              className="bg-[#FF7F5B] hover:bg-[#e06847] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ver Trilha do Curso</span>
            </button>
          </div>

        </div>

        {/* Slider Indicator Dots */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
          {JOURNEYS_DATA.map((j, idx) => (
            <button
              key={j.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIndex ? 'w-6 bg-[#FF7F5B]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              title={j.title}
            />
          ))}
        </div>

      </section>

      {/* Stories Carousel Header Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#FF7F5B] uppercase tracking-wider block">
              Pílulas de Conhecimento
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Gotas de Respiro & Reflexão
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedStoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                selectedStoryFilter === 'all'
                  ? 'bg-white text-slate-900 border-white shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Todas
            </button>

            {JOURNEYS_DATA.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedStoryFilter(j.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedStoryFilter === j.id
                    ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {j.title}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Cards Circle Row */}
        <div className="flex items-center gap-4 overflow-x-auto py-3 no-scrollbar">
          {filteredStories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setActiveStoryIndex(idx)}
              className="flex flex-col items-center gap-2 group cursor-pointer shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-[#FF7F5B] group-hover:scale-105 transition-all shadow-lg relative bg-gradient-to-tr from-[#FF7F5B] to-[#FFD166]">
                <img
                  src={story.posterUrl}
                  alt={story.title}
                  className="w-full h-full rounded-full object-cover border-2 border-[#070D0F]"
                />
                <div className="absolute inset-0 rounded-full bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-current opacity-90 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate max-w-[90px] text-center">
                {story.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Journeys Modules & Lessons List */}
      {JOURNEYS_DATA.map((journey) => {
        const isPurchased = user?.purchasedJourneyIds.includes(journey.id);
        const selectedModuleIdx = selectedModuleMap[journey.id] || 0;
        const currentModule = journey.modules[selectedModuleIdx] || journey.modules[0];

        return (
          <section key={journey.id} className="space-y-6 pt-4 border-t border-white/10">
            
            {/* Journey Row Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: journey.themeColor }}
                  />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Jornada Oficial
                  </span>
                </div>
                <h3 
                  onClick={() => onSelectJourney(journey)}
                  className="text-2xl sm:text-3xl font-black text-white hover:text-[#FF7F5B] transition-colors cursor-pointer"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {journey.title}
                </h3>
              </div>

              {/* Module Dropdown Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {journey.modules.map((mod, modIdx) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleMap(prev => ({ ...prev, [journey.id]: modIdx }))}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap ${
                      selectedModuleIdx === modIdx
                        ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md font-extrabold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Módulo {mod.number}: {mod.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Lessons Grid for Selected Module */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentModule.lessons.map((lesson, lIdx) => {
                const isCompleted = user?.completedLessonIds.includes(lesson.id);
                const isFirstVideo = lIdx === 0 && selectedModuleIdx === 0;
                const isUnlocked = isPurchased || isFirstVideo;
                const { subgroup, videoName } = formatLessonText(currentModule, lesson);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (isUnlocked) {
                        onStartLearning(journey);
                      }
                    }}
                    className={`group bg-[#101B1E] rounded-3xl overflow-hidden border border-white/10 transition-all hover:border-[#FF7F5B]/50 hover:shadow-2xl flex flex-col justify-between ${
                      isUnlocked ? 'cursor-pointer' : 'opacity-85'
                    }`}
                  >
                    {/* Thumbnail Box */}
                    <div className="relative aspect-video overflow-hidden bg-black/40">
                      <img
                        src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80"
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101B1E] via-transparent to-black/30" />

                      {/* Play Overlay Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#FF7F5B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white border border-white/10">
                        {lesson.duration}
                      </div>
                    </div>

                    {/* Lesson Content Text Box */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        
                        {/* Status Label */}
                        <div className="flex items-center justify-between min-h-[18px]">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> Concluída
                            </span>
                          ) : !isPurchased && isFirstVideo ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 fill-current" /> Assista agora
                            </span>
                          ) : !isUnlocked ? (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> Conteúdo exclusivo
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-0 select-none pointer-events-none">•</span>
                          )}
                        </div>

                        {/* Subgrupo em UPPER CASE */}
                        <span className="text-[11px] font-extrabold text-slate-400 block tracking-wider uppercase truncate">
                          {subgroup}
                        </span>

                        {/* Nome do vídeo em font-heading, Sentence Case, Ponto Final */}
                        <h4 
                          className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-[#FF7F5B] transition-colors normal-case truncate block"
                          style={{ fontFamily: 'var(--font-heading)' }}
                          title={videoName}
                        >
                          {videoName}
                        </h4>
                      </div>

                      {/* Descrição curta do vídeo */}
                      <p 
                        className="text-xs font-normal text-slate-400 leading-relaxed line-clamp-2 pt-1 border-t border-white/5"
                        title={lesson.description}
                      >
                        {lesson.description}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </section>
        );
      })}

      {/* Vertical Video Stories Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={STORIES_DATA}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

      {/* DAILY CHECK-IN POPUP MODAL (Appears on first visit of the day matching exact design) */}
      {isDailyCheckInOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#0D1518] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-center space-y-6 m-auto">
            
            {/* Close Modal Button */}
            <button
              onClick={() => setIsDailyCheckInOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFD166]/15 border border-[#FFD166]/30 text-[#FFD166] flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FFD166]">
                <span>CHECK-IN EMOCIONAL DIÁRIO</span>
                <div title="Registre como está se sentindo hoje para acompanhar sua evolução emocional no diário.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Como você está se sentindo hoje?
              </h3>
            </div>

            {/* 4 Official Options Grid (Matching exact screenshot layout) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSelectDailyEmotion('sem_energia')}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#132024] hover:bg-[#1b2b30] border border-white/10 transition-all cursor-pointer text-left group hover:scale-102"
              >
                <span className="text-2xl">🪫</span>
                <span className="text-sm font-bold text-white group-hover:text-[#FF7F5B] transition-colors">
                  Sem Energia
                </span>
              </button>

              <button
                onClick={() => handleSelectDailyEmotion('com_esperanca')}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#132024] hover:bg-[#1b2b30] border border-white/10 transition-all cursor-pointer text-left group hover:scale-102"
              >
                <span className="text-2xl">☀️</span>
                <span className="text-sm font-bold text-white group-hover:text-[#FFD166] transition-colors">
                  Com Esperança
                </span>
              </button>

              <button
                onClick={() => handleSelectDailyEmotion('celebrando')}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#132024] hover:bg-[#1b2b30] border border-white/10 transition-all cursor-pointer text-left group hover:scale-102"
              >
                <span className="text-2xl">🎉</span>
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Celebrando
                </span>
              </button>

              <button
                onClick={() => handleSelectDailyEmotion('precisando_luz')}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#132024] hover:bg-[#1b2b30] border border-white/10 transition-all cursor-pointer text-left group hover:scale-102"
              >
                <span className="text-2xl">🆘</span>
                <span className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  Precisando de Luz
                </span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

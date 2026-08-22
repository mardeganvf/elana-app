import React, { useState, useEffect } from 'react';
import { JOURNEYS_DATA } from '../data/journeysData';
import { STORIES_DATA } from '../data/storiesData';
import { Journey, Lesson, CourseModule } from '../types';
import { JourneyCard } from '../components/catalog/JourneyCard';
import { StoryViewerModal } from '../components/stories/StoryViewerModal';
import { useAuth } from '../context/AuthContext';
import { Play, Flame, CheckCircle2, ChevronDown, Lock, Sparkles, Instagram } from 'lucide-react';

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

  // Filtered stories list
  const filteredStories = STORIES_DATA.filter(story => {
    if (selectedStoryFilter === 'all') return true;
    const targetJourney = JOURNEYS_DATA.find(j => j.id === selectedStoryFilter);
    return targetJourney ? story.category === targetJourney.title : true;
  });

  // Selected module index state for each journey (e.g., { 'pais-recem-nascidos': 0, 'construindo-pontes': 0 })
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

  // Lesson thumbnails mapping
  const LESSON_THUMBS: Record<string, string> = {
    'prn-1-1': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    'prn-1-2': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=80',
    'prn-1-3': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    'prn-1-4': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=500&auto=format&fit=crop&q=80',
    'prn-1-5': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    'prn-1-6': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    'prn-1-7': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    'prn-1-8': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    'prn-1-9': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    'prn-1-10': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&auto=format&fit=crop&q=80',
    'prn-1-11': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop&q=80',
    'prn-1-12': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',
    'prn-1-13': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    'prn-1-14': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=80',
    'prn-1-15': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    'prn-1-16': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=500&auto=format&fit=crop&q=80',
    'prn-1-17': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',

    'prn-2-1': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&auto=format&fit=crop&q=80',
    'prn-2-2': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&auto=format&fit=crop&q=80',
    'prn-2-3': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',

    'cp-1-1': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    'cp-1-2': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    'cp-1-3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',

    'sing-1-1': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&auto=format&fit=crop&q=80',
    'sing-1-2': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',

    'ae-1-1': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=500&auto=format&fit=crop&q=80',
    'ae-2-1': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=80',

    'nc-1-1': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    'nc-2-1': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',

    'dds-1-1': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',
    'dds-2-1': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=500&auto=format&fit=crop&q=80'
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



  const purchasedJourneys = JOURNEYS_DATA.filter(j => user?.purchasedJourneyIds.includes(j.id));

  // Helper for Sentence Case formatting (Capitalize first letter only)
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

  // Helper to split subgroup (UPPERCASE) and lesson title (Sentence Case with period)
  const formatLessonText = (module: CourseModule, lesson: Lesson) => {
    let subgroup = module.title;
    let videoName = lesson.title;

    if (lesson.title.includes(': ')) {
      const parts = lesson.title.split(': ');
      subgroup = parts[0];
      videoName = parts[1];
    }

    return {
      subgroup: subgroup.toUpperCase(), // UPPER CASE for Subgroup Box Title
      videoName: toSentenceCase(videoName, true) // Sentence case with period for video name
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

        </div>

        {/* 6 Slider Dots / Indicators */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
          {JOURNEYS_DATA.map((journey, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={journey.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-8 bg-[#FF7F5B]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                title={journey.title}
              />
            );
          })}
        </div>

      </section>

      {/* Row: Continuar Assistindo (If user has purchased journeys) */}
      {purchasedJourneys.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Flame className="w-5 h-5 text-[#FF7F5B] fill-current" />
              Continuar Assistindo ({purchasedJourneys.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedJourneys.map(journey => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                onSelect={onSelectJourney}
                onStartLearning={onStartLearning}
              />
            ))}
          </div>
        </section>
      )}

      {/* NEW SECTION: Stories em Vídeo Vertical (Posicionado entre Continuar Assistindo e PRN) */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 
            className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2.5 uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] p-[2px] flex items-center justify-center shadow-lg">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <span>Destaques</span>
          </h2>
        </div>

        {/* Filter Pills Bar for Stories by Journey */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedStoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 ${
              selectedStoryFilter === 'all'
                ? 'bg-[#FF7F5B] text-white shadow-md'
                : 'bg-[#162327] text-slate-300 hover:bg-[#1f3137] border border-white/10'
            }`}
          >
            Todas as Jornadas ({STORIES_DATA.length})
          </button>

          {JOURNEYS_DATA.map(j => {
            const count = STORIES_DATA.filter(s => s.category === j.title).length;
            if (count === 0) return null;
            return (
              <button
                key={j.id}
                onClick={() => setSelectedStoryFilter(j.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold shrink-0 transition-all ${
                  selectedStoryFilter === j.id
                    ? 'bg-[#FF7F5B] text-white shadow-md'
                    : 'bg-[#162327] text-slate-300 hover:bg-[#1f3137] border border-white/10'
                }`}
              >
                {j.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Stories Horizontal Carousel of Vertical 9:16 Custom Cover Art Cards */}
        <div 
          id="carousel-destaques"
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth"
        >
          {filteredStories.map((story) => {
            const originalIndex = STORIES_DATA.findIndex(s => s.id === story.id);
            return (
              <div
                key={story.id}
                onClick={() => setActiveStoryIndex(originalIndex !== -1 ? originalIndex : 0)}
                className="group flex-none w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden relative cursor-pointer border border-white/15 shadow-xl hover:border-[#FF7F5B] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Vertical Poster Image (Full Custom Cover Art) */}
                <img
                  src={story.posterUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Vignette Overlay for Avatar */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none"></div>

                {/* Top Author Avatar with Instagram Ring */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] shadow-md group-hover:scale-110 transition-transform">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className="w-full h-full object-cover rounded-full border border-black"
                    />
                  </div>
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[1px]">
                  <div className="w-11 h-11 rounded-full bg-[#FF7F5B] text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 06 Blocks: One Block for Each Journey with Horizontal Scrollable Lesson Thumbs */}
      {JOURNEYS_DATA.map((journey) => {
        const isPurchased = user?.purchasedJourneyIds.includes(journey.id);
        const hasMultipleModules = journey.modules.length > 1;

        // Current selected module index (default to 0)
        const selectedModuleIdx = selectedModuleMap[journey.id] ?? 0;
        const currentModule = journey.modules[selectedModuleIdx] || journey.modules[0];
        const displayLessons = currentModule.lessons;
        const carouselId = `carousel-journey-${journey.id}`;

        return (
          <section key={journey.id} className="space-y-4">
            
            {/* Journey Header Bar (3-Line Clean Layout) */}
            <div className="border-b border-white/10 pb-4 space-y-2">
              
              {/* Line 1: Nome da Jornada */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer group/title"
                  onClick={() => isPurchased ? onStartLearning(journey) : onSelectJourney(journey)}
                >
                  <div 
                    className="w-3.5 h-8 rounded-full shrink-0" 
                    style={{ backgroundColor: journey.themeColor }}
                  ></div>
                  <h2 
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none group-hover/title:text-[#FF7F5B] transition-colors"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {journey.title}
                  </h2>
                </div>
              </div>

              {/* Line 2: Texto de Apoio entre aspas */}
              <p className="text-xs sm:text-sm text-slate-300 italic pl-6 leading-relaxed">
                "{journey.tagline}"
              </p>

              {/* Line 3: Seletor do Módulo Embaixo (Apenas se tiver mais de 1 módulo: PRN e PON) */}
              {hasMultipleModules && (
                <div className="pl-6 pt-1">
                  <div className="relative inline-flex items-center">
                    <select
                      value={selectedModuleIdx}
                      onChange={(e) => {
                        const newIdx = Number(e.target.value);
                        setSelectedModuleMap(prev => ({ ...prev, [journey.id]: newIdx }));
                      }}
                      className="appearance-none bg-[#162327] hover:bg-[#1f3137] text-white font-bold text-xs px-3.5 py-2 pr-8 rounded-xl border border-white/20 focus:outline-none focus:border-[#FF7F5B] cursor-pointer shadow-md transition-colors"
                    >
                      {journey.modules.map((mod, idx) => (
                        <option key={mod.id} value={idx} className="bg-[#101B1E] text-white py-1">
                          Módulo 0{mod.number}: {mod.title} ({mod.lessons.length} conteúdos)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
              )}

            </div>

            {/* Horizontal Scrollable Carousel of Lessons for Selected Module */}
            <div 
              id={carouselId}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 custom-scrollbar scroll-smooth"
            >
              {displayLessons.map((lesson, lessonIndex) => {
                const { subgroup, videoName } = formatLessonText(currentModule, lesson);
                const thumb = LESSON_THUMBS[lesson.id] || SLIDE_POSTERS[journey.id];
                const isCompleted = user?.completedLessonIds.includes(lesson.id);

                // Lock rule:
                // If journey is purchased: All lessons unlocked.
                // If journey is NOT purchased: 1st video (lessonIndex === 0 && selectedModuleIdx === 0) is FREE preview ("Assista agora"), remaining are LOCKED.
                const isFirstVideo = lessonIndex === 0 && selectedModuleIdx === 0;
                const isUnlocked = isPurchased || isFirstVideo;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => isUnlocked ? onStartLearning(journey) : onSelectJourney(journey)}
                    className={`group flex-none w-64 sm:w-72 bg-[#101B1E] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
                      isCompleted ? 'border-[#8A9A5B]/40 bg-[#101B1E]/90' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                      <img
                        src={thumb}
                        alt={lesson.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          !isUnlocked ? 'opacity-50 grayscale-[30%]' : isCompleted ? 'opacity-65 group-hover:opacity-85' : 'opacity-85 group-hover:opacity-100'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101B1E] via-transparent to-transparent"></div>

                      {/* Top-Left 'Já Assistido' Badge */}
                      {isCompleted && (
                        <div className="absolute top-2 left-2 z-10 bg-[#8A9A5B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md backdrop-blur-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 fill-current" />
                          <span>Já Assistido</span>
                        </div>
                      )}

                      {/* Top-Left 'Assista agora' Badge for 1st video of unpurchased journeys */}
                      {!isPurchased && isFirstVideo && !isCompleted && (
                        <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-md backdrop-blur-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-current" />
                          <span>Assista agora</span>
                        </div>
                      )}

                      {/* Top-Right ONLY Lock Icon Badge for locked videos (without text) */}
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 z-10 bg-black/80 text-amber-400 p-1.5 rounded-md border border-amber-500/30 backdrop-blur-md flex items-center justify-center shadow-md">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      )}

                      {/* Play or Lock Overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        {isUnlocked ? (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: journey.themeColor }}
                          >
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-white">
                            <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 transition-transform">
                              <Lock className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-black/80 text-amber-300 px-3 py-1 rounded-md shadow-md border border-amber-500/30">
                              Quero fazer parte!
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Duration badge */}
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-white border border-white/10">
                        {lesson.duration}
                      </span>
                    </div>

                    {/* Lesson Text Below Thumbnail (Fixed h-[142px] for uniform card height with 2-line description) */}
                    <div className="p-4 bg-[#101B1E] h-[142px] flex flex-col justify-between space-y-1.5">
                      <div className="space-y-0.5">
                        {/* Fixed h-4 slot for 'Já assistido' / 'Assista agora' / 'Conteúdo exclusivo' line so height never changes */}
                        <div className="h-4 flex items-center">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-[#8A9A5B] flex items-center gap-1 tracking-wide">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Já assistido
                            </span>
                          ) : !isPurchased && isFirstVideo ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 tracking-wide">
                              <Sparkles className="w-3 h-3 shrink-0 fill-current" /> Assista agora
                            </span>
                          ) : !isUnlocked ? (
                            <span className="text-[10px] font-bold text-amber-400/90 flex items-center gap-1 tracking-wide">
                              <Lock className="w-3 h-3 shrink-0" /> Conteúdo exclusivo
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-0 select-none flex items-center gap-1 pointer-events-none" aria-hidden="true">
                              <CheckCircle2 className="w-3 h-3 shrink-0" /> Placeholder
                            </span>
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

                      {/* Descrição curta do vídeo: Sem título, sem negrito, máx 2 linhas (...) e tooltip no hover */}
                      <p 
                        className="text-xs font-normal text-slate-400 leading-relaxed line-clamp-2 cursor-pointer hover:text-slate-200 transition-colors pt-1 border-t border-white/5"
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

    </div>
  );
};

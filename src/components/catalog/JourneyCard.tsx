import React from 'react';
import { Journey } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Play, Lock, Info, Sparkles, Bell, Check } from 'lucide-react';
import { useJourneyNotifications } from '../../hooks/useJourneyNotifications';

interface JourneyCardProps {
  journey: Journey;
  onSelect: (journey: Journey) => void;
  onStartLearning?: (journey: Journey, lessonId?: string) => void;
}

// Helper to format text to Sentence case with period
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

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey, onSelect, onStartLearning }) => {
  const { user } = useAuth();
  const { isJourneyNotified, toggleJourneyNotification } = useJourneyNotifications();
  const isPurchased = user?.purchasedJourneyIds.includes(journey.id);
  const isNotified = isJourneyNotified(journey.id);

  // Calculate progress
  const allLessons = journey.modules.flatMap(m => m.lessons);
  const totalLessons = allLessons.length;
  const completedLessonsInJourney = allLessons.filter(l => user?.completedLessonIds.includes(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsInJourney / totalLessons) * 100) : 0;

  // Next or current lesson to watch
  const nextLesson = allLessons.find(l => !user?.completedLessonIds.includes(l.id)) || allLessons[0];

  // Helper to extract subgroup (UPPERCASE) and video name (Sentence case with period)
  const getDisplayDetails = () => {
    if (!nextLesson) {
      return {
        subgroup: journey.title.toUpperCase(),
        videoName: toSentenceCase(journey.title, true)
      };
    }

    let subgroupText = nextLesson.subgroup || journey.modules[0]?.title || journey.title;
    let videoTitleText = nextLesson.title;

    if (!nextLesson.subgroup && nextLesson.title.includes(': ')) {
      const parts = nextLesson.title.split(': ');
      subgroupText = parts[0];
      videoTitleText = parts.slice(1).join(': ');
    }

    return {
      subgroup: subgroupText.toUpperCase(),
      videoName: toSentenceCase(videoTitleText, true)
    };
  };

  const { subgroup, videoName } = getDisplayDetails();

  // Unsplash high quality posters matched to each journey theme
  const POSTERS: Record<string, string> = {
    'pais-recem-nascidos': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop&q=80',
    'construindo-pontes': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    'singular': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80',
    'amor-escolhido': 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=600&auto=format&fit=crop&q=80',
    'novos-caminhos': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=80',
    'depois-do-silencio': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80'
  };

  const posterImage = POSTERS[journey.id] || POSTERS['pais-recem-nascidos'];

  return (
    <div 
      className={`group relative bg-[#101B1E] rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer active:scale-[0.98] ${
        journey.isComingSoon
          ? 'opacity-75 hover:opacity-90 border-white/5 bg-[#0e1618] shadow-none hover:shadow-lg'
          : 'border-white/10 shadow-lg hover:shadow-2xl'
      }`}
      onClick={() => {
        if (journey.isComingSoon) {
          toggleJourneyNotification(journey.id, journey.title);
        } else if (isPurchased && onStartLearning) {
          onStartLearning(journey, nextLesson?.id);
        } else {
          onSelect(journey);
        }
      }}
    >
      
      {/* Poster Image with Dark Vignette Gradient */}
      <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={posterImage}
          alt={journey.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            journey.isComingSoon
              ? 'grayscale opacity-70 group-hover:opacity-85'
              : 'opacity-80 group-hover:opacity-100'
          }`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#101B1E] via-[#101B1E]/40 to-transparent"></div>

        {/* Top Badges (Only on catalog cards) */}
        {!isPurchased && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {journey.isComingSoon ? (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md bg-amber-500 text-slate-950">
                EM BREVE
              </span>
            ) : (
              <span 
                className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur-md text-white"
                style={{ backgroundColor: `${journey.themeColor}dd` }}
              >
                {journey.subtitle}
              </span>
            )}
            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              {journey.pillarAttribute}
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
          journey.isComingSoon ? 'bg-black/40' : 'bg-black/40 backdrop-blur-[2px]'
        }`}>
          {journey.isComingSoon ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleJourneyNotification(journey.id, journey.title);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer ${
                isNotified
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              {isNotified ? <Check className="w-4 h-4 stroke-[3]" /> : <Bell className="w-4 h-4 fill-current" />}
              <span>{isNotified ? 'Avisaremos você!' : 'Me avisa quando chegar?'}</span>
            </button>
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 transition-transform"
              style={{ backgroundColor: journey.themeColor }}
            >
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          )}
        </div>

        {/* Purchased Progress Bar Overlay on Poster */}
        {isPurchased && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-10">
            <div 
              className="h-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: journey.themeColor }}
            ></div>
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between overflow-hidden">
        
        {isPurchased ? (
          /* Purchased Content Layout (Continuar Assistindo) */
          <div className="space-y-1.5 min-w-0">
            {/* Subgroup Title (UPPER CASE) + Progress % */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-[11px] font-extrabold text-[#FF7F5B] tracking-wider uppercase truncate flex-1">
                {subgroup}
              </span>
              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                {progressPercent}% Concluído
              </span>
            </div>

            {/* Video Lesson Name (Sentence Case, Ponto Final, font-heading, 2 lines) */}
            <h4 
              className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug group-hover:text-[#FF7F5B] transition-colors normal-case line-clamp-2 block"
              style={{ fontFamily: 'var(--font-heading)' }}
              title={videoName}
            >
              {videoName}
            </h4>
          </div>
        ) : (
          /* Non-Purchased Content Layout (Catalog Card) */
          <div className="space-y-2">
            {/* Metadata Row: Match %, Modules, Price */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#8A9A5B] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                98% Afinidade
              </span>
              <span className="text-slate-400 font-medium">
                {journey.modules.length} Módulos
              </span>
              <span className="text-white font-extrabold ml-auto">
                R$ {journey.price}
              </span>
            </div>

            {/* Journey Title */}
            <h3 
              className="text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-[#FF7F5B] transition-colors normal-case"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {toSentenceCase(journey.title)}
            </h3>

            {/* Tagline */}
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              "{journey.tagline}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          {!isPurchased && (
            <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 truncate">
              <strong className="text-slate-200">Foco:</strong> {journey.targetAudience}
            </div>
          )}

          {journey.isComingSoon ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleJourneyNotification(journey.id, journey.title);
              }}
              className={`w-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer ${
                isNotified
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
              }`}
            >
              {isNotified ? <Check className="w-4 h-4 stroke-[3]" /> : <Bell className="w-4 h-4 fill-current" />}
              <span>{isNotified ? 'Avisaremos você!' : 'Me avisa quando chegar?'}</span>
            </button>
          ) : isPurchased ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onStartLearning) onStartLearning(journey, nextLesson?.id);
              }}
              className="w-full flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all hover:brightness-110"
              style={{ backgroundColor: journey.themeColor }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {progressPercent > 0 ? 'Continuar Assistindo' : 'Iniciar Conteúdos'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(journey);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl border border-white/10 transition-all text-center"
              >
                <Info className="w-3.5 h-3.5 inline mr-1" />
                Detalhes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(journey);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-md transition-all hover:brightness-110"
                style={{ backgroundColor: journey.themeColor }}
              >
                <Lock className="w-3.5 h-3.5" />
                Adquirir
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { StoryItem } from '../../types';
import { X, Heart, Share2, Volume2, VolumeX, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentStory = stories[currentIndex];

  // Prevent background body scrolling when story modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleVideoEnd = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap(prev => ({
      ...prev,
      [currentStory.id]: !prev[currentStory.id]
    }));
  };

  if (!currentStory) return null;

  const isLiked = likedMap[currentStory.id];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      
      {/* Centered Compact 9:16 Story Frame Container */}
      <div 
        className="relative w-[340px] sm:w-[380px] aspect-[9/16] max-h-[85vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between select-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Progress Bars (Story Indicators) */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
          {stories.map((story, idx) => {
            let barWidth = '0%';
            if (idx < currentIndex) barWidth = '100%';
            if (idx === currentIndex) barWidth = `${progress}%`;

            return (
              <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: barWidth }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Top Header Row (Author Info on Left, Mute & Close X on Right) */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between">
          
          {/* Avatar do Autor */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#E66795] via-[#FF7F5B] to-[#FFD166] shadow-md shrink-0">
              <img
                src={currentStory.authorAvatar}
                alt={currentStory.authorName}
                className="w-full h-full object-cover rounded-full border border-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight drop-shadow">
                  {currentStory.authorName}
                </span>
                <span className="text-[9px] text-slate-300 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                  {currentStory.date}
                </span>
              </div>
              <span className="text-[10px] text-slate-300 block drop-shadow">
                {currentStory.authorHandle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md"
              title={isMuted ? "Ativar Áudio" : "Mutar Áudio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md"
              title="Fechar Story"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Main Vertical 9:16 Video Player Container */}
        <div 
          className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={currentStory.videoUrl}
            poster={currentStory.posterUrl}
            playsInline
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          />

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

          {/* Pause Indicator Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/70 text-white flex items-center justify-center shadow-2xl border border-white/20">
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Previous Story Arrow Button On Left */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-md transition-all active:scale-90"
              title="Story Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next Story Arrow Button On Right */}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-md transition-all active:scale-90"
              title="Próximo Story"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* Bottom Story Text & Action Buttons */}
        <div className="absolute bottom-3 left-3 right-3 z-30 space-y-2">
          
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FF7F5B] bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 px-2 py-0.5 rounded-full backdrop-blur-md inline-block">
              {currentStory.category}
            </span>
            <p className="text-xs font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
              {currentStory.title}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md transition-all ${
                isLiked ? 'bg-rose-500 text-white' : 'bg-black/60 text-slate-200 border border-white/10 hover:bg-black/80'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : ''}`} />
              <span>{currentStory.likes + (isLiked ? 1 : 0)}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({ title: currentStory.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-slate-200 border border-white/10 backdrop-blur-md hover:bg-black/80 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

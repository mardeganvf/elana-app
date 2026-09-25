import React, { useState, useEffect, useRef } from 'react';
import { Journey, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useJourneys } from '../context/JourneysContext';
import { 
  Play, 
  CheckCircle2, 
  FileText, 
  ChevronLeft, 
  Headphones, 
  Video as VideoIcon, 
  Volume2,
  ChevronDown,
  BookOpen,
  Film,
  RotateCcw,
  Check,
  Pause,
  Lock,
  ShoppingCart,
  ShieldAlert,
  RefreshCw,
  X,
  Award
} from 'lucide-react';
import { NotebookModal } from '../components/gamification/NotebookModal';
import { CheckoutModal } from '../components/catalog/CheckoutModal';
import { supabase } from '../lib/supabase';

// Helper to resolve embed URL (Panda Video, YouTube, Vimeo, iframe code)
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If pasted an iframe code snippet: <iframe src="...">
  if (cleanUrl.startsWith('<iframe')) {
    const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
  }

  // Panda Video
  if (cleanUrl.includes('pandavideo.com.br') || cleanUrl.includes('b-cdn.net')) {
    return cleanUrl;
  }

  // YouTube
  if (cleanUrl.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(cleanUrl);
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    } catch (_) {}
  }
  if (cleanUrl.includes('youtu.be/')) {
    const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
  if (cleanUrl.includes('youtube.com/embed/')) {
    return cleanUrl;
  }

  // Vimeo
  if (cleanUrl.includes('vimeo.com/') && !cleanUrl.includes('player.vimeo.com')) {
    const vimeoId = cleanUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  }
  if (cleanUrl.includes('player.vimeo.com')) {
    return cleanUrl;
  }

  return null;
};

interface ClassroomPageProps {
  journey: Journey;
  initialLessonId?: string;
  onBackToHome?: () => void;
  onBack?: () => void;
  onOpenCertificate?: (journey: Journey) => void;
  onOpenCheckout?: (journey: Journey) => void;
}

export const ClassroomPage: React.FC<ClassroomPageProps> = ({
  journey,
  initialLessonId,
  onBackToHome,
  onBack,
  onOpenCertificate,
  onOpenCheckout
}) => {
  const handleBack = onBackToHome || onBack || (() => {});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleUnlock = () => {
    if (onOpenCheckout) {
      onOpenCheckout(currentJourney);
    } else {
      setIsCheckoutModalOpen(true);
    }
  };
  const { user, completeLesson, toggleCompleteLesson, saveLessonNote, awardBadge, recordDailyVisit } = useAuth();
  const { showToast } = useToast();
  const { journeys } = useJourneys();

  // 🌿 Registra presença diária ao abrir a sala de aula (mesmo se o usuário apenas assistir e sair)
  useEffect(() => {
    if (recordDailyVisit) {
      recordDailyVisit();
    }
  }, [recordDailyVisit]);

  // Garante que a jornada usada na sala seja a versão mais atualizada e sincronizada
  const currentJourney = journeys.find(j => j.id === journey.id) || journey;
  const allLessons = currentJourney.modules.flatMap(m => m.lessons);

  // Encontra a próxima aula pendente (não assistida) para retomar de onde parou
  const nextUncompletedLesson = allLessons.find(l => !user?.completedLessonIds.includes(l.id)) || allLessons[0];
  const initialLesson = (initialLessonId && allLessons.find(l => l.id === initialLessonId)) 
    || nextUncompletedLesson 
    || allLessons[0];

  const [activeLessonId, setActiveLessonId] = useState<string>(initialLesson?.id || 'prn-1-1');

  // Sincroniza a lição ativa quando o usuário clica em um card específico na Home ou para Continuar
  useEffect(() => {
    if (initialLessonId) {
      setActiveLessonId(initialLessonId);
    } else if (nextUncompletedLesson?.id) {
      setActiveLessonId(nextUncompletedLesson.id);
    }
  }, [initialLessonId, journey.id]);

  // Sincroniza dinamicamente a lição ativa com as alterações em tempo real da jornada
  const activeLesson: Lesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0] || initialLesson || {
    id: 'intro',
    title: 'Boas-Vindas e Acolhimento Inicial',
    duration: '03:45 min',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Comece respirando fundo. Aqui você não está só.'
  };

  // ── ACCESS GATE (Defesa em Profundidade: Client-State + Server-Side RPC) ────
  // A 1ª aula do 1º módulo é sempre a degustação gratuita.
  const isPurchased = user?.purchasedJourneyIds?.includes(currentJourney.id) ?? false;
  const freePreviewLessonId = currentJourney.modules[0]?.lessons[0]?.id;
  const isFreePreview = activeLesson.id === freePreviewLessonId;

  // Estado de autorização autoritativa validada pelo servidor
  const [serverAuthorized, setServerAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isFreePreview) {
      setServerAuthorized(true);
      return;
    }

    if (!user) {
      setServerAuthorized(false);
      return;
    }

    const checkServerAccess = async () => {
      try {
        const { data, error } = await supabase.rpc('verify_lesson_access', {
          p_journey_id: currentJourney.id,
          p_lesson_id: activeLesson.id,
        });

        if (!isMounted) return;

        if (!error && typeof data === 'boolean') {
          setServerAuthorized(data);
        } else {
          // Fallback defensivo com base em privilégios caso a RPC retorne nulo ou erro de migração
          const fallback = user.role === 'admin' || user.role === 'superadmin' || Boolean(user.purchasedJourneyIds?.includes(currentJourney.id));
          setServerAuthorized(fallback);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = user.role === 'admin' || user.role === 'superadmin' || Boolean(user.purchasedJourneyIds?.includes(currentJourney.id));
          setServerAuthorized(fallback);
        }
      }
    };

    checkServerAccess();

    return () => {
      isMounted = false;
    };
  }, [activeLesson.id, currentJourney.id, user?.id, isFreePreview]);

  // Se o servidor desautorizar ou se ainda não validou e não consta localmente, bloqueia
  const isCurrentLessonLocked = !isFreePreview && (
    serverAuthorized === false ||
    (serverAuthorized === null && !isPurchased && user?.role !== 'admin' && user?.role !== 'superadmin')
  );

  // URL segura: se bloqueado, a URL de streaming NUNCA é enviada ao DOM ou executada
  const safeVideoUrl = isCurrentLessonLocked ? '' : (activeLesson.videoUrl || '');

  // Helper: Format seconds into MM:SS
  const formatSecondsToTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources'>('overview');
  const [noteText, setNoteText] = useState('');
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);

  // Mobile View Tab: 'content' (Player/Tabs) vs 'modules' (List of modules and lessons)
  const [mobileTab, setMobileTab] = useState<'content' | 'modules'>('content');

  // Audio Mode & Speed Controls
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Adblock & Privacy Shield Fallback State [MEDIA-ADBK-01]
  const [adblockWarning, setAdblockWarning] = useState(false);
  const [playerReloadKey, setPlayerReloadKey] = useState(0);
  const hasReceivedVideoEventRef = useRef(false);

  // Helper para converter "14 min" ou "14:00" em segundos
  const parseDurationToSeconds = (durStr?: string) => {
    if (!durStr) return 0;
    const minMatch = durStr.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1], 10) * 60;
    const parts = durStr.split(':');
    if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    return 0;
  };

  // Aplicação da taxa de velocidade no Panda Video e no HTML5 Video
  const applyPlaybackSpeed = (speed: number) => {
    // 1. HTML5 Video
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    // 2. Panda Player API
    try {
      if ((window as any).PandaPlayer) {
        const panda = new (window as any).PandaPlayer('panda-player');
        if (panda && typeof panda.setSpeed === 'function') {
          panda.setSpeed(speed);
        }
      }
    } catch (e) {}
    // 3. Panda Player postMessage
    try {
      const iframe = document.getElementById('panda-player') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ message: 'setSpeed', value: speed }, '*');
        iframe.contentWindow.postMessage({ type: 'panda_set_speed', speed }, '*');
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'setSpeed', value: speed }), '*');
      }
    } catch (e) {}
  };

  // Sincroniza velocidade sempre que o usuário alterar, trocar de aula ou de modo
  useEffect(() => {
    applyPlaybackSpeed(playbackSpeed);
  }, [playbackSpeed, activeLesson.id, mediaMode]);

  // Trava anti-duplicação para autoplay do próximo episódio
  const triggerAutoplayRef = useRef<() => void>();

  // Timestamp Resume State & Refs (compatível com Panda Video, YouTube e HTML5 Video)
  const [resumePromptTime, setResumePromptTime] = useState<number | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const activeLessonIdRef = useRef<string>(activeLesson.id);
  const userIdRef = useRef<string | undefined>(user?.id);
  const saveVideoTimestampRef = useRef<(currentTime: number, duration: number) => void>();
  const clearVideoTimestampRef = useRef<() => void>();

  useEffect(() => {
    activeLessonIdRef.current = activeLesson.id;
  }, [activeLesson.id]);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  const saveVideoTimestamp = (currentTime: number, duration: number) => {
    if (currentTime < 3) return;
    const currentId = activeLessonIdRef.current || activeLesson.id;
    const userKey = userIdRef.current || user?.id || 'anon';
    // Se o vídeo estiver nos últimos 8 segundos, descarta para não salvar no encerramento da aula
    if (duration && duration > 10 && currentTime >= duration - 8) {
      try {
        localStorage.removeItem(`elana_video_resume_${userKey}_${currentId}`);
      } catch {}
      return;
    }
    try {
      localStorage.setItem(
        `elana_video_resume_${userKey}_${currentId}`,
        JSON.stringify({ time: Math.floor(currentTime), duration: Math.floor(duration || 0) })
      );
    } catch {}
  };
  saveVideoTimestampRef.current = saveVideoTimestamp;

  const clearVideoTimestamp = () => {
    const currentId = activeLessonIdRef.current || activeLesson.id;
    const userKey = userIdRef.current || user?.id || 'anon';
    try {
      localStorage.removeItem(`elana_video_resume_${userKey}_${currentId}`);
    } catch {}
    setResumePromptTime(null);
  };
  clearVideoTimestampRef.current = clearVideoTimestamp;

  // Carregar ponto de parada salvo do vídeo (executado na troca de aula ou login)
  useEffect(() => {
    const userKey = user?.id || 'anon';
    const saved = localStorage.getItem(`elana_video_resume_${userKey}_${activeLesson.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.time && parsed.time > 5 && (!parsed.duration || parsed.time < parsed.duration - 8)) {
          setResumePromptTime(parsed.time);
        } else {
          setResumePromptTime(null);
        }
      } catch {
        setResumePromptTime(null);
      }
    } else {
      setResumePromptTime(null);
    }
  }, [activeLesson.id, user?.id]);

  // Listener único para eventos do Panda Video (Play, Pause, TimeUpdate, Ended)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data) {
          const msg = data?.message || data?.type || data?.event;
          if (
            (typeof msg === 'string' && (msg.startsWith('panda') || msg === 'ready' || msg === 'timeupdate' || msg === 'play' || msg === 'pause')) ||
            data === 'panda_ready' ||
            data === 'panda_play'
          ) {
            hasReceivedVideoEventRef.current = true;
            setAdblockWarning(false);
          }
        }
        if (data?.message === 'panda_play' || data?.type === 'panda_play' || data?.event === 'play') {
          setIsAudioPlaying(true);
        }
        if (data?.message === 'panda_pause' || data?.type === 'panda_pause' || data?.event === 'pause') {
          setIsAudioPlaying(false);
          const currentTime = typeof data.currentTime === 'number' ? data.currentTime : (typeof data.time === 'number' ? data.time : null);
          const duration = typeof data.duration === 'number' ? data.duration : null;
          if (currentTime !== null) {
            saveVideoTimestampRef.current?.(currentTime, duration || 0);
          }
        }
        if (data?.message === 'panda_timeupdate' || data?.type === 'panda_timeupdate' || data?.event === 'timeupdate') {
          const currentTime = typeof data.currentTime === 'number' ? data.currentTime : (typeof data.time === 'number' ? data.time : null);
          const duration = typeof data.duration === 'number' ? data.duration : null;

          if (currentTime !== null) {
            setAudioCurrentTime(currentTime);
            // Salva o ponto de parada a cada 3 segundos
            const now = Date.now();
            if (now - lastSaveTimeRef.current > 3000) {
              lastSaveTimeRef.current = now;
              saveVideoTimestampRef.current?.(currentTime, duration || 0);
            }
          }
          if (duration !== null) {
            setAudioDuration(duration);
          }
        }
        if (
          data?.message === 'panda_ended' ||
          data?.type === 'panda_ended' ||
          data?.message === 'ended' ||
          data?.type === 'ended' ||
          data?.event === 'ended' ||
          data === 'panda_ended'
        ) {
          setIsAudioPlaying(false);
          clearVideoTimestampRef.current?.();
          triggerAutoplayRef.current?.();
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleToggleAudioPlay = () => {
    if (isCurrentLessonLocked) return;
    const isPanda = Boolean(getEmbedUrl(safeVideoUrl));
    if (isPanda) {
      try {
        if ((window as any).PandaPlayer) {
          const panda = new (window as any).PandaPlayer('panda-player');
          panda?.togglePlay();
        } else {
          const iframe = document.getElementById('panda-player') as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage({ message: isAudioPlaying ? 'pause' : 'play' }, '*');
        }
      } catch (e) {}
      setIsAudioPlaying(!isAudioPlaying);
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsAudioPlaying(true);
      } else {
        videoRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  };

  const handleSeekAudio = (deltaSeconds: number) => {
    if (isCurrentLessonLocked) return;
    const isPanda = Boolean(getEmbedUrl(safeVideoUrl));
    const target = Math.max(0, audioCurrentTime + deltaSeconds);
    if (isPanda) {
      try {
        if ((window as any).PandaPlayer) {
          const panda = new (window as any).PandaPlayer('panda-player');
          panda?.setCurrentTime(target);
        } else {
          const iframe = document.getElementById('panda-player') as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage({ message: 'setCurrentTime', value: target }, '*');
        }
      } catch (e) {}
      setAudioCurrentTime(target);
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
      setAudioCurrentTime(target);
    }
  };

  const resumeToTimestamp = (seconds: number) => {
    const isPanda = Boolean(getEmbedUrl(safeVideoUrl));
    const target = Math.max(0, seconds);

    const sendPandaSeekAndPlay = () => {
      try {
        if ((window as any).PandaPlayer) {
          const panda = new (window as any).PandaPlayer('panda-player');
          if (panda) {
            if (typeof panda.setCurrentTime === 'function') panda.setCurrentTime(target);
            if (typeof panda.play === 'function') panda.play();
          }
        }
      } catch (e) {}

      try {
        const iframe = document.getElementById('panda-player') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ message: 'setCurrentTime', value: target }, '*');
          iframe.contentWindow.postMessage({ message: 'play' }, '*');
          iframe.contentWindow.postMessage({ type: 'panda_setCurrentTime', currentTime: target }, '*');
          iframe.contentWindow.postMessage({ type: 'panda_play' }, '*');
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'setCurrentTime', value: target }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'play' }), '*');
        }
      } catch (e) {}
    };

    if (isPanda) {
      sendPandaSeekAndPlay();
      setTimeout(sendPandaSeekAndPlay, 400);
      setAudioCurrentTime(target);
      setIsAudioPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
      videoRef.current.play().catch(() => {});
      setAudioCurrentTime(target);
      setIsAudioPlaying(true);
    }
  };

  const handleResumeVideo = (timeToResume: number) => {
    resumeToTimestamp(timeToResume);
    setResumePromptTime(null);
    showToast('info', `Vídeo continuado aos ${formatSecondsToTime(timeToResume)} 🎬`);
  };

  const handleDismissResume = () => {
    clearVideoTimestamp();
    showToast('info', 'Assistindo aula do início ↺');
  };

  const handleSeekToTime = (targetSeconds: number) => {
    const isPanda = Boolean(getEmbedUrl(safeVideoUrl));
    const target = Math.max(0, targetSeconds);
    if (isPanda) {
      try {
        if ((window as any).PandaPlayer) {
          const panda = new (window as any).PandaPlayer('panda-player');
          panda?.setCurrentTime(target);
        } else {
          const iframe = document.getElementById('panda-player') as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage({ message: 'setCurrentTime', value: target }, '*');
        }
      } catch (e) {}
      setAudioCurrentTime(target);
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
      setAudioCurrentTime(target);
    }
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const now = Date.now();
    if (now - lastSaveTimeRef.current > 3000) {
      lastSaveTimeRef.current = now;
      saveVideoTimestamp(video.currentTime, video.duration);
    }
  };

  const handleVideoPause = () => {
    const video = videoRef.current;
    if (!video) return;
    saveVideoTimestamp(video.currentTime, video.duration);
  };

  // Active Module Dropdown / Accordion Expansion State (Collapsed by default)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Feature 5: Autoplay 5-second countdown state
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const [autoplayTimer, setAutoplayTimer] = useState<number | null>(null);

  const handleLessonChange = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setAutoplayTimer(null);
    setMobileTab('content');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Scroll to top of viewport whenever classroom page opens or lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const currentMod = currentJourney.modules?.find(m => m.lessons?.some(l => l.id === activeLesson.id));
    setExpandedModuleId(currentMod ? currentMod.id : null);
    setAutoplayTimer(null);
  }, [activeLesson.id, journey.id]);

  // Adblock & Privacy Shield Fallback Handler [MEDIA-ADBK-01]
  const handleRetryVideo = () => {
    setPlayerReloadKey(prev => prev + 1);
    hasReceivedVideoEventRef.current = false;
    setAdblockWarning(false);
    showToast('info', 'Recarregando o reprodutor de vídeo...');
  };

  // Monitoramento de Adblock / Falha de Carregamento do Panda Video [MEDIA-ADBK-01]
  useEffect(() => {
    const embedUrl = getEmbedUrl(safeVideoUrl);
    if (isCurrentLessonLocked || !embedUrl) {
      setAdblockWarning(false);
      hasReceivedVideoEventRef.current = false;
      return;
    }

    hasReceivedVideoEventRef.current = false;
    setAdblockWarning(false);

    // Timer de 8 segundos: se nenhum evento for recebido do player, exibe o aviso com fallback
    const adblockTimer = setTimeout(() => {
      if (!hasReceivedVideoEventRef.current) {
        setAdblockWarning(true);
      }
    }, 8000);

    return () => {
      clearTimeout(adblockTimer);
    };
  }, [activeLesson.id, safeVideoUrl, isCurrentLessonLocked, playerReloadKey]);

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

  // 🎓 Controle de Abertura Automática do Certificado Digital [CERT-AUTO-01]
  const initialCompletedCountRef = useRef<number | null>(null);
  const hasAutoOpenedCertRef = useRef<boolean>(false);

  const checkAndTriggerCertificate = (targetLessonId?: string) => {
    if (!onOpenCertificate) return;
    const willBeAllCompleted = allLessons.length > 0 && allLessons.every(
      l => (targetLessonId && l.id === targetLessonId) || (user?.completedLessonIds || []).includes(l.id)
    );
    if (willBeAllCompleted && !hasAutoOpenedCertRef.current) {
      hasAutoOpenedCertRef.current = true;
      showToast('success', 'Parabéns! Você concluiu 100% desta jornada! Seu certificado está pronto 🎓');
      setTimeout(() => {
        onOpenCertificate(currentJourney);
      }, 700);
    }
  };

  const triggerAutoplayCountdown = () => {
    if (isCurrentLessonLocked) return;
    if (autoplayTimer !== null) return; // 🛡️ Trava anti-duplicação caso múltiplos eventos de término cheguem em paralelo

    // Limpar ponto salvo pois a aula foi concluída
    clearVideoTimestamp();

    // Marcar aula como concluída no Supabase
    if (completeLesson) {
      completeLesson(activeLesson.id);
    }

    // Verifica se ao concluir esta aula, todas as aulas da jornada foram finalizadas [CERT-AUTO-01]
    const willBeAllCompleted = allLessons.length > 0 && allLessons.every(
      l => l.id === activeLesson.id || (user?.completedLessonIds || []).includes(l.id)
    );

    if (willBeAllCompleted) {
      checkAndTriggerCertificate(activeLesson.id);
    } else if (nextLesson) {
      setAutoplayTimer(5);
    }
  };

  // Mantém a ref sincronizada para o listener principal
  triggerAutoplayRef.current = triggerAutoplayCountdown;

  const cancelAutoplay = () => {
    setAutoplayTimer(null);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (saveLessonNote) {
      await saveLessonNote(activeLesson.id, noteText.trim());
    }
    showToast('success', 'Anotação salva com sucesso e sincronizada! 📝');
  };

  // Compute progress percentage
  const completedCount = allLessons.filter(l => user?.completedLessonIds.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  // Monitora transição para 100% de conclusão da jornada nesta sessão [CERT-AUTO-01]
  useEffect(() => {
    if (initialCompletedCountRef.current === null) {
      initialCompletedCountRef.current = completedCount;
      return;
    }

    if (
      initialCompletedCountRef.current < allLessons.length &&
      allLessons.length > 0 &&
      completedCount === allLessons.length &&
      !hasAutoOpenedCertRef.current
    ) {
      hasAutoOpenedCertRef.current = true;
      showToast('success', 'Parabéns! Você concluiu 100% desta jornada! Seu certificado está pronto 🎓');
      const timer = setTimeout(() => {
        if (onOpenCertificate) {
          onOpenCertificate(currentJourney);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [completedCount, allLessons.length, currentJourney, onOpenCertificate, showToast]);

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

      {/* ── MOBILE TAB SWITCHER: Conteúdo Atual vs Módulos & Aulas ── */}
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
          <span>Conteúdo Atual</span>
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
                onClick={() => {
                  if (isCurrentLessonLocked) {
                    showToast('warning', 'Esta aula é exclusiva. Adquira a jornada para acessar o modo só áudio.');
                    return;
                  }
                  setMediaMode('audio');
                  awardBadge('b8');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  isCurrentLessonLocked
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : mediaMode === 'audio'
                    ? 'bg-[#FF7F5B] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isCurrentLessonLocked ? "Conteúdo exclusivo bloqueado" : "Economia de bateria e iluminação reduzida para escuta confortável."}
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
                  onChange={(e) => {
                    const newSpeed = parseFloat(e.target.value);
                    setPlaybackSpeed(newSpeed);
                    applyPlaybackSpeed(newSpeed);
                  }}
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

          {/* Media Player Box (Unified Video and Audio Player) */}
          <div className={`bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 w-full transition-all ${
            mediaMode === 'audio' ? 'min-h-[290px] sm:min-h-[320px]' : 'aspect-video'
          }`}>

            {/* ── PAYWALL GATE (Quando a aula está bloqueada, NENHUM player de mídia é renderizado no DOM) ── */}
            {isCurrentLessonLocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#070D0F] to-[#101B1E] p-8 text-center z-30">
                <div className="w-16 h-16 rounded-full bg-[#FF7F5B]/15 border border-[#FF7F5B]/40 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-[#FF7F5B]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">Conteúdo exclusivo</h3>
                  <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                    Esta aula faz parte da jornada <span className="text-[#FF7F5B] font-bold">{currentJourney.title}</span>. Adquira para ter acesso completo.
                  </p>
                </div>
                <button
                  onClick={handleUnlock}
                  className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Adquirir esta Jornada</span>
                </button>
                <button
                  onClick={() => handleLessonChange(allLessons[0])}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Voltar ao conteúdo gratuito
                </button>
              </div>
            ) : (
              <>
                {/* Floating Timestamp Resume Prompt (Válido para Panda Video, YouTube e HTML5 Video) */}
                {resumePromptTime !== null && (
                  <div className="absolute top-3 left-3 right-3 z-30 bg-[#070D0F]/95 backdrop-blur-md border border-[#FF7F5B]/40 p-3 rounded-2xl flex items-center justify-between shadow-2xl animate-fade-in text-xs pointer-events-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FF7F5B]/20 text-[#FF7F5B] flex items-center justify-center font-bold text-sm shrink-0">
                        ⏱️
                      </div>
                      <div>
                        <span className="font-extrabold text-white block">Continuar de onde parou?</span>
                        <span className="text-[11px] text-slate-300">Você estava aos {formatSecondsToTime(resumePromptTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResumeVideo(resumePromptTime)}
                        className="bg-[#FF7F5B] hover:bg-[#e06847] text-white px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Continuar</span>
                      </button>
                      <button
                        onClick={handleDismissResume}
                        className="bg-white/10 hover:bg-white/20 text-slate-300 px-2.5 py-1.5 rounded-xl transition-all font-bold text-xs cursor-pointer"
                        title="Assistir do início e descartar ponto salvo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Floating Adblock / Privacy Shield Fallback Warning [MEDIA-ADBK-01] */}
                {adblockWarning && !isCurrentLessonLocked && (
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-30 bg-[#070D0F]/95 backdrop-blur-md border border-[#FFD166]/50 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in pointer-events-auto">
                    <div className="flex items-start sm:items-center gap-3 text-slate-200">
                      <span className="w-9 h-9 rounded-xl bg-[#FFD166]/15 text-[#FFD166] border border-[#FFD166]/30 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-bold text-white block">O vídeo não carregou?</span>
                        <span className="text-[11px] text-slate-300">
                          Bloqueadores de anúncios ou extensões de privacidade (como Brave Shields ou uBlock Origin) podem impedir o carregamento do reprodutor. Desative-os para esta página ou clique para tentar novamente.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        onClick={handleRetryVideo}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#FFD166] hover:bg-[#ffc633] text-slate-950 font-black text-xs py-2 px-3.5 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tentar novamente</span>
                      </button>
                      <button
                        onClick={() => setAdblockWarning(false)}
                        className="bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white p-2 rounded-xl transition-all font-bold cursor-pointer shrink-0"
                        title="Dispensar aviso"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Player Container: Iframe do Panda Video ou HTML5 Video */}
                <div className={`w-full h-full ${mediaMode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0 -z-10' : 'relative group'}`}>
                  {getEmbedUrl(safeVideoUrl) ? (
                    <iframe
                      id="panda-player"
                      key={`${activeLesson.id}-${safeVideoUrl}-${playerReloadKey}`}
                      src={getEmbedUrl(safeVideoUrl)!}
                      title={activeLesson.title}
                      className="w-full h-full border-0 rounded-3xl"
                      style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      onLoad={() => {
                        setTimeout(() => {
                          applyPlaybackSpeed(playbackSpeed);
                        }, 800);
                      }}
                    />
                  ) : (
                    <>

                      {!safeVideoUrl || safeVideoUrl === '#' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#101B1E] via-[#0A1215] to-[#070D0F] p-6 text-center space-y-3 relative overflow-hidden">
                          <div className="absolute w-64 h-64 rounded-full bg-[#FF7F5B]/10 blur-3xl pointer-events-none -top-10" />
                          <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 flex items-center justify-center text-2xl shadow-xl">
                            🌱
                          </div>
                          <div className="relative z-10 space-y-1 max-w-sm">
                            <span className="text-[10px] font-extrabold text-[#FFD166] uppercase tracking-wider bg-[#FFD166]/10 px-2.5 py-0.5 rounded-full border border-[#FFD166]/20 inline-block">
                              Em Preparação & Gravação Final
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{activeLesson.title}</h3>
                            <p className="text-[11px] text-slate-300 line-clamp-2">
                              {activeLesson.description || 'Esta aula está sendo finalizada em estúdio com os especialistas da Elana Academy.'}
                            </p>
                          </div>
                          <div className="relative z-10 pt-1">
                            <button
                              onClick={() => {
                                if (completeLesson) completeLesson(activeLesson.id);
                                showToast('success', 'Aula concluída! Parabéns pelo seu avanço 🌱');
                                checkAndTriggerCertificate(activeLesson.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#8A9A5B]" />
                              <span>Marcar como Concluída</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <video
                          ref={videoRef}
                          key={activeLesson.id}
                          controls={mediaMode === 'video'}
                          playsInline
                          preload="metadata"
                          autoPlay={false}
                          onTimeUpdate={() => {
                            hasReceivedVideoEventRef.current = true;
                            setAdblockWarning(false);
                            handleVideoTimeUpdate();
                          }}
                          onPause={handleVideoPause}
                          onPlay={() => {
                            hasReceivedVideoEventRef.current = true;
                            setAdblockWarning(false);
                            setIsAudioPlaying(true);
                          }}
                          onEnded={triggerAutoplayCountdown}
                          className="w-full h-full object-cover"
                          poster={activeLesson.thumbnailUrl || "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&auto=format&fit=crop&q=80"}
                        >
                          <source src={safeVideoUrl} type="video/mp4" />
                          Seu navegador não suporta a execução deste vídeo.
                        </video>
                      )}
                    </>
                  )}
                </div>

                {/* MODO SÓ AUDIO - Perfectly Centered in the Player Frame */}
                {mediaMode === 'audio' && (
                  <div className="absolute inset-0 z-20 bg-gradient-to-br from-[#101B1E] via-[#091113] to-[#070D0F] p-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 animate-fade-in">
                    {/* Acoustic Ambient Glow */}
                    <div className="absolute w-72 h-72 rounded-full bg-[#FF7F5B]/10 blur-3xl pointer-events-none -top-12" />
                    
                    <div className="relative z-10 space-y-3 sm:space-y-4 flex flex-col items-center w-full max-w-md">
                      {/* Pulsing Visual */}
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center transition-all ${
                        isAudioPlaying 
                          ? 'bg-[#FF7F5B]/25 border-[#FF7F5B]/60 text-[#FF7F5B] scale-105 shadow-lg shadow-[#FF7F5B]/20 animate-pulse' 
                          : 'bg-white/10 border-white/20 text-slate-400'
                      }`}>
                        <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] sm:text-xs font-black text-[#FFD166] uppercase tracking-wider block">
                          🎧 MODO SÓ AUDIO
                        </span>
                        <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-1">{activeLesson.title}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mx-auto hidden sm:block">
                          Economia de bateria e iluminação reduzida. Ideal para ouvir enquanto nina, dirige ou descansa.
                        </p>
                      </div>

                      {/* Audio Controls Bar */}
                      <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                        {/* -10s */}
                        <button
                          type="button"
                          onClick={() => handleSeekAudio(-10)}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white/80 hover:text-white flex items-center justify-center text-xs font-extrabold transition-all cursor-pointer shrink-0"
                          title="Retroceder 10 segundos"
                        >
                          -10s
                        </button>

                        {/* Central Play/Pause button */}
                        <button
                          type="button"
                          onClick={handleToggleAudioPlay}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FF7F5B] hover:bg-[#e06847] active:scale-95 text-white flex items-center justify-center shadow-xl shadow-[#FF7F5B]/30 transition-all cursor-pointer shrink-0"
                          title={isAudioPlaying ? "Pausar áudio" : "Tocar áudio"}
                        >
                          {isAudioPlaying ? (
                            <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* +10s */}
                        <button
                          type="button"
                          onClick={() => handleSeekAudio(10)}
                          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white/80 hover:text-white flex items-center justify-center text-xs font-extrabold transition-all cursor-pointer shrink-0"
                          title="Avançar 10 segundos"
                        >
                          +10s
                        </button>
                      </div>

                      {/* Audio Timeline / Time Display */}
                      {(() => {
                        const effDuration = audioDuration || parseDurationToSeconds(activeLesson.duration) || 0;
                        return effDuration > 0 ? (
                          <div className="w-full max-w-xs space-y-1 pt-0.5">
                            <div 
                              className="w-full py-2.5 cursor-pointer touch-manipulation group"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                handleSeekToTime(percent * effDuration);
                              }}
                            >
                              <div className="w-full bg-white/10 group-hover:bg-white/20 h-2 rounded-full overflow-hidden transition-colors">
                                <div 
                                  className="bg-[#FF7F5B] h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (audioCurrentTime / effDuration) * 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-medium">
                              <span>{formatSecondsToTime(audioCurrentTime)}</span>
                              <span>{formatSecondsToTime(effDuration)}</span>
                            </div>
                          </div>
                        ) : null;
                      })()}

                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Feature 5: Autoplay 5-Second Countdown Banner Overlay */}
          {autoplayTimer !== null && nextLesson && (
            <div className="bg-gradient-to-r from-[#FF7F5B] via-[#E66795] to-[#FFD166] p-4 sm:p-5 rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black/20 font-black text-base flex items-center justify-center shrink-0 border border-white/30 animate-pulse">
                  {autoplayTimer}s
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 block">
                    Autoplay Ativo • Próximo Conteúdo
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

          {/* Banner Celebratório de Conclusão da Jornada & Certificado Digital [CERT-AUTO-01] */}
          {progressPercent === 100 && autoplayTimer === null && (
            <div className="bg-gradient-to-r from-[#003B46] via-[#0A262C] to-[#101B1E] p-4 sm:p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-[#FFD166]/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFD166]/20 font-black text-xl flex items-center justify-center shrink-0 border border-[#FFD166]/40 text-[#FFD166]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD166] block">
                    Jornada Concluída • 100% de Aproveitamento
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Parabéns pela dedicação! Seu Certificado Digital oficial está disponível.
                  </p>
                </div>
              </div>

              {onOpenCertificate && (
                <button
                  type="button"
                  onClick={() => onOpenCertificate(currentJourney)}
                  className="w-full sm:w-auto bg-[#FFD166] hover:bg-[#ffe082] text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Award className="w-4 h-4 fill-current" />
                  <span>Ver Meu Certificado</span>
                </button>
              )}
            </div>
          )}

          {/* Lesson Overview & Title */}
          <div className="bg-[#101B1E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-6">
            
            <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Duração: {activeLesson.duration}</span>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {activeLesson.title}
                </h2>
              </div>

              {/* Botão de Sinalização e Controle: 100% Assistido */}
              <button
                type="button"
                disabled={isCurrentLessonLocked}
                onClick={() => {
                  if (isCurrentLessonLocked) {
                    showToast('warning', 'Esta aula é exclusiva. Adquira a jornada para concluir e registrar progresso.');
                    return;
                  }
                  const isAlreadyCompleted = user?.completedLessonIds.includes(activeLesson.id);
                  toggleCompleteLesson(activeLesson.id);
                  if (!isAlreadyCompleted) {
                    checkAndTriggerCertificate(activeLesson.id);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shrink-0 border ${
                  isCurrentLessonLocked
                    ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-500'
                    : user?.completedLessonIds.includes(activeLesson.id)
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 active:scale-95 cursor-pointer'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 cursor-pointer'
                }`}
                title={
                  isCurrentLessonLocked
                    ? 'Conteúdo exclusivo bloqueado'
                    : user?.completedLessonIds.includes(activeLesson.id)
                    ? 'Clique para desmarcar como concluído'
                    : 'Clique para marcar este vídeo como 100% assistido'
                }
              >
                <CheckCircle2 className={`w-4 h-4 ${user?.completedLessonIds.includes(activeLesson.id) ? 'fill-current text-emerald-400' : 'text-slate-500'}`} />
                <span>{user?.completedLessonIds.includes(activeLesson.id) ? '100% Concluído' : 'Marcar como 100% Assistido'}</span>
              </button>
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
                    className={`pb-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'resources'
                        ? 'border-[#FF7F5B] text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isCurrentLessonLocked && <Lock className="w-3 h-3 text-[#FF7F5B]" />}
                    <span>Materiais ({activeLesson.resources.length})</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeLesson.description}
                </p>
              )}

              {/* Tab 2: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {isCurrentLessonLocked ? (
                    <div className="p-6 rounded-2xl border border-white/10 bg-[#070D0F] text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#FF7F5B]/15 border border-[#FF7F5B]/40 flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5 text-[#FF7F5B]" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Caderno de Anotações Exclusivo</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Desbloqueie esta jornada para registrar seus aprendizados, reflexões e exportar seu caderno personalizado em PDF.
                      </p>
                      <button
                        type="button"
                        onClick={handleUnlock}
                        className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Desbloquear Jornada</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveNote} className="space-y-3">
                      <textarea
                        rows={4}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Escreva seus pensamentos, reflexões e aprendizados sobre este conteúdo..."
                        className="w-full p-3.5 rounded-xl border border-white/10 text-base sm:text-xs text-white bg-[#070D0F] focus:outline-none focus:border-[#FF7F5B]"
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
                  )}
                </div>
              )}

              {/* Tab 4: Materials */}
              {activeTab === 'resources' && activeLesson.resources && (
                <div className="space-y-3">
                  {/* Se a aula estiver bloqueada: proteção total contra vazamento de URL no DOM + teaser de conversão */}
                  {isCurrentLessonLocked ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border border-[#FF7F5B]/30 bg-gradient-to-r from-[#FF7F5B]/10 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#FF7F5B]" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Materiais Exclusivos da Jornada
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Adquira a jornada para liberar o download imediato de todos os e-books, checklists e materiais em PDF.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUnlock}
                          className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Desbloquear</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {activeLesson.resources.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              showToast('warning', 'Este material é exclusivo para alunos da jornada. Adquira para fazer o download.');
                              handleUnlock();
                            }}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#070D0F] hover:bg-white/5 transition-colors text-xs font-semibold text-white cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#FF7F5B]/50 transition-colors">
                                <Lock className="w-3.5 h-3.5 text-[#FF7F5B]" />
                              </div>
                              <span className="text-slate-200 group-hover:text-white transition-colors">{res.title}</span>
                            </div>
                            <span className="text-[10px] text-[#FF7F5B] bg-[#FF7F5B]/10 px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider group-hover:bg-[#FF7F5B] group-hover:text-slate-950 transition-all flex items-center gap-1">
                              Exclusivo 🔒
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeLesson.resources.map((res, i) => {
                        const isRealUrl = Boolean(res.url && res.url.trim() && res.url !== '#' && (res.url.startsWith('http://') || res.url.startsWith('https://') || res.url.startsWith('/')));
                        return (
                          <a
                            key={i}
                            href={isRealUrl ? res.url : undefined}
                            target={isRealUrl ? "_blank" : undefined}
                            rel={isRealUrl ? "noopener noreferrer" : undefined}
                            download={isRealUrl ? true : undefined}
                            onClick={(e) => {
                              if (!isRealUrl) {
                                e.preventDefault();
                                showToast('info', 'Material complementar em fase de diagramação final. Em breve disponível para download!');
                              } else {
                                showToast('success', `Abrindo material: ${res.title}`);
                              }
                            }}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#070D0F] hover:bg-white/5 transition-colors text-xs font-semibold text-white cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#FF7F5B]" />
                              <span>{res.title}</span>
                            </div>
                            <span className="text-[10px] text-[#FF7F5B] hover:text-[#ff9577] uppercase font-bold tracking-wider">
                              Baixar PDF ↓
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
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

            {progressPercent === 100 && onOpenCertificate && (
              <button
                type="button"
                onClick={() => onOpenCertificate(currentJourney)}
                className="w-full mt-2 bg-[#FFD166] hover:bg-[#ffe082] text-slate-900 font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Award className="w-4 h-4 fill-current" />
                <span>Ver Certificado Digital</span>
              </button>
            )}
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

                          return (() => {
                            const isLessonLocked = !isPurchased && lesson.id !== freePreviewLessonId;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => !isLessonLocked && handleLessonChange(lesson)}
                                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all active:scale-95 ${
                                  isLessonLocked
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'
                                } ${
                                  isCurrent
                                    ? 'bg-[#FF7F5B] text-white font-bold shadow-md'
                                    : 'hover:bg-white/5 text-slate-300'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className="mt-0.5 shrink-0">
                                    {isLessonLocked ? (
                                      <Lock className={`w-4 h-4 text-slate-500`} />
                                    ) : isDone ? (
                                      <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-400'}`} />
                                    ) : (
                                      <Play className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs leading-snug truncate">
                                      {lesson.title}
                                    </p>
                                    <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>
                                      {isLessonLocked ? 'Conteúdo exclusivo' : lesson.duration}
                                    </span>
                                  </div>
                                </div>

                                {/* Sinalização / Container 100% Assistido */}
                                {isDone && !isLessonLocked && (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider flex items-center gap-1 border ${
                                    isCurrent
                                      ? 'bg-white/25 text-white border-white/40'
                                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  }`}>
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    100%
                                  </span>
                                )}
                              </button>
                            );
                          })();
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

      {/* Checkout Modal Direto na Sala de Aula */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          journey={currentJourney}
          onClose={() => setIsCheckoutModalOpen(false)}
          onSuccess={(j) => {
            setIsCheckoutModalOpen(false);
            showToast('success', `Acesso liberado com sucesso à jornada ${j.title}!`);
          }}
        />
      )}

    </div>
  );
};

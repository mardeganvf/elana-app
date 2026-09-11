import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, isAdminUser, deduplicateSosMessages } from '../../context/AuthContext';
import { useFontSize } from '../../context/FontSizeContext';
import { supabase } from '../../lib/supabase';
import { 
  Flame, 
  Sparkles, 
  User as UserIcon, 
  Film, 
  MessageSquare, 
  Moon, 
  HelpCircle,
  HeartHandshake,
  LifeBuoy,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Type,
  X,
  Send,
  Lock,
  ShieldCheck,
  Wind,
  CheckCircle2,
  Clock,
  Phone,
  Bell,
  Sun,
  BatteryLow
} from 'lucide-react';
import logoElana from '../../assets/logo-elana.png';
import { BreathingModal } from '../common/BreathingModal';
import { useToast } from '../../context/ToastContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onRestartTutorial?: () => void;
}

interface CalendarDay {
  day: number;
  month: string;
  emoji?: string | null;
  emotionId?: string | null;
  label: string;
  isToday?: boolean;
  isFirstOfMonth?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuthModal, onRestartTutorial }) => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    sosResponse, 
    sendSosTicket, 
    sendUserFollowUpMessage, 
    clearActiveSosTicket, 
    markSosResponseRead, 
    awardBadge,
    updateUser,
    refreshSosTicket,
    adminPendingCounts
  } = useAuth();
  const { showToast } = useToast();
  const isAdmin = isAdminUser(user);
  const isStaff = isAdmin || (user?.role || '').toLowerCase().includes('guia');
  const { fontSize, setFontSize } = useFontSize();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMamadaMode, setIsMamadaMode] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showMadrugadaTooltip, setShowMadrugadaTooltip] = useState(false);

  // Modals State for Emoções, SOS and Respiro de 60s
  const [isEmotionalHistoryOpen, setIsEmotionalHistoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  // User's Real Emotional Check-ins from Supabase
  const [userCheckins, setUserCheckins] = useState<{ date: string; emotionId: string; label: string }[]>([]);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  useEffect(() => {
    if (!isEmotionalHistoryOpen || !user?.id) {
      if (!user?.id) setUserCheckins([]);
      return;
    }

    const fetchCheckins = async () => {
      setIsLoadingCheckins(true);
      try {
        const { data, error } = await supabase
          .from('emotional_checkins')
          .select('checkin_date, emotion_id, emotion_label')
          .eq('profile_id', user.id)
          .order('checkin_date', { ascending: false });

        if (!error && data) {
          const mapped = data.map(item => {
            let emotionId = 'esperanca';
            const idLower = (item.emotion_id || '').toLowerCase();
            const labelLower = (item.emotion_label || '').toLowerCase();

            if (idLower.includes('esperanca') || labelLower.includes('esperança')) {
              emotionId = 'esperanca';
            } else if (idLower.includes('celebrando') || labelLower.includes('celebrando')) {
              emotionId = 'celebrando';
            } else if (idLower.includes('energia') || labelLower.includes('energia') || labelLower.includes('exausto')) {
              emotionId = 'sem_energia';
            } else if (idLower.includes('luz') || idLower.includes('ajuda') || labelLower.includes('luz') || labelLower.includes('ajuda') || labelLower.includes('colo')) {
              emotionId = 'precisando_luz';
            }

            return {
              date: item.checkin_date,
              emotionId,
              label: item.emotion_label || (
                emotionId === 'esperanca' ? 'Com Esperança' :
                emotionId === 'celebrando' ? 'Celebrando' :
                emotionId === 'sem_energia' ? 'Sem Energia' : 'Precisando de Luz'
              )
            };
          });
          setUserCheckins(mapped);
        } else {
          setUserCheckins([]);
        }
      } catch (err) {
        console.warn('Error loading emotional checkins:', err);
      } finally {
        setIsLoadingCheckins(false);
      }
    };

    fetchCheckins();
  }, [isEmotionalHistoryOpen, user?.id]);

  // Helper to format Date object into local YYYY-MM-DD
  const formatLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Deduplicate check-ins by unique calendar date (1 check-in per day)
  const uniqueDailyCheckins = React.useMemo(() => {
    const seenMap = new Map<string, { date: string; emotionId: string; label: string }>();
    // userCheckins are ordered descending by date, so first occurrence is the latest
    userCheckins.forEach(c => {
      if (!seenMap.has(c.date)) {
        seenMap.set(c.date, c);
      }
    });
    return Array.from(seenMap.values());
  }, [userCheckins]);

  // Dynamically compute the rolling 28-day window ending on TODAY
  const dynamicLast4WeeksDays = React.useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const checkinMap = new Map<string, { emotionId: string; label: string }>();
    uniqueDailyCheckins.forEach(c => {
      checkinMap.set(c.date, { emotionId: c.emotionId, label: c.label });
    });

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoDate = formatLocalDateKey(d);
      const match = checkinMap.get(isoDate);

      days.push({
        day: d.getDate(),
        month: monthNames[d.getMonth()],
        emotionId: match ? match.emotionId : null,
        label: match ? match.label : 'Sem registro',
        isToday: i === 0,
        isFirstOfMonth: d.getDate() === 1 || i === 27
      });
    }

    return days;
  }, [uniqueDailyCheckins]);

  // Dynamically compute counts and proportion per emotional category (strictly 1 vote per unique day)
  const dynamicSummary = React.useMemo(() => {
    const counts: Record<string, number> = {
      esperanca: 0,
      celebrando: 0,
      sem_energia: 0,
      precisando_luz: 0,
    };

    uniqueDailyCheckins.forEach(c => {
      if (c.emotionId === 'esperanca') counts.esperanca++;
      else if (c.emotionId === 'celebrando') counts.celebrando++;
      else if (c.emotionId === 'sem_energia') counts.sem_energia++;
      else if (c.emotionId === 'precisando_luz') counts.precisando_luz++;
    });

    const total = uniqueDailyCheckins.length;

    return {
      total,
      counts,
      categories: [
        {
          id: 'esperanca',
          label: 'Com Esperança',
          count: counts.esperanca,
          percent: total > 0 ? Math.round((counts.esperanca / total) * 100) : 0,
          colorText: 'text-[#FFD166]',
          colorBg: 'bg-[#FFD166]',
          colorBorder: 'border-[#FFD166]/30',
          chipBg: 'bg-[#FFD166]/10',
        },
        {
          id: 'celebrando',
          label: 'Celebrando',
          count: counts.celebrando,
          percent: total > 0 ? Math.round((counts.celebrando / total) * 100) : 0,
          colorText: 'text-purple-300',
          colorBg: 'bg-purple-400',
          colorBorder: 'border-purple-500/30',
          chipBg: 'bg-purple-500/10',
        },
        {
          id: 'sem_energia',
          label: 'Sem Energia',
          count: counts.sem_energia,
          percent: total > 0 ? Math.round((counts.sem_energia / total) * 100) : 0,
          colorText: 'text-[#FF7F5B]',
          colorBg: 'bg-[#FF7F5B]',
          colorBorder: 'border-[#FF7F5B]/30',
          chipBg: 'bg-[#FF7F5B]/10',
        },
        {
          id: 'precisando_luz',
          label: 'Precisando de Luz',
          count: counts.precisando_luz,
          percent: total > 0 ? Math.round((counts.precisando_luz / total) * 100) : 0,
          colorText: 'text-rose-300',
          colorBg: 'bg-rose-400',
          colorBorder: 'border-rose-500/30',
          chipBg: 'bg-rose-500/10',
        },
      ]
    };
  }, [uniqueDailyCheckins]);

  const emotionalInsight = React.useMemo(() => {
    if (dynamicSummary.total === 0) {
      return 'Você ainda não registrou emoções recentes. Acompanhe seu sentir no seu ritmo, com carinho e sem culpa.';
    }

    const { esperanca, celebrando, sem_energia, precisando_luz } = dynamicSummary.counts;
    const leves = esperanca + celebrando;
    const densos = sem_energia + precisando_luz;

    if (leves >= densos) {
      return 'A maioria dos seus dias foram de esperança e celebração. Que essa leveza continue nutrindo sua caminhada!';
    } else {
      return 'Acolher os dias que pedem pausa ou cuidado é um ato de profundo carinho. Respeite seu ritmo — você não precisa carregar tudo só.';
    }
  }, [dynamicSummary]);

  const todayCheckedIn = React.useMemo(() => {
    const todayKey = formatLocalDateKey(new Date());
    return uniqueDailyCheckins.some(c => c.date === todayKey);
  }, [uniqueDailyCheckins]);

  const renderEmotionIcon = (emotionId?: string | null, className: string = "w-3.5 h-3.5") => {
    switch (emotionId) {
      case 'esperanca':
        return <Sun className={`${className} text-[#FFD166]`} />;
      case 'celebrando':
        return <Sparkles className={`${className} text-purple-300`} />;
      case 'sem_energia':
        return <BatteryLow className={`${className} text-[#FF7F5B]`} />;
      case 'precisando_luz':
        return <HeartHandshake className={`${className} text-rose-300`} />;
      default:
        return null;
    }
  };

  // SOS Private Message State & Dialogue
  const [sosMessage, setSosMessage] = useState('');
  const [sosFollowUpText, setSosFollowUpText] = useState('');
  const [isSendingSos, setIsSendingSos] = useState(false);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const sosChatEndRef = useRef<HTMLDivElement | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const hasUnreadSosReply = !!(
    sosResponse && 
    !sosResponse.isRead &&
    (
      Boolean(sosResponse.adminReply) ||
      Boolean(sosResponse.messages && sosResponse.messages.length > 1 && sosResponse.messages[sosResponse.messages.length - 1].sender === 'admin')
    )
  );

  useEffect(() => {
    if (isEmergencyOpen && sosChatEndRef.current) {
      sosChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isEmergencyOpen, sosResponse?.messages?.length]);

  // Polling automático a cada 4 segundos enquanto o modal de acolhimento SOS estiver aberto
  useEffect(() => {
    if (isEmergencyOpen) {
      refreshSosTicket();
      const interval = setInterval(() => {
        refreshSosTicket();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isEmergencyOpen, refreshSosTicket]);

  const handleSendSosTicket = async () => {
    if (!sosMessage.trim() || isSendingSos) return;
    setIsSendingSos(true);
    try {
      await sendSosTicket(sosMessage.trim());
      setSosMessage('');
      showToast('success', 'Pedido de acolhimento SOS enviado! Nossa equipe responderá em breve. 💖');
    } catch (err) {
      console.error('Erro ao enviar SOS:', err);
      showToast('error', 'Erro ao enviar pedido de acolhimento.');
    } finally {
      setIsSendingSos(false);
    }
  };

  const handleSendSosFollowUp = async () => {
    if (!sosFollowUpText.trim() || isSendingFollowUp || !sosResponse) return;
    const ticketId = sosResponse.ticketId || sosResponse.id || '';
    setIsSendingFollowUp(true);
    try {
      await sendUserFollowUpMessage(ticketId, sosFollowUpText.trim());
      setSosFollowUpText('');
      await refreshSosTicket();
      showToast('success', 'Mensagem enviada com carinho para a equipe! 🌸');
    } catch (err) {
      console.error('Erro ao enviar follow-up:', err);
      showToast('error', 'Erro ao enviar mensagem.');
    } finally {
      setIsSendingFollowUp(false);
    }
  };


  const toggleMamadaMode = () => {
    setIsMamadaMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('mamada-mode', next);
      if (next) {
        awardBadge('b22'); // Farol Noturno (Modo Madrugada/Noturno)
      }
      return next;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'netflix-nav-scrolled py-3' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4 sm:py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Main Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0">
          
          {/* Elana Official Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center cursor-pointer group select-none shrink-0"
          >
            <img
              src={logoElana}
              alt="Elana"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-md"
            />
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              data-tour="contents-nav"
              className={`flex items-center gap-2 transition-all px-3.5 py-2 rounded-full ${
                activeTab === 'home' ? 'text-white font-extrabold bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-[#FF7F5B]" />
              <span>Conteúdos</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              data-tour="community-nav"
              className={`flex items-center gap-2 transition-all px-3.5 py-2 rounded-full ${
                activeTab === 'community' ? 'text-white font-extrabold bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#8A9A5B]" />
              <span>Comunidade</span>
            </button>
          </nav>

        </div>

        {/* Center: Functional Action Shortcuts (Suas Emoções & SOS) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          
          {/* Suas Emoções (Abre o Diário de Emoções das Últimas 4 Semanas) */}
          <button
            onClick={() => {
              setIsEmotionalHistoryOpen(true);
              awardBadge('b21'); // Olhar Para Dentro
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            data-tour="emotions-button"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs px-3.5 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            title="Suas Emoções - Resumo de 4 Semanas"
          >
            <HeartHandshake className="w-4 h-4 text-[#E66795] shrink-0" />
            <span>Suas Emoções</span>
          </button>

          {/* SOS Canal de Acolhimento Humano */}
          <button
            onClick={() => {
              setIsEmergencyOpen(true);
              markSosResponseRead();
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            data-tour="sos-button"
            className={`font-extrabold text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap border relative cursor-pointer ${
              hasUnreadSosReply
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
            }`}
            title={hasUnreadSosReply ? 'Nova resposta da Equipe de Acolhimento!' : 'Canal SOS Privado de Acolhimento'}
          >
            <LifeBuoy className="w-4 h-4 animate-pulse text-rose-300 shrink-0" />
            <span>SOS</span>
            {hasUnreadSosReply && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping absolute -top-0.5 -right-0.5 border border-rose-600"></span>
            )}
          </button>

          {/* Painel do Administrador / Guia Shortcut */}
          {isStaff && (
            <div className="inline-flex items-center">
              <button
                onClick={() => {
                  setActiveTab('admin');
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className={`font-extrabold text-xs px-3.5 h-9 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap border cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] font-black'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                }`}
                title={isAdmin ? "Painel do Administrador & Guardião" : "Painel do Guia"}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'admin' ? 'text-slate-950' : 'text-[#FF7F5B]'}`} />
                <span>{isAdmin ? "Painel Admin" : "Painel Guia"}</span>
              </button>

              {adminPendingCounts && adminPendingCounts.total > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 border-2 border-[#070D0F] flex items-center justify-center shadow-lg -ml-2 z-10 cursor-pointer active:scale-95 transition-all shrink-0"
                  title={isAdmin ? "Novas mensagens e pendências no Painel Admin" : "Novas mensagens e pendências no Painel Guia"}
                >
                  <Bell className="w-3.5 h-3.5 text-white fill-white animate-bounce" />
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right: Gamification Widget & Profile Dropdown Avatar (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 text-slate-300 shrink-0">
          
          {isAuthenticated && user ? (
            <>
              {/* Gamification Stats Pill */}
              <div 
                data-tour="gamification-stats"
                className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-bold whitespace-nowrap shrink-0"
              >
                <div className="flex items-center gap-1.5 text-[#FF7F5B]" title="Dias de caminhada conosco">
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>{user.streakDays} {user.streakDays === 1 ? 'dia' : 'dias'} conosco</span>
                </div>
                <div className="w-px h-3.5 bg-white/20"></div>
                <div className="flex items-center gap-1.5 text-[#FFD166]" title="Pontuação em Pontos">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{user.xp} pontos</span>
                </div>
              </div>

              {/* Profile Avatar with Dropdown Popover Container */}
              <div className="relative shrink-0" ref={dropdownRef}>
                
                {/* Profile Trigger Button */}
                <button
                  onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                  data-tour="profile-avatar"
                  className="flex items-center gap-1.5 p-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all focus:outline-none cursor-pointer"
                  title="Menu do Perfil"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E66795]"
                  />
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* Profile Dropdown Popover */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-[#0F171A] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-[9999] text-white space-y-2 animate-scale-up text-left select-none backdrop-blur-xl">
                    
                    {/* User Profile Card Header */}
                    <div 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('dashboard');
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#FF7F5B]/50 transition-all shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#FF7F5B] transition-colors truncate">
                            {user.name}
                          </h4>
                          {isStaff && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                              {isAdmin ? 'Admin' : 'Guia'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300 flex items-center gap-0.5 transition-colors mt-0.5">
                          <span>Ver meu perfil</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Preferências Rápidas (Modo Madrugada & Fonte) */}
                    <div className="space-y-1">
                      
                      {/* Modo Madrugada */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          <Moon className={`w-4 h-4 transition-colors ${isMamadaMode ? 'text-[#FFD166]' : 'text-slate-400'}`} />
                          <span className="text-xs font-medium text-slate-200">Modo Madrugada</span>

                          {/* Box Explicativo (?) */}
                          <div className="relative inline-flex items-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMadrugadaTooltip(prev => !prev);
                              }}
                              onMouseEnter={() => setShowMadrugadaTooltip(true)}
                              onMouseLeave={() => setShowMadrugadaTooltip(false)}
                              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-full cursor-help focus:outline-none"
                              aria-label="Informações sobre o Modo Madrugada"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>

                            {showMadrugadaTooltip && (
                              <div className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-[#142024] border border-white/15 rounded-xl text-[11px] leading-relaxed text-slate-300 shadow-2xl z-50 pointer-events-none animate-fade-in">
                                Luz suave e contraste atenuado para navegar sem despertar o bebê durante mamadas e cuidados noturnos.
                                <div className="absolute left-2.5 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#142024]" />
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={toggleMamadaMode}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            isMamadaMode ? 'bg-[#FFD166]' : 'bg-white/20'
                          }`}
                          title="Alternar Modo Madrugada"
                          aria-label="Alternar Modo Madrugada"
                        >
                          <div className={`w-4 h-4 rounded-full bg-[#070D0F] transition-transform ${
                            isMamadaMode ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      {/* Tamanho de Fonte em Linha Única */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Type className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-medium text-slate-200">Tamanho do Texto</span>
                        </div>

                        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
                          <button
                            type="button"
                            onClick={() => setFontSize('sm')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              fontSize === 'sm'
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title="Texto Pequeno"
                          >
                            A-
                          </button>
                          <button
                            type="button"
                            onClick={() => setFontSize('md')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              fontSize === 'md'
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title="Texto Normal"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => setFontSize('lg')}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              fontSize === 'lg'
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title="Texto Grande"
                          >
                            A+
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Ações (Tutorial, Gestão e Logout) */}
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          if (onRestartTutorial) {
                            onRestartTutorial();
                          }
                        }}
                        className="w-full text-xs font-medium text-slate-300 hover:text-white px-2.5 py-2 rounded-xl hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Tutorial de Boas-Vindas</span>
                      </button>

                      {isStaff && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setActiveTab('admin');
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                          }}
                          className="w-full text-xs font-medium text-slate-200 hover:text-white px-2.5 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-[#FF7F5B]" />
                            <span>{isAdmin ? "Painel do Administrador" : "Painel do Guia"}</span>
                          </div>
                          {adminPendingCounts && adminPendingCounts.total > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white shadow-sm">
                              {adminPendingCounts.total}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                          setActiveTab('login');
                        }}
                        className="w-full text-xs font-medium text-slate-400 hover:text-rose-400 px-2.5 py-2 rounded-xl hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}

        </div>

        {/* Right Mobile: Quick Actions (Respiro 60s & SOS) */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          {/* Botão Respiro 60s */}
          <button
            onClick={() => setIsBreathingModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#8A9A5B]/15 hover:bg-[#8A9A5B]/25 text-[#8A9A5B] border border-[#8A9A5B]/35 font-bold text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-full transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Pausa Acolhedora - Respiro de 60 Segundos"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Respiro</span>
          </button>

          {/* Botão SOS */}
          <button
            onClick={() => {
              setIsEmergencyOpen(true);
              markSosResponseRead();
            }}
            data-tour="sos-button"
            className={`flex items-center gap-1 font-black text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-full transition-all active:scale-95 border relative cursor-pointer shadow-sm ${
              hasUnreadSosReply
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/35'
            }`}
            title="Canal SOS Privado de Acolhimento"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
            <span>SOS</span>
            {hasUnreadSosReply && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping absolute -top-0.5 -right-0.5 border border-rose-600" />
            )}
          </button>
        </div>

      </div>
    </header>

    {/* ── MOBILE BOTTOM TAB BAR ───────────────────────────────────────────── */}
    <nav
      aria-label="Navegação Principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070D0F]/98 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
    >
      <div className="grid grid-cols-4 px-2 pt-2 pb-1.5 items-center">

        {/* Tab 1: Conteúdos */}
        <button
          onClick={() => setActiveTab('home')}
          data-tour="contents-nav"
          className="flex flex-col items-center gap-1 py-1 min-h-[50px] justify-center active:scale-95 transition-transform"
        >
          <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
            activeTab === 'home' ? 'bg-[#FF7F5B]/15 border border-[#FF7F5B]/30' : 'hover:bg-white/5'
          }`}>
            <Film className={`w-5 h-5 transition-colors ${activeTab === 'home' ? 'text-[#FF7F5B]' : 'text-slate-200'}`} />
            <span className={`text-[10px] tracking-wide transition-all ${
              activeTab === 'home' ? 'text-[#FF7F5B] font-black' : 'text-slate-200 font-semibold'
            }`}>
              Conteúdos
            </span>
          </div>
        </button>

        {/* Tab 2: Comunidade */}
        <button
          onClick={() => setActiveTab('community')}
          data-tour="community-nav"
          className="flex flex-col items-center gap-1 py-1 min-h-[50px] justify-center active:scale-95 transition-transform"
        >
          <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
            activeTab === 'community' ? 'bg-[#8A9A5B]/15 border border-[#8A9A5B]/30' : 'hover:bg-white/5'
          }`}>
            <MessageSquare className={`w-5 h-5 transition-colors ${activeTab === 'community' ? 'text-[#8A9A5B]' : 'text-slate-200'}`} />
            <span className={`text-[10px] tracking-wide transition-all ${
              activeTab === 'community' ? 'text-[#8A9A5B] font-black' : 'text-slate-200 font-semibold'
            }`}>
              Comunidade
            </span>
          </div>
        </button>

        {/* Tab 3: Emoções */}
        <button
          onClick={() => {
            setIsEmotionalHistoryOpen(true);
            awardBadge('b21'); // Olhar Para Dentro
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          data-tour="emotions-button"
          className="flex flex-col items-center gap-1 py-1 min-h-[50px] justify-center active:scale-95 transition-transform"
        >
          <div className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all hover:bg-white/5">
            <HeartHandshake className="w-5 h-5 text-[#E66795]" />
            <span className="text-[10px] font-semibold tracking-wide text-slate-200">
              Emoções
            </span>
          </div>
        </button>

        {/* Tab 4: Perfil */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              setActiveTab('dashboard');
            } else {
              onOpenAuthModal();
            }
          }}
          data-tour="profile-avatar"
          className="flex flex-col items-center gap-1 py-1 min-h-[50px] justify-center active:scale-95 transition-transform"
        >
          <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
            activeTab === 'dashboard' ? 'bg-[#FFD166]/15 border border-[#FFD166]/30' : 'hover:bg-white/5'
          }`}>
            {isAuthenticated && user ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={`w-5 h-5 rounded-full object-cover transition-all ${
                  activeTab === 'dashboard'
                    ? 'ring-2 ring-[#FFD166]'
                    : 'ring-1 ring-white/30 opacity-90'
                }`}
              />
            ) : (
              <UserCheck className={`w-5 h-5 transition-colors ${activeTab === 'dashboard' ? 'text-[#FFD166]' : 'text-slate-200'}`} />
            )}
            <span className={`text-[10px] tracking-wide transition-all ${
              activeTab === 'dashboard' ? 'text-[#FFD166] font-black' : 'text-slate-200 font-semibold'
            }`}>
              Perfil
            </span>
          </div>
        </button>

      </div>
    </nav>
    {/* ── END MOBILE BOTTOM TAB BAR ───────────────────────────────────────── */}

      {/* Feature 1 Modal: Diário de Emoções (Resumo de 4 Semanas e Calendário - Opção A) */}
      {isEmotionalHistoryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#0D1518] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/10 relative space-y-6 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEmotionalHistoryOpen(false)}
              aria-label="Fechar Diário de Emoções"
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabeçalho Acolhedor sem Emojis */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-12 h-12 rounded-full bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 text-[#FF7F5B] flex items-center justify-center mx-auto shadow-inner">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Seu Diário de Emoções
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Acompanhe como você tem se sentido nos últimos dias e respeite cada fase, com carinho e sem culpa.
              </p>
            </div>

            {/* 1. Barra de Equilíbrio Emocional (Resumo das Últimas 4 Semanas) */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Equilíbrio (Últimas 4 Semanas)
                </span>
                <span className="text-[10px] text-slate-300 font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {dynamicSummary.total} {dynamicSummary.total === 1 ? 'dia registrado' : 'dias registrados'}
                </span>
              </div>

              {dynamicSummary.total === 0 ? (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-300">
                    Você ainda não registrou nenhuma emoção recente.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Faça seu primeiro check-in diário na aba <strong>Comunidade</strong> para acompanhar seu sentir.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Barra Contínua Segmentada */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
                    {dynamicSummary.categories.map(cat => 
                      cat.count > 0 ? (
                        <div
                          key={cat.id}
                          style={{ width: `${(cat.count / dynamicSummary.total) * 100}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${cat.colorBg}`}
                          title={`${cat.label}: ${cat.count}x (${cat.percent}%)`}
                        />
                      ) : null
                    )}
                  </div>

                  {/* 4 Chips de Sentimento em Grade 2x2 Elegante */}
                  <div className="grid grid-cols-2 gap-2">
                    {dynamicSummary.categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          cat.count > 0 
                            ? `${cat.chipBg} ${cat.colorBorder} ${cat.colorText}` 
                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderEmotionIcon(cat.id, "w-3.5 h-3.5 shrink-0")}
                          <span className="truncate text-[11px]">{cat.label}</span>
                        </div>
                        <span className="text-[11px] font-black shrink-0 ml-1.5 opacity-90">
                          {cat.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Calendário Minimalista dos Últimos 28 Dias */}
            <div className="space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Histórico Diário (28 Dias)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {dynamicLast4WeeksDays[0] && dynamicLast4WeeksDays[27] 
                    ? `${dynamicLast4WeeksDays[0].day} ${dynamicLast4WeeksDays[0].month} a ${dynamicLast4WeeksDays[27].day} ${dynamicLast4WeeksDays[27].month}`
                    : ''}
                </span>
              </div>

              <div className="bg-white/[0.02] p-3 sm:p-4 rounded-2xl border border-white/10 space-y-2">
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                    <span key={i} className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{d}</span>
                  ))}
                </div>

                {/* Grid das 28 células */}
                <div className="grid grid-cols-7 gap-1.5 pt-1 text-center">
                  {dynamicLast4WeeksDays.map((item, idx) => {
                    const hasCheckin = Boolean(item.emotionId);
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative ${
                          item.isToday
                            ? 'bg-[#FF7F5B]/15 border-2 border-[#FF7F5B] text-white shadow-lg ring-2 ring-[#FF7F5B]/30'
                            : hasCheckin
                            ? 'bg-white/5 border border-white/15 hover:border-white/30'
                            : 'bg-white/[0.01] border border-white/5 hover:border-white/10'
                        }`}
                        title={`${item.day} de ${item.month}: ${item.label}${item.isToday ? ' (Hoje)' : ''}`}
                      >
                        {/* Número do dia com boa legibilidade */}
                        <span className={`text-[11px] font-bold leading-none ${
                          item.isToday ? 'text-[#FF7F5B] font-black' : hasCheckin ? 'text-white' : 'text-slate-500'
                        }`}>
                          {item.day}
                        </span>

                        {/* Ícone sutil ou ponto mínimo neutro */}
                        <div className="mt-1 flex items-center justify-center h-4 w-4">
                          {hasCheckin ? (
                            renderEmotionIcon(item.emotionId, "w-3.5 h-3.5")
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                          )}
                        </div>

                        {/* Tag de início de mês */}
                        {item.isFirstOfMonth && (
                          <span className="absolute -top-1.5 -right-1 bg-white/15 text-white text-[7px] font-extrabold uppercase px-1 rounded-sm tracking-tighter shadow-sm">
                            {item.month}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Mensagem Acolhedora Dinâmica */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{emotionalInsight}"
              </p>
            </div>

            {/* 4. Rodapé e Ações Contextuais */}
            <div className="flex items-center gap-2 pt-1">
              {!todayCheckedIn ? (
                <>
                  <button
                    onClick={() => setIsEmotionalHistoryOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setIsEmotionalHistoryOpen(false);
                      setActiveTab('community');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-[2] bg-gradient-to-r from-[#FF7F5B] to-[#FF9E7D] hover:opacity-95 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Registrar Sentimento de Hoje</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEmotionalHistoryOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Concluir e Voltar
                </button>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Feature 2 Modal: Canal SOS Privado & Acolhimento Humano */}
      {isEmergencyOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-14 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsEmergencyOpen(false)} />

          {/* Modal Container Wrapper com Botão Fechar Flutuando Fora do Box */}
          <div className="relative w-full max-w-lg m-auto z-10">
            {/* Botão Fechar (X) Flutuando Fora do Box no Canto Superior Direito */}
            <button
              onClick={() => setIsEmergencyOpen(false)}
              aria-label="Fechar Atendimento SOS"
              className="absolute -top-12 right-0 sm:-right-3 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer z-20 shadow-xl backdrop-blur-md border border-white/15 hover:scale-105 active:scale-95"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Box */}
            <div className="bg-[#0D1518] rounded-3xl w-full p-5 sm:p-6 shadow-2xl border border-white/10 flex flex-col max-h-[88vh] overflow-y-auto">
              {/* Caixa do CVV / SAMU: 100% da Largura do Contêiner com Texto Alinhado à Esquerda */}
              <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-left text-rose-200/90 text-xs leading-relaxed mb-6 sm:mb-7 shrink-0">
                <span>
                  O SOS da Elana oferece acolhimento e suporte humano, mas não substitui atendimento médico especializado ou de urgência. Em caso de crises, ligue gratuitamente para o{' '}
                  <a href="tel:188" className="font-bold text-white underline decoration-rose-400 hover:text-rose-200 transition-colors">CVV (188)</a>
                  {' '}ou para o{' '}
                  <a href="tel:192" className="font-bold text-white underline decoration-rose-400 hover:text-rose-200 transition-colors">SAMU (192)</a>.
                </span>
              </div>

              {/* Modal Header: "Como podemos te acolher agora?" com Fonte Maior em Destaque */}
              <div className="pb-3 border-b border-white/10 shrink-0 mb-4 text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Como podemos te acolher agora?
                </h3>
                {sosResponse && sosResponse.status !== 'arquivado' && sosResponse.messages && sosResponse.messages.length > 1 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Em diálogo com a equipe
                  </span>
                )}
              </div>

            {/* Conditional Views: Ongoing Chat / Archived / New Ticket Form */}
            {sosResponse && sosResponse.status !== 'arquivado' ? (
              /* --- STATE 1: ACTIVE DIALOGUE --- */
              <div className="flex flex-col flex-1 min-h-0 space-y-3">
                {/* Scrollable messages container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] min-h-[200px]">
                  {sosResponse.messages && sosResponse.messages.length > 0 ? (
                    deduplicateSosMessages(sosResponse.messages).map((msg, i) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF7F5B] to-[#FF9E80] text-slate-950 flex items-center justify-center text-[10px] shrink-0 mb-1 shadow-sm select-none" title="Equipe Elana">
                              🌸
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                              isUser
                                ? 'bg-[#19434B] text-white rounded-br-xs border border-[#2B6069]/40'
                                : 'bg-white/[0.06] text-slate-100 rounded-bl-xs border border-white/10'
                            }`}
                          >
                            {!isUser && (
                              <div className="text-[10px] font-bold text-[#FF7F5B] mb-0.5">
                                Equipe Elana
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            <div
                              className={`text-[9px] mt-1 text-right select-none ${
                                isUser ? 'text-teal-200/60' : 'text-slate-400'
                              }`}
                            >
                              {msg.createdAt}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Legacy single message fallback */
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs bg-[#19434B] text-white rounded-br-xs border border-[#2B6069]/40 shadow-sm">
                          <p className="whitespace-pre-wrap">{sosResponse.userMessage}</p>
                        </div>
                      </div>
                      {sosResponse.adminReply && (
                        <div className="flex items-end gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF7F5B] to-[#FF9E80] text-slate-950 flex items-center justify-center text-[10px] shrink-0 mb-1 shadow-sm">
                            🌸
                          </div>
                          <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs bg-white/[0.06] text-slate-100 rounded-bl-xs border border-white/10 shadow-sm">
                            <div className="text-[10px] font-bold text-[#FF7F5B] mb-0.5">Equipe Elana</div>
                            <p className="whitespace-pre-wrap">{sosResponse.adminReply}</p>
                            {sosResponse.repliedAt && (
                              <div className="text-[9px] text-slate-400 mt-1 text-right">{sosResponse.repliedAt}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Indicador discreto de entrega se acabou de enviar réplica */}
                  {sosResponse.status === 'pendente' && (
                    <div className="flex items-center justify-center gap-1.5 pt-1.5 pb-0.5 text-[11px] text-amber-300/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Mensagem recebida com carinho. A nossa equipe responderá em breve por aqui.</span>
                    </div>
                  )}

                  <div ref={sosChatEndRef} />
                </div>

                {/* Follow-up input for dialogue */}
                <div className="pt-2.5 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2 bg-[#070D0F] border border-white/10 focus-within:border-[#FF7F5B]/50 rounded-2xl p-1.5 pl-3.5 transition-all">
                    <input
                      type="text"
                      placeholder="Escreva uma resposta ou complemento..."
                      value={sosFollowUpText}
                      onChange={(e) => setSosFollowUpText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendSosFollowUp();
                        }
                      }}
                      disabled={isSendingFollowUp}
                      className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSendSosFollowUp}
                      disabled={!sosFollowUpText.trim() || isSendingFollowUp}
                      className="bg-[#FF7F5B] hover:bg-[#ff906f] disabled:opacity-30 disabled:hover:bg-[#FF7F5B] text-slate-950 font-bold p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                      title="Enviar resposta"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : sosResponse?.status === 'arquivado' ? (
              /* --- STATE 2: ARCHIVED / CONCLUDED TICKET --- */
              <div className="flex flex-col flex-1 min-h-0 space-y-3">
                {/* Scrollable history of the concluded conversation */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[320px] min-h-[160px]">
                  {sosResponse.messages && sosResponse.messages.length > 0 ? (
                    deduplicateSosMessages(sosResponse.messages).map((msg, i) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF7F5B] to-[#FF9E80] text-slate-950 flex items-center justify-center text-[10px] shrink-0 mb-1 shadow-sm">
                              🌸
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                              isUser
                                ? 'bg-[#19434B] text-white rounded-br-xs border border-[#2B6069]/40'
                                : 'bg-white/[0.06] text-slate-100 rounded-bl-xs border border-white/10'
                            }`}
                          >
                            {!isUser && (
                              <div className="text-[10px] font-bold text-[#FF7F5B] mb-0.5">
                                Equipe Elana
                              </div>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            <div
                              className={`text-[9px] mt-1 text-right select-none ${
                                isUser ? 'text-teal-200/60' : 'text-slate-400'
                              }`}
                            >
                              {msg.createdAt}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs bg-[#19434B] text-white rounded-br-xs border border-[#2B6069]/40">
                          {sosResponse.userMessage}
                        </div>
                      </div>
                      {sosResponse.adminReply && (
                        <div className="flex items-end gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-[#FF7F5B]/20 text-[#FF7F5B] flex items-center justify-center text-[10px] shrink-0 mb-1">
                            🌸
                          </div>
                          <div className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs bg-white/[0.06] text-slate-100 rounded-bl-xs border border-white/10">
                            {sosResponse.adminReply}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={sosChatEndRef} />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-3 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Atendimento concluído com carinho pela Equipe Elana 🌸</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearActiveSosTicket();
                  }}
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Iniciar Novo Acolhimento SOS</span>
                </button>
              </div>
            ) : (
              /* --- STATE 3: NEW TICKET FORM --- */
              <div className="space-y-4 text-left">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Sua mensagem <strong>não será visível na comunidade</strong>. Ela é enviada de forma 100% privada e confidencial para nossa equipe de acolhimento.
                </p>

                <div className="space-y-3">
                  <textarea
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                    placeholder="Desabafe ou compartilhe o que você está sentindo... Estamos aqui para te escutar com todo o afeto."
                    rows={6}
                    className="w-full min-h-[160px] sm:min-h-[180px] bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B]/60 rounded-2xl p-4 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none leading-relaxed"
                  />

                  <button
                    onClick={handleSendSosTicket}
                    disabled={!sosMessage.trim() || isSendingSos}
                    className="w-full bg-[#FF7F5B] hover:bg-[#ff906f] disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingSos ? 'Enviando...' : 'Enviar Mensagem'}</span>
                  </button>
                </div>
              </div>
            )}

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Feature 3 Modal: Respiro de 60 Segundos (Pausa Acolhedora) */}
      <BreathingModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        onComplete={() => {
          awardBadge('b23'); // Pausa Necessária (60s de respiro)
          const nextCount = (user?.respiroCycles || 0) + 1;
          updateUser({ respiroCycles: nextCount });
          if (nextCount >= 10) {
            awardBadge('b64'); // Mestre do Respiro (10 pausas)
          }
        }}
      />

    </>
  );
};

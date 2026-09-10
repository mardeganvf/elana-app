import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, isAdminUser } from '../../context/AuthContext';
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
  UserCheck,
  Type,
  X,
  Send,
  Lock,
  ShieldCheck,
  Wind,
  CheckCircle2,
  Clock,
  Phone
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
  emoji: string | null;
  label: string;
  isToday?: boolean;
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
    refreshSosTicket
  } = useAuth();
  const { showToast } = useToast();
  const isAdmin = isAdminUser(user);
  const { fontSize, setFontSize } = useFontSize();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMamadaMode, setIsMamadaMode] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Modals State for Emoções, SOS and Respiro de 60s
  const [isEmotionalHistoryOpen, setIsEmotionalHistoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  // User's Real Emotional Check-ins from Supabase
  const [userCheckins, setUserCheckins] = useState<{ date: string; emoji: string; label: string }[]>([]);
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
            let emoji = '💖';
            if (item.emotion_id === 'esperanca' || item.emotion_label?.toLowerCase().includes('esperança')) emoji = '☀️';
            else if (item.emotion_id === 'celebrando' || item.emotion_label?.toLowerCase().includes('celebrando')) emoji = '🎉';
            else if (item.emotion_id === 'sem_energia' || item.emotion_label?.toLowerCase().includes('energia') || item.emotion_label?.toLowerCase().includes('exausto')) emoji = '🪫';
            else if (item.emotion_id === 'precisando_luz' || item.emotion_label?.toLowerCase().includes('luz') || item.emotion_label?.toLowerCase().includes('ajuda')) emoji = '🆘';
            else if (item.emotion_id === 'calma' || item.emotion_label?.toLowerCase().includes('paz')) emoji = '🌿';
            else if (item.emotion_id === 'ansiosa' || item.emotion_label?.toLowerCase().includes('ansiosa')) emoji = '🌊';
            
            return {
              date: item.checkin_date,
              emoji: emoji,
              label: item.emotion_label || 'Emoção'
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
    const seenMap = new Map<string, { date: string; emoji: string; label: string }>();
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

    const checkinMap = new Map<string, { emoji: string; label: string }>();
    uniqueDailyCheckins.forEach(c => {
      checkinMap.set(c.date, { emoji: c.emoji, label: c.label });
    });

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoDate = formatLocalDateKey(d);
      const match = checkinMap.get(isoDate);

      days.push({
        day: d.getDate(),
        month: monthNames[d.getMonth()],
        emoji: match ? match.emoji : null,
        label: match ? match.label : 'Sem registro',
        isToday: i === 0
      });
    }

    return days;
  }, [uniqueDailyCheckins]);

  // Dynamically compute counts per emotional category (strictly 1 vote per unique day)
  const dynamicSummary = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Com Esperança': 0,
      'Celebrando': 0,
      'Sem Energia': 0,
      'Precisando de Luz': 0,
    };

    uniqueDailyCheckins.forEach(c => {
      if (c.label.includes('Esperança') || c.emoji === '☀️') counts['Com Esperança']++;
      else if (c.label.includes('Celebrando') || c.emoji === '🎉') counts['Celebrando']++;
      else if (c.label.includes('Energia') || c.emoji === '🪫') counts['Sem Energia']++;
      else if (c.label.includes('Luz') || c.emoji === '🆘') counts['Precisando de Luz']++;
    });

    return [
      { emoji: '☀️', label: 'Com Esperança', count: counts['Com Esperança'], color: 'bg-[#FFD166]/10 border-[#FFD166]/30 text-[#FFD166]' },
      { emoji: '🎉', label: 'Celebrando', count: counts['Celebrando'], color: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
      { emoji: '🪫', label: 'Sem Energia', count: counts['Sem Energia'], color: 'bg-rose-500/10 border-rose-500/30 text-rose-300' },
      { emoji: '🆘', label: 'Precisando de Luz', count: counts['Precisando de Luz'], color: 'bg-rose-600/20 border-rose-500/40 text-rose-300' },
    ];
  }, [uniqueDailyCheckins]);

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

          {/* Painel do Administrador Shortcut */}
          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={`font-extrabold text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap border cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] font-black'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
              }`}
              title="Painel do Administrador & Guardião"
            >
              <ShieldCheck className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'admin' ? 'text-slate-950' : 'text-[#FF7F5B]'}`} />
              <span>Painel Admin</span>
            </button>
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
                  <div className="absolute right-0 top-full mt-3 w-72 bg-[#101B1E] border border-white/15 rounded-3xl p-4 shadow-2xl z-[9999] text-white space-y-4 animate-scale-up text-left select-none">
                    
                    {/* User Profile Card Header */}
                    <div 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('dashboard');
                      }}
                      className="flex items-center gap-3 p-2 bg-[#070D0F] hover:bg-white/5 rounded-2xl border border-white/10 transition-colors cursor-pointer group"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#FF7F5B]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#FF7F5B] transition-colors truncate">
                          {user.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Ver meu perfil →
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-3">
                      
                      {/* Modo Madrugada (Dark/Night Mode Toggle) */}
                      <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                            isMamadaMode ? 'bg-[#FFD166]/20 border-[#FFD166] text-[#FFD166]' : 'bg-white/5 border-white/10 text-slate-300'
                          }`}>
                            <Moon className="w-4 h-4 fill-current" />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-white">Modo Madrugada</span>
                            <span className="text-[10px] text-slate-400 block">Luz suave para não despertar o bebê</span>
                          </div>
                        </div>

                        <button
                          onClick={toggleMamadaMode}
                          className={`w-10 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                            isMamadaMode ? 'bg-[#FFD166]' : 'bg-white/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            isMamadaMode ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      {/* Tamanho de Fonte (Acessibilidade) */}
                      <div className="p-2 space-y-2 rounded-2xl bg-[#070D0F] border border-white/10">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <Type className="w-4 h-4 text-[#FF7F5B]" />
                          <span>Tamanho do Texto (Acessibilidade)</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            onClick={() => setFontSize('sm')}
                            className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              fontSize === 'sm'
                                ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-md'
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            A-
                          </button>
                          <button
                            onClick={() => setFontSize('md')}
                            className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              fontSize === 'md'
                                ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-md'
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            A Normal
                          </button>
                          <button
                            onClick={() => setFontSize('lg')}
                            className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              fontSize === 'lg'
                                ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-md'
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            A+
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions (Ajuda & Logout) */}
                    <div className="border-t border-white/10 pt-3 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          if (onRestartTutorial) {
                            onRestartTutorial();
                          }
                        }}
                        className="w-full text-xs font-bold text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Rever Tutorial de Boas-Vindas</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setActiveTab('admin');
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                          }}
                          className="w-full text-xs font-extrabold text-[#FF7F5B] hover:text-[#FFD166] p-2.5 rounded-xl bg-[#FF7F5B]/10 hover:bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 flex items-center gap-2 transition-all text-left cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#FF7F5B]" />
                          <span>Painel do Administrador</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                          setActiveTab('login');
                        }}
                        className="w-full text-xs font-bold text-rose-400 hover:text-rose-300 p-2 rounded-xl hover:bg-rose-500/10 flex items-center gap-2 transition-colors text-left cursor-pointer"
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

      {/* Feature 1 Modal: Diário de Emoções (Resumo de 4 Semanas e Calendário) */}
      {isEmotionalHistoryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#101B1E] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-center space-y-6 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEmotionalHistoryOpen(false)}
              aria-label="Fechar Diário de Emoções"
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#E66795]/20 border border-[#E66795]/40 text-[#E66795] flex items-center justify-center mx-auto text-2xl shadow-inner">
                💖
              </div>
              <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Seu Diário de Emoções
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Acompanhe como você tem se sentido nos últimos dias e respeite cada fase, com carinho e sem culpa.
              </p>
            </div>

            {/* 1. Resumo Quantitativo por Sentimento (Emotion Breakdown Chips) */}
            <div className="space-y-3 text-left">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Resumo das Últimas 4 Semanas:
              </span>
              
              {userCheckins.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-300">
                    Você ainda não registrou nenhuma emoção recente.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Faça seu primeiro check-in diário na aba <strong>Comunidade</strong> para ver seus gráficos! 💖
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dynamicSummary.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${item.color}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-xl shrink-0">{item.emoji}</span>
                        <span className="truncate text-xs font-bold text-white">{item.label}</span>
                      </div>
                      <span className="bg-black/50 px-3 py-1 rounded-full text-xs font-black text-white shrink-0 ml-2">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Calendário das Últimas 4 Semanas (28 Dias) */}
            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Histórico Diário (4 Semanas)
                </span>
                <span className="text-[10px] text-[#FF7F5B] font-bold bg-[#FF7F5B]/10 px-2.5 py-1 rounded-full border border-[#FF7F5B]/20">
                  {userCheckins.length} {userCheckins.length === 1 ? 'Registro' : 'Registros'} 🌟
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-1 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-slate-500 uppercase">{d}</span>
                ))}

                {dynamicLast4WeeksDays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1 transition-all ${
                      item.isToday
                        ? 'bg-[#FF7F5B]/20 border-[#FF7F5B] text-white shadow-lg ring-2 ring-[#FF7F5B]/40'
                        : item.emoji
                        ? 'bg-white/5 border-white/15 hover:border-white/30'
                        : 'bg-[#070D0F] border-white/10 hover:border-white/20'
                    }`}
                    title={`${item.day} de ${item.month}: ${item.label}`}
                  >
                    <span className={`text-[9px] font-bold ${item.isToday ? 'text-[#FF7F5B]' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                    <span className="text-sm my-0.5 select-none">
                      {item.emoji ? item.emoji : <span className="text-slate-600 font-extrabold">•</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsEmotionalHistoryOpen(false)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
            >
              Fechar Histórico
            </button>

          </div>
        </div>,
        document.body
      )}

      {/* Feature 2 Modal: Canal SOS Privado & Acolhimento Humano */}
      {isEmergencyOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#101B1E] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-500/30 relative flex flex-col m-auto max-h-[90vh]">
            
            {/* Aviso Permanente de Emergência (CVV / SAMU) - Antes do Cabeçalho */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 mb-3 text-xs text-rose-200/90 flex items-start gap-2.5 shrink-0">
              <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                O SOS da Elana oferece acolhimento e suporte humano, mas não substitui atendimento médico especializado ou de urgência. Em caso de crises, ligue gratuitamente para o <strong className="text-white underline">CVV (188)</strong> ou para o <strong className="text-white underline">SAMU (192)</strong>.
              </p>
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    Canal SOS de Acolhimento
                  </h3>
                  {sosResponse && sosResponse.status !== 'arquivado' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {sosResponse.status === 'em_atendimento' ? 'Em atendimento com a Equipe Elana' : 'Chamado enviado — aguardando resposta'}
                    </span>
                  ) : sosResponse?.status === 'arquivado' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Atendimento Concluído
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                onClick={() => setIsEmergencyOpen(false)}
                aria-label="Fechar Atendimento SOS"
                className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conditional Views: Ongoing Chat / Archived / New Ticket Form */}
            {sosResponse && sosResponse.status !== 'arquivado' ? (
              /* --- STATE 1: ACTIVE DIALOGUE --- */
              <div className="flex flex-col flex-1 min-h-0 space-y-3">
                {/* Scrollable messages container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] min-h-[180px]">
                  {sosResponse.messages && sosResponse.messages.length > 0 ? (
                    sosResponse.messages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-1 px-1">
                          {msg.sender === 'user' ? (msg.senderName || 'Você') : '🌸 Equipe Elana'} • {msg.createdAt}
                        </span>
                        <div
                          className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#18393F] text-white rounded-tr-sm border border-[#2B5E66]'
                              : 'bg-[#162327] text-slate-100 rounded-tl-sm border border-[#FF7F5B]/30 shadow-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Legacy single message fallback */
                    <div className="space-y-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 mb-1 px-1">Você</span>
                        <div className="max-w-[88%] rounded-2xl p-3.5 text-xs bg-[#18393F] text-white rounded-tr-sm border border-[#2B5E66]">
                          <p className="whitespace-pre-wrap">{sosResponse.userMessage}</p>
                        </div>
                      </div>
                      {sosResponse.adminReply && (
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] text-[#FF7F5B] mb-1 px-1 font-bold">🌸 Equipe Elana • {sosResponse.repliedAt || ''}</span>
                          <div className="max-w-[88%] rounded-2xl p-3.5 text-xs bg-[#162327] text-slate-100 rounded-tl-sm border border-[#FF7F5B]/30">
                            <p className="whitespace-pre-wrap">{sosResponse.adminReply}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback se acabou de mandar e aguarda equipe */}
                  {sosResponse.status === 'pendente' && (
                    <div className="bg-[#070D0F]/70 p-3 rounded-2xl border border-amber-500/20 text-center text-[11px] text-amber-200/90 flex items-center justify-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                      <span>Mensagem recebida com carinho. Nossa equipe responderá em breve por aqui.</span>
                    </div>
                  )}

                  <div ref={sosChatEndRef} />
                </div>

                {/* Follow-up input for dialogue */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-2 shrink-0">
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
                    className="flex-1 bg-[#070D0F] border border-white/15 focus:border-[#FF7F5B] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleSendSosFollowUp}
                    disabled={!sosFollowUpText.trim() || isSendingFollowUp}
                    className="bg-[#FF7F5B] hover:bg-[#e06847] disabled:opacity-40 text-slate-950 font-black p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                    title="Enviar resposta"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : sosResponse?.status === 'arquivado' ? (
              /* --- STATE 2: ARCHIVED / CONCLUDED TICKET --- */
              <div className="flex flex-col flex-1 min-h-0 space-y-3">
                {/* Scrollable history of the concluded conversation */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] min-h-[150px]">
                  {sosResponse.messages && sosResponse.messages.length > 0 ? (
                    sosResponse.messages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-1 px-1">
                          {msg.sender === 'user' ? (msg.senderName || 'Você') : '🌸 Equipe Elana'} • {msg.createdAt}
                        </span>
                        <div
                          className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#18393F] text-white rounded-tr-sm border border-[#2B5E66]'
                              : 'bg-[#162327] text-slate-100 rounded-tl-sm border border-[#FF7F5B]/30 shadow-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-[#18393F] text-white rounded-2xl p-3.5 text-xs border border-[#2B5E66]">
                        {sosResponse.userMessage}
                      </div>
                      {sosResponse.adminReply && (
                        <div className="bg-[#162327] text-slate-100 rounded-2xl p-3.5 text-xs border border-[#FF7F5B]/30">
                          {sosResponse.adminReply}
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={sosChatEndRef} />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Atendimento concluído com carinho pela Equipe Elana 🌸</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Esperamos ter oferecido o suporte necessário. Se precisar de apoio novamente, clique abaixo para abrir um novo chamado.
                  </p>
                </div>

                <button
                  onClick={() => {
                    clearActiveSosTicket();
                  }}
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Iniciar Novo Acolhimento SOS</span>
                </button>
              </div>
            ) : (
              /* --- STATE 3: NEW TICKET FORM --- */
              <div className="space-y-4 text-left">
                <div className="space-y-1.5 text-left">
                  <h4 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Como podemos te acolher agora?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sua mensagem <strong>não será visível na comunidade</strong>. Ela é enviada de forma 100% privada e confidencial para nossa equipe de acolhimento.
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                    placeholder="Desabafe ou compartilhe o que você está sentindo... Estamos aqui para te escutar com todo o afeto."
                    rows={5}
                    className="w-full bg-[#070D0F] border border-white/15 focus:border-rose-400/60 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none"
                  />

                  <button
                    onClick={handleSendSosTicket}
                    disabled={!sosMessage.trim() || isSendingSos}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingSos ? 'Enviando chamado...' : 'Pedir Acolhimento da Equipe'}</span>
                  </button>
                </div>
              </div>
            )}

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
          const breathKey = `elana_respiro_cycles_${user?.id || 'current_user'}`;
          const currentCount = parseInt(localStorage.getItem(breathKey) || '0', 10) + 1;
          localStorage.setItem(breathKey, currentCount.toString());
          if (currentCount >= 10) {
            awardBadge('b64'); // Mestre do Respiro (10 pausas)
          }
        }}
      />

    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useFontSize } from '../../context/FontSizeContext';
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
  Lock
} from 'lucide-react';
import logoElana from '../../assets/logo-elana.png';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuthModal }) => {
  const { user, isAuthenticated, logout, sosResponse, sendSosTicket, markSosResponseRead } = useAuth();
  const { fontSize, setFontSize } = useFontSize();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMamadaMode, setIsMamadaMode] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Modals State for Emoções and SOS
  const [isEmotionalHistoryOpen, setIsEmotionalHistoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // SOS Private Message State
  const [sosMessage, setSosMessage] = useState('');
  const [isSosSent, setIsSosSent] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const hasUnreadSosReply = !!(sosResponse && sosResponse.adminReply && !sosResponse.isRead);

  const toggleMamadaMode = () => {
    setIsMamadaMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('mamada-mode', next);
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

  // Mock emotional check-ins data for the current month
  const mockEmotions: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '💖', label: 'Acolhida' },
    2: { emoji: '😴', label: 'Cansada' },
    3: { emoji: '✨', label: 'Esperançosa' },
    4: { emoji: '🌧️', label: 'Sobrecarregada' },
    5: { emoji: '☕', label: 'Em Paz' },
    7: { emoji: '💖', label: 'Grata' },
    8: { emoji: '😴', label: 'Sono Acumulado' },
    9: { emoji: '✨', label: 'Leve' },
    11: { emoji: '💪', label: 'Firme' },
    12: { emoji: '💖', label: 'Abençoada' },
    14: { emoji: '🧘', label: 'Centrada' },
    15: { emoji: '☕', label: 'Tranquila' },
    18: { emoji: '💖', label: 'Acolhida' },
    20: { emoji: '✨', label: 'Esperançosa' },
    21: { emoji: '💖', label: 'Amada' },
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
          
          {/* Suas Emoções (Abre o Modal de Histórico de Check-ins Emocionais) */}
          <button
            onClick={() => {
              setIsEmotionalHistoryOpen(true);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            data-tour="emotions-button"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs px-3.5 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            title="Suas Emoções - Histórico de Check-ins"
          >
            <HeartHandshake className="w-4 h-4 text-[#E66795] shrink-0" />
            <span>Suas Emoções</span>
          </button>

          {/* SOS Canal de Acolhimento Humano */}
          <button
            onClick={() => {
              setIsEmergencyOpen(true);
              setIsSosSent(false);
              setSosMessage('');
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

        </div>

        {/* Right: Gamification Widget & Profile Dropdown Avatar */}
        <div className="flex items-center gap-3 text-slate-300 shrink-0">
          
          {isAuthenticated && user ? (
            <>
              {/* Gamification Stats Pill */}
              <div 
                data-tour="profile-nav"
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
                          localStorage.removeItem(`elana_spotlight_done_${user.email}`);
                          window.location.reload();
                        }}
                        className="w-full text-xs font-bold text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Rever Tutorial de Boas-Vindas</span>
                      </button>

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

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#070D0F]/95 backdrop-blur-lg px-4 py-2 flex items-center justify-around z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'home' ? 'text-[#FF7F5B]' : 'text-slate-400'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Conteúdos</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'community' ? 'text-[#FF7F5B]' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Comunidade</span>
        </button>

        <button
          onClick={() => {
            setIsEmotionalHistoryOpen(true);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
        >
          <HeartHandshake className="w-5 h-5 text-[#E66795]" />
          <span>Emoções</span>
        </button>

        <button
          onClick={() => {
            setIsEmergencyOpen(true);
            setIsSosSent(false);
            setSosMessage('');
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-rose-400"
        >
          <LifeBuoy className="w-5 h-5" />
          <span>SOS</span>
        </button>

        <button
          onClick={() => {
            if (isAuthenticated) {
              setActiveTab('dashboard');
            } else {
              onOpenAuthModal();
            }
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'dashboard' ? 'text-[#FF7F5B]' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </div>

      {/* Feature 1 Modal: Histórico de Check-ins Emocionais ("Suas Emoções") */}
      {isEmotionalHistoryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#101B1E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-center space-y-6 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEmotionalHistoryOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#E66795]/20 border border-[#E66795]/40 text-[#E66795] flex items-center justify-center mx-auto text-2xl">
                💖
              </div>
              <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Seu Diário de Emoções
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Olhar para o seu sentir com carinho é o primeiro passo para um autocuidado leve e sem cobranças.
              </p>
            </div>

            {/* Monthly Emotion Calendar Grid */}
            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider">Agosto / 2026</span>
                <span className="text-[10px] text-[#FF7F5B] font-bold bg-[#FF7F5B]/10 px-2.5 py-1 rounded-full border border-[#FF7F5B]/20">
                  15 Check-ins este mês 🌟
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-1 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-slate-500 uppercase">{d}</span>
                ))}

                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const emotion = mockEmotions[dayNum];
                  const isToday = dayNum === 22;

                  return (
                    <div
                      key={dayNum}
                      className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1 transition-all ${
                        isToday
                          ? 'bg-[#FF7F5B]/20 border-[#FF7F5B] text-white shadow-lg'
                          : emotion
                          ? 'bg-white/5 border-white/15 hover:border-white/30'
                          : 'bg-[#070D0F] border-white/10 hover:border-white/20'
                      }`}
                      title={`${dayNum}/08: ${emotion ? emotion.label : 'Sem registro'}`}
                    >
                      <span className={`text-[9px] font-bold ${isToday ? 'text-[#FF7F5B]' : 'text-slate-400'}`}>
                        {dayNum}
                      </span>
                      <span className="text-sm my-0.5 select-none">
                        {emotion ? emotion.emoji : <span className="text-slate-600 font-extrabold">•</span>}
                      </span>
                    </div>
                  );
                })}
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
          <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-500/30 relative text-center space-y-5 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEmergencyOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {sosResponse && sosResponse.adminReply ? (
              <div className="space-y-4 py-1 text-left animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 text-center">
                  <HeartHandshake className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">Resposta da Nossa Equipe 💖</span>
                </div>

                <div className="space-y-1 bg-[#070D0F] p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sua Pergunta / Desabafo:</span>
                  <p className="text-xs text-slate-300 italic">"{sosResponse.userMessage}"</p>
                </div>

                <div className="bg-[#162327] p-4 rounded-2xl border border-[#FF7F5B]/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#FF7F5B] uppercase tracking-wider">Acolhimento Enviado pela Equipe:</span>
                    <span className="text-[10px] text-slate-400">{sosResponse.repliedAt}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-medium">
                    "{sosResponse.adminReply}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    markSosResponseRead();
                    setIsEmergencyOpen(false);
                  }}
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  Agradecer e Concluir Acolhimento 💖
                </button>
              </div>
            ) : !isSosSent ? (
              <>
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
                  <LifeBuoy className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    <Lock className="w-3 h-3" /> Canal Privado E Confidencial
                  </div>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Como podemos te ajudar agora?
                  </h3>
                  <div className="text-xs text-slate-300 space-y-1 text-center leading-relaxed">
                    <p className="block">Sua mensagem <strong>não será publicada</strong> na comunidade.</p>
                    <p className="block">Ela é enviada diretamente com <strong>prioridade</strong> para nossa equipe.</p>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <textarea
                    value={sosMessage}
                    onChange={(e) => setSosMessage(e.target.value)}
                    placeholder="O que está te incomodando hoje?"
                    rows={4}
                    className="w-full bg-[#070D0F] border border-white/15 focus:border-rose-400/60 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none"
                  />

                  <button
                    onClick={() => {
                      if (!sosMessage.trim()) return;
                      sendSosTicket(sosMessage.trim());
                      setIsSosSent(true);
                    }}
                    disabled={!sosMessage.trim()}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensagem
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
                    O Canal SOS é um espaço de escuta e acolhimento, mas não substitui acompanhamento médico, psicológico ou psiquiátrico. Se você está passando por uma crise grave, não espere! Ligue agora para o CVV (188) ou o SAMU (192).
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-5 py-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ✨
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">
                    Sua Mensagem Foi Enviada
                  </span>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Respire fundo. Você não está só!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#070D0F] p-4 rounded-2xl border border-white/10 text-center">
                    Nossa rede de apoio já recebeu sua mensagem e entrará em contato em breve. 💖
                  </p>
                </div>

                <button
                  onClick={() => setIsEmergencyOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl transition-all cursor-pointer"
                >
                  Fechar SOS
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

    </header>
  );
};

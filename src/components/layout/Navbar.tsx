import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useFontSize } from '../../context/FontSizeContext';
import { 
  Flame, 
  Sparkles, 
  User as UserIcon, 
  Film, 
  MessageSquare, 
  UserCircle, 
  Moon, 
  HelpCircle,
  HeartHandshake,
  LifeBuoy,
  X,
  TrendingUp,
  Lock,
  Send,
  LogOut
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

  // Feature 1 & 2 Modals State
  const [isEmotionalHistoryOpen, setIsEmotionalHistoryOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // SOS Private Message State
  const [sosMessage, setSosMessage] = useState('');
  const [isSosSent, setIsSosSent] = useState(false);

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

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'netflix-nav-scrolled py-3' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Main Nav */}
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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              data-tour="contents-nav"
              className={`flex items-center gap-2 transition-all px-3 py-1.5 rounded-full ${
                activeTab === 'home' ? 'text-white font-extrabold bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-[#FF7F5B]" />
              Conteúdos
            </button>

            <button
              onClick={() => setActiveTab('community')}
              data-tour="community-nav"
              className={`flex items-center gap-2 transition-all px-3 py-1.5 rounded-full ${
                activeTab === 'community' ? 'text-white font-extrabold bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#8A9A5B]" />
              Comunidade
            </button>

          </nav>

        </div>

        {/* Right Action Icons, Emergency Shortcut & User Stats */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-slate-300 shrink-0">
          
          {/* Feature 2: Canal SOS Privado de Acolhimento */}
          <button
            onClick={() => {
              setIsEmergencyOpen(true);
              setIsSosSent(false);
              setSosMessage('');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            data-tour="sos-button"
            className={`font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap border relative ${
              hasUnreadSosReply
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
            }`}
            title={hasUnreadSosReply ? 'Nova resposta da Equipe de Acolhimento!' : 'Canal SOS Privado de Acolhimento'}
          >
            <LifeBuoy className="w-3.5 h-3.5 animate-pulse text-rose-300 shrink-0" />
            <span>SOS</span>
            {hasUnreadSosReply && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping absolute -top-0.5 -right-0.5 border border-rose-600"></span>
            )}
          </button>

          {/* Feature 1: Histórico Emocional Pessoal ("Suas Emoções") */}
          <button
            onClick={() => {
              setIsEmotionalHistoryOpen(true);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            data-tour="emotions-button"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap"
            title="Suas Emoções"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#E66795] shrink-0" />
            <span className="hidden 2xl:inline">Suas Emoções</span>
          </button>

          {/* Feature: Seletor de Tamanho de Fonte (Pequena, Normal, Grande) */}
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/15 shrink-0 select-none" title="Tamanho do Texto (Acessibilidade)">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                fontSize === 'sm'
                  ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-sm scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ fontSize: '10px' }}
              title="Tamanho de Fonte Pequeno (A-)"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                fontSize === 'md'
                  ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-sm scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ fontSize: '12px' }}
              title="Tamanho de Fonte Normal (A)"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                fontSize === 'lg'
                  ? 'bg-[#FF7F5B] text-slate-950 font-black shadow-sm scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ fontSize: '14px' }}
              title="Tamanho de Fonte Grande (A+)"
            >
              A+
            </button>
          </div>

          {isAuthenticated && user ? (
            <>
              {/* Gamification Counters */}
              <div 
                data-tour="profile-nav"
                className="hidden xl:flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15 text-xs font-bold whitespace-nowrap shrink-0"
              >
                <div className="flex items-center gap-1 text-[#FF7F5B]" title="Dias de caminhada conosco">
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>{user.streakDays} dias conosco</span>
                </div>
                <div className="w-px h-3.5 bg-white/20"></div>
                <div className="flex items-center gap-1 text-[#FFD166]" title="Pontuação em Pontos">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{user.xp} pontos</span>
                </div>
              </div>

              {/* User Profile Button */}
              <button
                onClick={() => setActiveTab('dashboard')}
                data-tour="profile-avatar"
                className="flex items-center gap-2 p-0.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all"
                title="Meu Perfil"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#E66795]"
                />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setActiveTab('login');
                }}
                className="p-2 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/15 rounded-full transition-all flex items-center justify-center"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <UserIcon className="w-4 h-4" />
              Entrar
            </button>
          )}

          {/* Modo Madrugada Toggle Button & Help Icon (Placed after Profile) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleMamadaMode}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                isMamadaMode
                  ? 'bg-[#FFD166] text-slate-900 border-[#FFD166] shadow-lg animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'
              }`}
            >
              <Moon className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="hidden xl:inline">Modo Madrugada</span>
            </button>

            <div className="relative group shrink-0">
              <span className="text-slate-400 hover:text-white transition-colors p-1 cursor-help shrink-0 block">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#101B1E] border border-white/20 text-slate-200 text-xs p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-right leading-relaxed">
                Reduz a luz azul da tela para um tom mais suave que ajuda a não despertar o bebê.
              </div>
            </div>
          </div>

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
          Conteúdos
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'community' ? 'text-[#FF7F5B]' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Comunidade
        </button>
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === 'dashboard' ? 'text-[#FF7F5B]' : 'text-slate-400'
          }`}
        >
          <UserCircle className="w-5 h-5" />
          Perfil
        </button>
      </div>

      {/* Feature 1 Modal: Histórico Emocional Pessoal ("Sua Jornada de Sentimentos") */}
      {isEmotionalHistoryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#101B1E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative space-y-6 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEmotionalHistoryOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E66795]/20 border border-[#E66795]/40 text-[#E66795] flex items-center justify-center text-xl shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#E66795] uppercase tracking-wider block">
                  Acompanhamento Pessoal
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  COMO VOCÊ TEM SE SENTIDO.
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#070D0F] p-3.5 rounded-2xl border border-white/10">
              Perceber como você anda se sentindo já é cuidar de si. Aqui está o seu check-in emocional dos últimos 28 dias, tudo em um único lugar e só para você.
            </p>

            {/* Distribution Stats */}
            <div className="space-y-3">
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">🪫 Sem Energia</span>
                    <span className="text-slate-400">4 dias (28%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">☀️ Com Esperança</span>
                    <span className="text-slate-400">6 dias (42%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD166] rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">🎉 Celebrando</span>
                    <span className="text-slate-400">3 dias (21%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8A9A5B] rounded-full" style={{ width: '21%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">🆘 Precisando de Luz</span>
                    <span className="text-slate-400">1 dia (9%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF7F5B] rounded-full" style={{ width: '9%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Week Calendar Grid (28 Days) */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Calendário dos Sentimentos
                </h4>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-500 uppercase">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>

              {/* 28-Day Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (27 - i));
                  const emotions = [
                    { emoji: '🪫', label: 'Sem Energia' },
                    { emoji: '☀️', label: 'Com Esperança' },
                    { emoji: '🎉', label: 'Celebrando' },
                    { emoji: '🆘', label: 'Precisando de Luz' },
                  ];
                  const emotionIdx = (i * 3 + 1) % 5;
                  const emotion = emotionIdx < 4 ? emotions[emotionIdx] : null;
                  const isToday = i === 27;
                  const dayNum = d.getDate();

                  return (
                    <div
                      key={i}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                        isToday
                          ? 'bg-[#FF7F5B]/20 border-[#FF7F5B] shadow-md scale-105'
                          : 'bg-[#070D0F] border-white/10 hover:border-white/20'
                      }`}
                      title={`${dayNum}/${d.getMonth() + 1}: ${emotion ? emotion.label : 'Sem registro'}`}
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
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
            >
              Fechar Histórico
            </button>

          </div>
        </div>,
        document.body
      )}

      {/* Feature 2 Modal: Canal SOS Privado & Acolhimento */}
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
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all"
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
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensagem
                  </button>

                  {/* Disclaimer de Isenção de Responsabilidade ao final do container */}
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
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl transition-all"
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

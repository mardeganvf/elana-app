import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { JOURNEYS_DATA } from '../data/journeysData';
import { supabase } from '../lib/supabase';
import { 
  BRAND_REACTIONS, 
  TRANSVERSAL_ROOMS, 
  AGE_BRACKET_ROOMS 
} from '../data/communityData';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { PublicProfileModal, PublicUserProfile } from '../components/community/PublicProfileModal';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  ShieldCheck,
  ShieldAlert,
  EyeOff, 
  Heart, 
  Sun, 
  Waves, 
  CircleDot, 
  Star, 
  Lightbulb, 
  Flower2,
  ChevronDown,
  Search,
  HelpCircle,
  Wind,
  X,
  Sparkles
} from 'lucide-react';

export type ActiveSelection = 
  | { type: 'jornada'; journeyId: string; subOption: 'ajuda' | 'celebrar' | 'desabafar' | 'abertas' }
  | { type: 'geral'; roomId: string }
  | { type: 'idade'; ageId: string }
  | null;

const EMOTIONAL_CHECKINS = [
  { 
    id: 'exausto', 
    emoji: '🪫', 
    label: 'Sem Energia', 
    intention: 'desabafar', 
    phrases: [
      'Hoje a bateria está vazia ... e tudo bem. Descansar também é cuidar.',
      'Sem energia também é uma forma de dizer "já fiz muito". Respire.',
      'Alguns dias pedem só sobrevivência. Você está indo bem!',
      'Cansaço não é fraqueza — é sinal de quanto você dando conta de muito.',
      'Sem pilha não significa sem valor. Você é imprescindível.',
      'Não tem problema render menos hoje. Você merece!',
      'O cansaço de hoje não apaga tudo que você já construiu.',
      'Talvez hoje seja só sobre respirar e seguir, sem pressa.',
      'Está tudo bem sentir que não tem mais o que dar agora.',
      'Reconhecer o cansaço já é um jeito de cuidar de si.'
    ]
  },
  { 
    id: 'esperanca', 
    emoji: '☀️', 
    label: 'Com Esperança', 
    intention: 'abertas', 
    phrases: [
      'Um dia de esperança rende mais do que parece.',
      'Hoje o dia parece mais leve — aproveite esse gás.',
      'Você está enxergando possibilidade, e isso já é um presente.',
      'Ter esperança não é ingenuidade — é coragem de continuar.',
      'Um dia bom já é motivo suficiente pra sorrir.',
      'Que essa sensação boa dure o quanto puder.',
      'Hoje parece que dá pra respirar mais fundo. Aproveite.',
      'A esperança de hoje é sua, e ela é real.',
      'Essa sensação é combustível pros dias mais difíceis.',
      'Aproveite a luz de hoje pra nutrir o seu coração e sua casa.'
    ]
  },
  { 
    id: 'celebrando', 
    emoji: '🎉', 
    label: 'Celebrando', 
    intention: 'celebrar', 
    phrases: [
      'Toda vitória merece ser celebrada, mesmo as pequenas.',
      'Hoje é dia de reconhecer o quanto você caminhou.',
      'Você tem motivo de sobra pra sorrir hoje.',
      'Hoje o dia pediu brinde. Aproveite essa energia boa.',
      'Celebrar também é uma forma de cuidar de si.',
      'Que bom te ver assim, leve e feliz.',
      'Comemore sem culpa — você trabalhou por isso.',
      'Um dia de vitória merece ser vivido por inteiro.',
      'Sinta esse orgulho, ele é seu.',
      'Hoje a vida sorriu de volta pra você.'
    ]
  },
  { 
    id: 'preciso_luz', 
    emoji: '🆘', 
    label: 'Precisando de Luz', 
    intention: 'ajuda', 
    phrases: [
      'Está tudo bem pedir ajuda. Você não precisa passar por isso só!',
      'Precisar de luz não é fraqueza — é coragem de reconhecer.',
      'Você não precisa carregar tudo sem ajuda hoje. Estamos aqui!',
      'Está tudo bem não estar bem agora.',
      'Pedir ajuda é o primeiro passo pra encontrar alívio.',
      'Você merece cuidado. Especialmente nos dias mais difíceis.',
      'Não existe problema pequeno demais pra pedir apoio.',
      'Reconhecer que precisa de ajuda já é um ato de coragem.',
      'Se hoje está pesado, saiba que existe apoio pra você aqui.',
      'Dias difíceis também merecem acolhimento, não solução imediata.'
    ]
  }
];

const splitTextIntoTwoLines = (text: string) => {
  if (!text) return { line1: '', line2: '' };
  const words = text.trim().split(' ');
  if (words.length <= 1) return { line1: text, line2: '' };

  const targetLength = text.length * 0.55;
  let currentLength = 0;
  let splitIdx = 1;

  for (let i = 0; i < words.length - 1; i++) {
    currentLength += words[i].length + 1;
    if (currentLength >= targetLength) {
      splitIdx = i + 1;
      break;
    }
    splitIdx = i + 1;
  }

  const line1 = words.slice(0, splitIdx).join(' ');
  const line2 = words.slice(splitIdx).join(' ');
  return { line1, line2 };
};

export const CommunityPage: React.FC = () => {
  const { posts, toggleReaction, toggleCommentReaction, addComment } = useCommunity();
  const { isAuthenticated } = useAuth();

  // Left Sidebar Drill-Down State (All collapsed and none selected by default)
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState<ActiveSelection>(null);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Emotional Check-in Pop-up State
  const [isDailyCheckinModalOpen, setIsDailyCheckinModalOpen] = useState(false);
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [submittedEmotionObj, setSubmittedEmotionObj] = useState<typeof EMOTIONAL_CHECKINS[0] | null>(null);

  // Respiro 60s Breathing Modal State
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathingTimer, setBreathingTimer] = useState(60);
  const [breathingPhase, setBreathingPhase] = useState<'puxe' | 'segure' | 'solte'>('puxe');

  // Modals & Inline Comments State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedCommentsMap, setExpandedCommentsMap] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentAnonMap, setCommentAnonMap] = useState<Record<string, boolean>>({});

  // IA Antijulgamento (Anti-Mom Shaming Filter) Modal State
  const [flaggedCommentInfo, setFlaggedCommentInfo] = useState<{ isOpen: boolean; matchedWord?: string } | null>(null);

  // Feed Pagination State (Initial 15 topics, +15 on "Carregar Mais")
  const [visibleCount, setVisibleCount] = useState(15);

  // Public Profile Modal State
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<PublicUserProfile | null>(null);

  const openAuthorProfile = (author: {
    id: string;
    name: string;
    avatar: string;
    role?: 'membro' | 'guia' | 'curadoria';
    tag?: string;
    isAnonymous?: boolean;
  }) => {
    // Populate rich mock data for children, photos & testimonials
    const mockChildren = [
      { id: 'c1', name: 'Cecília', age: '8 meses' },
      { id: 'c2', name: 'Theo', age: '3 anos' }
    ];

    const mockPhotos = [
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=600&auto=format&fit=crop&q=80'
    ];

    const mockTestimonials = [
      {
        id: 't1',
        authorName: 'Mariana Santos',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: `A ${author.name.split(' ')[0]} é uma luz na nossa comunidade! Me acolheu com palavras tão calmas na madrugada mais difícil com a amamentação da minha filha. Gratidão enorme por essa presença carinhosa! ✨💖`,
        createdAt: 'Há 2 dias',
        likesCount: 14
      },
      {
        id: 't2',
        authorName: 'Camila Rodrigues',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        content: `Pessoa maravilhosa e super dedicada! Suas respostas nos tópicos sempre transmitem paz, empatia e zero julgamento. Orgulho de caminhar ao seu lado na Elana! 🌿🌸`,
        createdAt: 'Há 1 semana',
        likesCount: 9
      },
      {
        id: 't3',
        authorName: 'Rodrigo Mendonça',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: `Muito bom ver o quanto a ${author.name.split(' ')[0]} soma nos desabafos e trocas de experiência. Uma verdadeira referência de acolhimento genuíno! 👏⭐`,
        createdAt: 'Há 2 semanas',
        likesCount: 6
      }
    ];

    setSelectedPublicProfile({
      id: author.id,
      name: author.name,
      avatar: author.avatar,
      role: author.role,
      tag: author.tag || (author.role === 'guia' ? 'Guia & Mentor(a)' : 'Mãe de 1ª viagem (0-2 anos)'),
      isAnonymous: author.isAnonymous,
      joinedDate: 'Fevereiro/2026',
      levelNumber: author.role === 'guia' ? 10 : 4,
      levelName: author.role === 'guia' ? 'Oliveira' : 'Raiz Firme',
      levelIcon: author.role === 'guia' ? '🫒' : '🪵',
      xp: author.role === 'guia' ? 3900 : 650,
      streakDays: author.role === 'guia' ? 42 : 8,
      postsCount: author.role === 'guia' ? 48 : 14,
      commentsCount: author.role === 'guia' ? 156 : 38,
      reactionsReceivedCount: author.role === 'guia' ? 420 : 112,
      children: mockChildren,
      photos: mockPhotos,
      testimonials: mockTestimonials
    });
  };

  // Reset pagination when room selection, emotion checkin or search query changes
  useEffect(() => {
    setVisibleCount(15);
  }, [activeSelection, selectedEmotionId, searchQuery]);

  // Ensure scroll to top of viewport when page mounts or modal opens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (isDailyCheckinModalOpen || isBreathingModalOpen) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isDailyCheckinModalOpen, isBreathingModalOpen]);

  // Check-in Pop-up Trigger (Opens every time page opens as requested)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDailyCheckinModalOpen(true);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const [activeRandomPhrase, setActiveRandomPhrase] = useState<string>('');

  const handleSelectDailyEmotion = (item: typeof EMOTIONAL_CHECKINS[0]) => {
    setSelectedEmotionId(item.id);
    setSubmittedEmotionObj(item);
    const randomIndex = Math.floor(Math.random() * item.phrases.length);
    const phrase = item.phrases[randomIndex];
    setActiveRandomPhrase(phrase);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('elana_daily_checkin_date', todayStr);

    // Save check-in into Supabase
    supabase
      .from('emotional_checkins')
      .insert([{
        emotion_id: item.id,
        emotion_label: item.label,
        phrase: phrase,
        checkin_date: todayStr
      }])
      .then(({ error }) => {
        if (error) {
          console.warn('Supabase checkin notice:', error.message);
        } else {
          console.log('✅ Check-in emocional salvo com sucesso no Supabase!');
        }
      });
  };

  const handleCloseDailyCheckin = () => {
    setIsDailyCheckinModalOpen(false);
    setSubmittedEmotionObj(null);
  };

  // 60-Second Breathing Timer Effect
  useEffect(() => {
    let interval: any;
    if (isBreathingModalOpen && breathingTimer > 0) {
      interval = setInterval(() => {
        setBreathingTimer(prev => prev - 1);
      }, 1000);
    } else if (breathingTimer === 0) {
      setIsBreathingModalOpen(false);
      setBreathingTimer(60);
    }
    return () => clearInterval(interval);
  }, [isBreathingModalOpen, breathingTimer]);

  // Breathing Phase Loop: Puxe o Ar (4s) -> Segure (4s) -> Solte o Ar (4s)
  useEffect(() => {
    let interval: any;
    if (isBreathingModalOpen) {
      interval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'puxe') return 'segure';
          if (prev === 'segure') return 'solte';
          return 'puxe';
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isBreathingModalOpen]);

  // Reaction Icon Renderer Helper
  const renderReactionIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-4 h-4 fill-current" style={{ color }} />;
      case 'Sun': return <Sun className="w-4 h-4" style={{ color }} />;
      case 'Waves': return <Waves className="w-4 h-4" style={{ color }} />;
      case 'CircleDot': return <CircleDot className="w-4 h-4" style={{ color }} />;
      case 'Star': return <Star className="w-4 h-4 fill-current" style={{ color }} />;
      case 'Lightbulb': return <Lightbulb className="w-4 h-4 fill-current" style={{ color }} />;
      case 'Flower2': return <Flower2 className="w-4 h-4 fill-current" style={{ color }} />;
      default: return <Heart className="w-4 h-4 fill-current" style={{ color }} />;
    }
  };

  // Filter Posts based on active selection, search query & emotional check-in
  const filteredPosts = posts.filter(post => {
    // Selection filter (if null, show all posts)
    if (activeSelection) {
      if (activeSelection.type === 'jornada') {
        if (post.journeyId !== activeSelection.journeyId) return false;
        if (activeSelection.subOption === 'ajuda' && post.emotionalIntention !== 'ajuda') return false;
        if (activeSelection.subOption === 'celebrar' && post.emotionalIntention !== 'celebrar') return false;
        if (activeSelection.subOption === 'desabafar' && post.emotionalIntention !== 'desabafar') return false;
      } else if (activeSelection.type === 'geral') {
        if (post.transversalRoomId !== activeSelection.roomId) return false;
      } else if (activeSelection.type === 'idade') {
        if (post.ageBracketId !== activeSelection.ageId) return false;
      }
    }

    // Emotional checkin filter
    if (selectedEmotionId) {
      const activeEmotion = EMOTIONAL_CHECKINS.find(e => e.id === selectedEmotionId);
      if (activeEmotion && activeEmotion.intention !== 'abertas') {
        if (post.emotionalIntention !== activeEmotion.intention) return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(q);
      const contentMatch = post.content.toLowerCase().includes(q);
      const authorMatch = post.authorName.toLowerCase().includes(q);
      return titleMatch || contentMatch || authorMatch;
    }

    return true;
  });

  // Paginating visible posts (15 per page)
  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const toggleCommentsExpansion = (postId: string) => {
    setExpandedCommentsMap(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleInlineCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    const isAnon = commentAnonMap[postId] || false;
    const result = addComment(postId, content.trim(), isAnon);

    if (result && result.isFlagged) {
      setFlaggedCommentInfo({ isOpen: true, matchedWord: result.matchedWord });
    }

    // Reset input
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Active header title computation
  const getHeaderDetails = () => {
    if (!activeSelection) {
      return {
        categoryLabel: 'SUA REDE DE APOIO',
        mainTitle: 'Todas as Salas e Conteúdos',
        themeColor: '#FF7F5B'
      };
    }
    if (activeSelection.type === 'jornada') {
      const j = JOURNEYS_DATA.find(item => item.id === activeSelection.journeyId);
      const subLabels = {
        ajuda: 'Preciso de Ajuda',
        celebrar: 'Vamos Celebrar',
        desabafar: 'Preciso Desabafar',
        abertas: 'Abertas pela Comunidade'
      };
      return {
        categoryLabel: j?.title || 'Jornada',
        mainTitle: subLabels[activeSelection.subOption],
        themeColor: j?.themeColor || '#FF7F5B'
      };
    }
    if (activeSelection.type === 'geral') {
      const r = TRANSVERSAL_ROOMS.find(item => item.id === activeSelection.roomId);
      return {
        categoryLabel: 'Geral',
        mainTitle: r ? r.name : 'Geral',
        themeColor: '#0EA5E9' // Light Blue / Sky Blue (distinct from journeys)
      };
    }
    if (activeSelection.type === 'idade') {
      const a = AGE_BRACKET_ROOMS.find(item => item.id === activeSelection.ageId);
      return {
        categoryLabel: 'Idades',
        mainTitle: a ? `${a.name} (${a.range})` : 'Idades',
        themeColor: '#0EA5E9' // Light Blue / Sky Blue (distinct from journeys)
      };
    }
    return { categoryLabel: 'SUA REDE DE APOIO', mainTitle: 'Comunidade Elana', themeColor: '#FF7F5B' };
  };

  const currentHeader = getHeaderDetails();

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto text-white -mt-4 relative">
      
      {/* Daily Check-in Pop-up Modal (Portal to document.body for true viewport centering) */}
      {isDailyCheckinModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-center relative text-white space-y-5 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={handleCloseDailyCheckin}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {!submittedEmotionObj ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#FFD166]/20 border border-[#FFD166]/40 text-[#FFD166] flex items-center justify-center mx-auto text-xl">
                  <Sparkles className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[#FFD166]">
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Check-in Emocional Diário
                    </span>
                    <span 
                      className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-help"
                      title="Perguntamos isso para acolher seu momento emocional e sugerir relatos e conversas que mais fazem sentido para o seu dia."
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Como você está se sentindo hoje?
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {EMOTIONAL_CHECKINS.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDailyEmotion(item)}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#070D0F] hover:bg-white/10 border border-white/10 text-xs font-bold text-white active:scale-95"
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Step 2: Icon + Sentiment centered without surrounding container, phrase below */
              <div className="space-y-5 py-2">
                {/* Header: Icon + Sentiment centered without container box */}
                <div className="flex flex-col items-center justify-center text-center gap-2.5 pt-1">
                  <div className="w-16 h-16 rounded-2xl bg-[#FF7F5B]/20 border border-[#FF7F5B]/40 text-4xl flex items-center justify-center">
                    {submittedEmotionObj.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#FF7F5B] uppercase tracking-wider block">
                      Check-in Emocional
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {submittedEmotionObj.label}
                    </h3>
                  </div>
                </div>

                {/* Phrase below - Centered and split in 2 balanced lines */}
                {(() => {
                  const currentPhrase = activeRandomPhrase || submittedEmotionObj.phrases[0];
                  const { line1, line2 } = splitTextIntoTwoLines(currentPhrase);

                  return (
                    <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 shadow-lg text-center">
                      <div className="text-base sm:text-lg font-bold text-white leading-relaxed italic space-y-0.5">
                        {line2 ? (
                          <>
                            <p>"{line1}</p>
                            <p>{line2}"</p>
                          </>
                        ) : (
                          <p>"{currentPhrase}"</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleCloseDailyCheckin}
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all"
                >
                  Entrar na Comunidade
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* Respiro de 60 Segundos Modal (Portal to document.body for true viewport centering) */}
      {isBreathingModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/10 text-center relative text-white space-y-6 m-auto max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#8A9A5B] uppercase tracking-wider block">
                Pausa Acolhedora
              </span>
              <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Respiro de 60 Segundos
              </h3>
              <p className="text-xs text-slate-400">
                Desacelere seu ritmo. Acompanhe a animação para respirar com calma.
              </p>
            </div>

            {/* Animated Breathing Circle (Puxe o Ar -> Segure -> Solte o Ar) */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center w-48 h-48">
                <div 
                  className={`w-40 h-40 rounded-full border-4 border-[#8A9A5B] bg-[#8A9A5B]/10 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                    breathingPhase === 'puxe' 
                      ? 'scale-125 bg-[#8A9A5B]/30 border-[#FF7F5B]' 
                      : breathingPhase === 'segure' 
                      ? 'scale-125 bg-[#FFD166]/30 border-[#FFD166]' 
                      : 'scale-90 bg-[#8A9A5B]/05 border-[#8A9A5B]'
                  }`}
                >
                  <span className="text-base font-black uppercase text-white tracking-wider animate-pulse text-center px-2">
                    {breathingPhase === 'puxe' && '🌊 Puxe o Ar...'}
                    {breathingPhase === 'segure' && '🧘 Segure...'}
                    {breathingPhase === 'solte' && '🍃 Solte o Ar...'}
                  </span>
                </div>
              </div>

              <div className="font-mono text-xl font-bold text-[#FFD166]">
                00:{breathingTimer.toString().padStart(2, '0')}
              </div>
            </div>

            <button
              onClick={() => setIsBreathingModalOpen(false)}
              className="w-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition-all"
            >
              Concluir Respiro
            </button>

          </div>
        </div>,
        document.body
      )}

      {/* Top Banner (Centered, Coral Orange Header) */}
      <section className="bg-[#101B1E] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF7F5B]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1.5 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#FF7F5B] uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
            SUA REDE DE APOIO
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Nosso espaço seguro de troca e acolhimento.
          </p>
        </div>
      </section>

      {/* Main Layout: Left Drill-Down Sidebar + Right Content Feed */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Sidebar Container */}
        <aside className="w-full lg:w-72 shrink-0 space-y-3">
          
          {/* Button Respiro de 60 Segundos Above Criar Tópico */}
          <button
            onClick={() => {
              setBreathingTimer(60);
              setBreathingPhase('puxe');
              setIsBreathingModalOpen(true);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#8A9A5B]/20 hover:bg-[#8A9A5B]/30 text-[#8A9A5B] border border-[#8A9A5B]/40 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-2xl shadow-md transition-all active:scale-95"
          >
            <Wind className="w-4 h-4 animate-spin-slow" />
            <span>Respiro de 60 Segundos</span>
          </button>

          {/* Menu de Salas Panel */}
          <div className="bg-[#101B1E] rounded-3xl p-5 border border-white/10 shadow-xl space-y-6">
            
            <div className="pb-3 border-b border-white/10">
              <span className="font-extrabold text-xs text-white uppercase tracking-wider block">
                Menu de Salas
              </span>
            </div>

            {/* SECTION 1: GERAL */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-[#8A9A5B] uppercase tracking-wider block px-1">
                Geral
              </span>

              <div className="space-y-1">
                {TRANSVERSAL_ROOMS.map(r => {
                  const isSelected = activeSelection && activeSelection.type === 'geral' && activeSelection.roomId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveSelection({ type: 'geral', roomId: r.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md font-black'
                          : 'bg-[#070D0F] text-slate-300 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="truncate">{r.name}</span>
                        <span 
                          className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelected ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                          title={r.description}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      {r.isAnonymous && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 transition-colors ${
                          isSelected 
                            ? 'bg-black/60 text-white border border-white/20 shadow-sm' 
                            : 'bg-black/50 text-slate-300 border border-white/10'
                        }`}>
                          Modo Anônimo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: JORNADAS */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-extrabold text-[#FFD166] uppercase tracking-wider block px-1">
                Jornadas
              </span>

              <div className="space-y-1.5">
                {JOURNEYS_DATA.map(j => {
                  const isExpanded = expandedJourneyId === j.id;
                  const isSelectedJourney = activeSelection && activeSelection.type === 'jornada' && activeSelection.journeyId === j.id;

                  return (
                    <div key={j.id} className="space-y-1">
                      {/* Journey Accordion Trigger */}
                      <button
                        onClick={() => {
                          setExpandedJourneyId(isExpanded ? null : j.id);
                          if (!isSelectedJourney) {
                            setActiveSelection({ type: 'jornada', journeyId: j.id, subOption: 'abertas' });
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          isSelectedJourney
                            ? 'bg-white/15 text-white border-white/30 shadow-sm'
                            : 'bg-[#070D0F] text-slate-300 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <span className="truncate">{j.title}</span>
                          <span 
                            className="text-slate-400 hover:text-[#FF7F5B] transition-colors p-0.5 shrink-0 cursor-help"
                            title={`Foco: ${j.targetAudience} — ${j.tagline}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#FF7F5B]' : ''}`} />
                      </button>

                      {/* Drill-Down Sub-options (No Icons) */}
                      {isExpanded && (
                        <div className="pl-2 space-y-1 border-l-2 border-[#FF7F5B]/30 ml-2.5 animate-fade-in pt-0.5">
                          <button
                            onClick={() => setActiveSelection({ type: 'jornada', journeyId: j.id, subOption: 'ajuda' })}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold transition-all ${
                              isSelectedJourney && activeSelection.subOption === 'ajuda'
                                ? 'bg-[#FF7F5B] text-white font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>Preciso de Ajuda</span>
                            <span 
                              className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelectedJourney && activeSelection.subOption === 'ajuda' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                              title="Bateu uma dúvida na prática? Pergunta aqui que a gente troca ideias e caminhos com carinho."
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </button>

                          <button
                            onClick={() => setActiveSelection({ type: 'jornada', journeyId: j.id, subOption: 'celebrar' })}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold transition-all ${
                              isSelectedJourney && activeSelection.subOption === 'celebrar'
                                ? 'bg-[#FF7F5B] text-white font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>Vamos Celebrar</span>
                            <span 
                              className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelectedJourney && activeSelection.subOption === 'celebrar' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                              title="Conquista pequena também é vitória gigante! Vem dividir pra gente comemorar junto com você."
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </button>

                          <button
                            onClick={() => setActiveSelection({ type: 'jornada', journeyId: j.id, subOption: 'desabafar' })}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold transition-all ${
                              isSelectedJourney && activeSelection.subOption === 'desabafar'
                                ? 'bg-[#FF7F5B] text-white font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>Preciso Desabafar</span>
                            <span 
                              className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelectedJourney && activeSelection.subOption === 'desabafar' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                              title="Aqui você só precisa colocar pra fora. Ninguém vai te julgar ou dar palpite sem pedir — só acolher."
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </button>

                          <button
                            onClick={() => setActiveSelection({ type: 'jornada', journeyId: j.id, subOption: 'abertas' })}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold transition-all ${
                              isSelectedJourney && activeSelection.subOption === 'abertas'
                                ? 'bg-[#FF7F5B] text-white font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>Abertas pela Comunidade</span>
                            <span 
                              className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelectedJourney && activeSelection.subOption === 'abertas' ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                              title="Todos os relatos, conversas e trocas livres sobre esta jornada."
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: IDADES */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-extrabold text-[#E66795] uppercase tracking-wider block px-1">
                Idades
              </span>

              <div className="space-y-1">
                {AGE_BRACKET_ROOMS.map(a => {
                  const isSelected = activeSelection && activeSelection.type === 'idade' && activeSelection.ageId === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setActiveSelection({ type: 'idade', ageId: a.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#FF7F5B] text-white border-[#FF7F5B] shadow-md font-black'
                          : 'bg-[#070D0F] text-slate-300 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span>{a.name}</span>
                        <span 
                          className={`transition-colors p-0.5 shrink-0 cursor-help ${isSelected ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-white'}`}
                          title={a.description}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </aside>

        {/* Right Main Content Feed */}
        <main className="flex-1 space-y-6 w-full min-w-0">
          
          {/* Active Selection Header Card with Journey / Room Theme Color */}
          <div 
            className="rounded-3xl p-6 shadow-xl border border-white/10 space-y-1 relative overflow-hidden transition-colors duration-500 text-white"
            style={{ backgroundColor: currentHeader.themeColor }}
          >
            {/* Subtle Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40 pointer-events-none"></div>

            <div className="relative z-10">
              <span className="text-xs font-extrabold uppercase tracking-wider block opacity-95 text-white/90">
                {currentHeader.categoryLabel}
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {currentHeader.mainTitle}
              </h2>
            </div>
          </div>

          {/* Text Search Bar & Criar Tópico Button Side-by-Side */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por palavras-chave, assuntos ou autores nesta sala"
                className="w-full pl-11 pr-16 py-3.5 rounded-2xl bg-[#101B1E] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F5B] transition-colors shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-white/10 px-2.5 py-1 rounded-lg"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Only show Criar Tópico button when user is inside a specific room/journey (activeSelection !== null) */}
            {activeSelection && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-lg transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Tópico</span>
              </button>
            )}
          </div>

          {/* Feed of Posts */}
          <section className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-[#101B1E] rounded-3xl p-12 text-center space-y-3 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-white/5 text-slate-400 mx-auto flex items-center justify-center text-xl">
                  💬
                </div>
                <h3 className="text-lg font-bold text-white">Nenhum tópico encontrado</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchQuery ? `Nenhum resultado para "${searchQuery}". Tente buscar por outros termos.` : 'Seja o primeiro a compartilhar seu relato nesta sala!'}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl mt-2 shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Tópico
                </button>
              </div>
            ) : (
              <>
                {visiblePosts.map(post => {
                  const isInlineExpanded = !!expandedCommentsMap[post.id];

                  return (
                    <div 
                      key={post.id}
                      className="bg-[#101B1E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-5 hover:border-white/20 transition-all relative overflow-hidden"
                    >
                      
                      {/* Top Author & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div 
                          onClick={post.isAnonymous ? undefined : () => openAuthorProfile({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar, role: post.authorRole, tag: post.authorTag, isAnonymous: post.isAnonymous })}
                          className={`flex items-center gap-3 ${post.isAnonymous ? '' : 'cursor-pointer group'}`}
                        >
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className={`w-10 h-10 rounded-full object-cover border border-white/20 shrink-0 ${post.isAnonymous ? '' : 'group-hover:scale-105 transition-transform'}`}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-xs text-white ${post.isAnonymous ? '' : 'group-hover:text-[#FF7F5B] transition-colors'}`}>
                                {post.authorName}
                              </span>

                              {/* Feature 4: Tag de Identificação de Perfil */}
                              {!post.isAnonymous && (
                                <span className="text-[10px] font-bold bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30 px-2.5 py-0.5 rounded-full shadow-sm">
                                  {post.authorTag || (post.authorRole === 'guia' ? 'Guia & Mentor(a)' : post.authorRole === 'curadoria' ? 'Curadoria Oficial' : 'Mãe de 1ª viagem')}
                                </span>
                              )}
                              
                              {post.isAnonymous && (
                                <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" /> Pseudônimo Confessionário
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{post.createdAt}</span>
                          </div>
                        </div>

                        {/* Moderation / Critical Badge only */}
                        {post.sensitivityLevel === 'critico' && (
                          <div className="self-start sm:self-auto">
                            <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Suporte & Moderação
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="space-y-2">
                        {post.moduleTopic && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF7F5B] bg-[#FF7F5B]/10 px-2.5 py-1 rounded-lg inline-block border border-[#FF7F5B]/20">
                            {post.moduleTopic}
                          </span>
                        )}
                        <h4 className="text-lg font-black text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                          {post.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Reaction Bar */}
                      <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
                        {BRAND_REACTIONS.map(reaction => {
                          const count = post.reactions[reaction.id] || 0;
                          const isReacted = !!(post.userReactions && post.userReactions[reaction.id]);

                          return (
                            <button
                              key={reaction.id}
                              onClick={() => toggleReaction(post.id, reaction.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isReacted
                                  ? 'bg-white/15 text-white border-white/30 shadow-md scale-105'
                                  : 'bg-[#070D0F] text-slate-300 border-white/10 hover:bg-white/5'
                              }`}
                              title={reaction.label}
                            >
                              {renderReactionIcon(reaction.iconName, reaction.color)}
                              <span className="text-xs font-extrabold" style={{ color: reaction.color }}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Rede de Apoio com X Respostas Button (Inline Expand Toggle) */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <button
                          onClick={() => toggleCommentsExpansion(post.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm border ${
                            isInlineExpanded
                              ? 'bg-[#FF7F5B] text-white border-[#FF7F5B]'
                              : 'bg-[#070D0F] text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 text-[#8A9A5B]" />
                          <span>Rede de Apoio ({post.comments.length})</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isInlineExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <span className="text-[11px] text-slate-400">
                          {post.comments.length === 0 ? 'Seja o primeiro a acolher' : `${post.comments.length} respostas empáticas`}
                        </span>
                      </div>

                      {/* Inline Expanded Comments Thread */}
                      {isInlineExpanded && (
                        <div className="pt-4 border-t border-white/10 space-y-4 animate-fade-in">
                          <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            Rede de Acolhimento & Respostas
                          </h5>

                          <div className="space-y-3">
                            {post.comments.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-[#070D0F] p-4 rounded-2xl border border-white/5 text-center">
                                Nenhuma resposta ainda nesta conversa. Deixe um desabafo ou palavra de acolhimento abaixo! 💬
                              </p>
                            ) : (
                              post.comments.map(c => (
                                <div key={c.id} className="flex gap-3 bg-[#070D0F] p-3.5 rounded-2xl border border-white/5">
                                  <img
                                    src={c.authorAvatar}
                                    alt={c.authorName}
                                    onClick={(c.isAnonymous || post.isAnonymous) ? undefined : () => openAuthorProfile({ id: c.authorId, name: c.authorName, avatar: c.authorAvatar, role: c.authorRole, tag: c.authorTag, isAnonymous: c.isAnonymous })}
                                    className={`w-8 h-8 rounded-full object-cover shrink-0 border border-white/10 ${(c.isAnonymous || post.isAnonymous) ? '' : 'cursor-pointer hover:scale-105 transition-transform'}`}
                                  />
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                      <div 
                                        onClick={(c.isAnonymous || post.isAnonymous) ? undefined : () => openAuthorProfile({ id: c.authorId, name: c.authorName, avatar: c.authorAvatar, role: c.authorRole, tag: c.authorTag, isAnonymous: c.isAnonymous })}
                                        className={`flex items-center gap-2 ${(c.isAnonymous || post.isAnonymous) ? '' : 'cursor-pointer group'}`}
                                      >
                                        <span className={`font-bold text-xs text-white ${(c.isAnonymous || post.isAnonymous) ? '' : 'group-hover:text-[#FF7F5B] transition-colors'}`}>{c.authorName}</span>
                                        {c.authorRole === 'guia' && (
                                          <span className="text-[9px] font-extrabold bg-[#8A9A5B]/20 text-[#8A9A5B] px-1.5 py-0.5 rounded-md">
                                            Guia
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed">{c.content}</p>

                                    {/* IA Antijulgamento Moderation Alert Badge */}
                                    {c.status === 'sob_moderacao' && (
                                      <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2 text-amber-300 text-[11px] my-1.5">
                                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                                        <span><strong>IA Antijulgamento:</strong> Comentário retido para moderação preventiva da equipe.</span>
                                      </div>
                                    )}

                                    {/* Simple Heart Reaction for Comments */}
                                    <div className="pt-1.5 flex items-center">
                                      <button
                                        type="button"
                                        onClick={() => toggleCommentReaction(post.id, c.id, 'apoio')}
                                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold transition-all border select-none ${
                                          c.userReactions?.['apoio']
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                                            : 'bg-[#101B1E] text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                                        }`}
                                        title="Coração"
                                      >
                                        <Heart className={`w-3.5 h-3.5 ${c.userReactions?.['apoio'] ? 'fill-current text-rose-400' : 'text-slate-400 hover:text-rose-400'}`} />
                                        {(c.reactions?.['apoio'] || 0) > 0 && (
                                          <span className="text-[10px] font-extrabold text-rose-400">
                                            {c.reactions?.['apoio']}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Inline Comment Form */}
                          {isAuthenticated && (
                            <form onSubmit={(e) => handleInlineCommentSubmit(post.id, e)} className="space-y-2 pt-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Escreva uma resposta com empatia e respeito..."
                                  value={commentInputs[post.id] || ''}
                                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                  className="flex-1 p-3 rounded-xl border border-white/10 text-xs bg-[#101B1E] text-white focus:outline-none focus:border-[#FF7F5B]"
                                />
                                <button
                                  type="submit"
                                  className="bg-[#FF7F5B] hover:bg-[#e06847] text-white p-3 rounded-xl transition-all shadow-md shrink-0"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>

                              {post.transversalRoomId === 'confessionario' && (
                                <label className="flex items-center gap-2 text-[11px] text-purple-300 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={commentAnonMap[post.id] || false}
                                    onChange={(e) => setCommentAnonMap({ ...commentAnonMap, [post.id]: e.target.checked })}
                                    className="rounded border-purple-500 bg-[#101B1E] text-purple-500 focus:ring-0"
                                  />
                                  <span>Responder anonimamente como "Luz em Aprendizado"</span>
                                </label>
                              )}
                            </form>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}

                {/* Carregar Mais Button (Brings next 15 topics) */}
                {visibleCount < filteredPosts.length && (
                  <div className="pt-6 pb-4 text-center">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 15)}
                      className="bg-[#101B1E] hover:bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 mx-auto"
                    >
                      <span>Carregar Mais Tópicos</span>
                      <span className="bg-[#FF7F5B] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        +{Math.min(15, filteredPosts.length - visibleCount)} de {filteredPosts.length - visibleCount} restantes
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          activeSelection={activeSelection}
        />
      )}

      {/* IA Antijulgamento (Anti-Mom Shaming Filter) Warning Modal */}
      {flaggedCommentInfo?.isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-500/40 relative text-center space-y-5 m-auto">
            
            <button
              onClick={() => setFlaggedCommentInfo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg animate-pulse">
              🛡️
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                IA Antijulgamento Elana — Moderação Preventiva
              </span>
              <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Mensagem Encaminhada para Análise
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#070D0F] p-4 rounded-2xl border border-white/10 text-center">
                Identificamos palavras com potencial tom crítico ou agressivo. Na <strong>Elana Academy</strong>, cultivamos um ambiente 100% acolhedor e livre de <em>mom-shaming</em>. Sua mensagem foi encaminhada com prioridade para a nossa equipe de moderação analisar antes de ser publicada. 💖
              </p>
            </div>

            <button
              onClick={() => setFlaggedCommentInfo(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition-all"
            >
              Entendi. Acompanhar Moderação
            </button>

          </div>
        </div>,
        document.body
      )}

      {/* Public Profile Modal */}
      {selectedPublicProfile && (
        <PublicProfileModal
          profile={selectedPublicProfile}
          onClose={() => setSelectedPublicProfile(null)}
        />
      )}

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Share2,
  RefreshCw,
  Award,
  BookOpen,
  ChevronRight,
  Heart,
  Shield,
  Sun,
  Users,
  Compass,
  Flame,
  Palette,
  Smile,
  Wand2,
  Crown,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PARENTAL_QUESTIONS,
  PARENTAL_ARCHETYPES,
  calculateParentalQuizResult,
  ArchetypeProfile,
  QuizCalculationResult,
  ParentalStatus,
  ChildAgeBracket,
  CHILD_AGE_OPTIONS,
  getRecommendedJourneyByAge
} from '../data/parentalQuizData';
import { useAuth } from '../context/AuthContext';
import { ALL_BADGES } from '../data/gamificationData';

interface QuizPageProps {
  onBackToHome: () => void;
  onSelectJourney?: (journeyId: string) => void;
  onOpenAuthModal?: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  onBackToHome,
  onSelectJourney,
  onOpenAuthModal
}) => {
  const { user, updateUser, awardBadge } = useAuth();

  // Estados do fluxo: 'intro' | 'preliminary-status' | 'preliminary-ages' | 'questions' | 'calculating' | 'result'
  const [stage, setStage] = useState<'intro' | 'preliminary-status' | 'preliminary-ages' | 'questions' | 'calculating' | 'result'>(() => {
    return user?.parentalArchetype ? 'result' : 'intro';
  });
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [calculationResult, setCalculationResult] = useState<QuizCalculationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [calculatingStepText, setCalculatingStepText] = useState('Cruzando seus instintos...');
  const [activeTabDossie, setActiveTabDossie] = useState<'luz' | 'sombra' | 'dicas'>('luz');

  // Estados das perguntas preliminares (contexto familiar)
  const [parentalStatus, setParentalStatus] = useState<ParentalStatus | null>(() => {
    try {
      const saved = localStorage.getItem('elana_quiz_parental_status');
      if (saved === 'sim' || saved === 'gestante' || saved === 'nao') return saved as ParentalStatus;
    } catch {}
    return null;
  });

  const [selectedAgeBrackets, setSelectedAgeBrackets] = useState<ChildAgeBracket[]>(() => {
    try {
      const saved = localStorage.getItem('elana_quiz_child_ages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Recupera resultado anterior se já existir
  useEffect(() => {
    let dominantId = user?.parentalArchetype;
    let secondaryId = user?.parentalSecondaryArchetype;

    if (!dominantId) {
      try {
        const keys = [
          user?.id ? `elana_superpoder_${user.id}` : '',
          user?.email ? `elana_superpoder_${user.email.toLowerCase().trim()}` : '',
          'elana_guest_superpoder'
        ].filter(Boolean);

        for (const k of keys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.dominantId) {
              dominantId = parsed.dominantId;
              secondaryId = parsed.secondaryId;
              break;
            }
          }
        }
      } catch {}
    }

    if (dominantId && PARENTAL_ARCHETYPES[dominantId]) {
      const dominant = PARENTAL_ARCHETYPES[dominantId];
      const secondary = secondaryId && PARENTAL_ARCHETYPES[secondaryId]
        ? PARENTAL_ARCHETYPES[secondaryId]
        : PARENTAL_ARCHETYPES['otimista'];

      setCalculationResult({
        dominant,
        secondary,
        scores: {},
        dominantScore: 0,
        secondaryScore: 0,
        dominantPercentage: 65,
        secondaryPercentage: 35,
        allPercentages: { [dominant.id]: 65, [secondary.id]: 35 }
      });

      // Se o usuário já possui diagnóstico gravado, exibe direto a tela de resultado
      setStage(prev => (prev === 'intro' ? 'result' : prev));
    }
  }, [user?.parentalArchetype, user?.parentalSecondaryArchetype, user?.id, user?.email]);

  const handleStart = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setStage('preliminary-status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStatus = (status: ParentalStatus) => {
    setParentalStatus(status);
    try {
      localStorage.setItem('elana_quiz_parental_status', status);
    } catch {}

    if (status === 'sim') {
      setStage('preliminary-ages');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedAgeBrackets([]);
      try {
        localStorage.setItem('elana_quiz_child_ages', JSON.stringify([]));
      } catch {}
      setStage('questions');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleAgeBracket = (bracket: ChildAgeBracket) => {
    setSelectedAgeBrackets(prev => {
      const exists = prev.includes(bracket);
      const next = exists ? prev.filter(b => b !== bracket) : [...prev, bracket];
      try {
        localStorage.setItem('elana_quiz_child_ages', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleContinueFromAges = () => {
    if (selectedAgeBrackets.length === 0) return;
    setStage('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optionIndex: number) => {
    const updated = {
      ...selectedAnswers,
      [currentQuestionIdx]: optionIndex
    };
    setSelectedAnswers(updated);

    // Auto-avanço fluido com 220ms de delay
    setTimeout(() => {
      if (currentQuestionIdx < PARENTAL_QUESTIONS.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        finishQuiz(updated);
      }
    }, 220);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Se estava na primeira pergunta de superpoder, retorna à etapa preliminar correspondente
      if (parentalStatus === 'sim') {
        setStage('preliminary-ages');
      } else {
        setStage('preliminary-status');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const finishQuiz = (finalAnswers: Record<number, number>) => {
    setStage('calculating');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Efeito de micro-passos durante o cálculo para engajamento
    setTimeout(() => setCalculatingStepText('Mapeando suas reações mais profundas...'), 500);
    setTimeout(() => setCalculatingStepText('Identificando sua grande força parental...'), 1100);

    setTimeout(async () => {
      const result = calculateParentalQuizResult(finalAnswers);
      setCalculationResult(result);
      setStage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Dispara celebração
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback silencioso
      }

      // Salva backup local imediatamente (garante persistência mesmo se Supabase oscilar)
      const superpoderBackup = {
        dominantId: result.dominant.id,
        secondaryId: result.secondary.id,
        timestamp: new Date().toISOString()
      };
      try {
        if (user?.id) {
          localStorage.setItem(`elana_superpoder_${user.id}`, JSON.stringify(superpoderBackup));
        }
        if (user?.email) {
          localStorage.setItem(`elana_superpoder_${user.email.toLowerCase().trim()}`, JSON.stringify(superpoderBackup));
        }
        localStorage.setItem('elana_guest_superpoder', JSON.stringify(superpoderBackup));
      } catch {}

      // Se o usuário está logado, persiste e premia
      if (user) {
        await updateUser({
          parentalArchetype: result.dominant.id,
          parentalSecondaryArchetype: result.secondary.id,
          parentalQuizCompletedAt: new Date().toISOString()
        });

        // Concede badge de Superpoder Parental (+75 pontos)
        if (!user.badges?.some(b => b.id === 'b_superpoder')) {
          await awardBadge('b_superpoder');
        }
      }
    }, 1800);
  };

  const handleShare = async () => {
    const dominantName = calculationResult?.dominant.name || 'Meu Superpoder';
    const text = `Acabei de descobrir meu Superpoder Parental na Elana: ${dominantName}! Descubra qual é a sua força na criação também:`;
    const url = window.location.origin + '?tab=quiz';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Superpoder Parental — Elana Academy',
          text,
          url
        });
        return;
      } catch {
        // fallback para cópia
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // ignore
    }
  };

  const getArchetypeIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sun': return <Sun className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Smile': return <Smile className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Wand2': return <Wand2 className={className} />;
      case 'Crown': return <Crown className={className} />;
      default: return <Zap className={className} />;
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. TELA DE INTRODUÇÃO
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in duration-300">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18272B] to-[#101B1E] border border-white/10 p-6 sm:p-10 text-center shadow-2xl space-y-6">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF7F5B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FFD166]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge Topo */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7F5B]/10 border border-[#FF7F5B]/30 text-[#FF7F5B] text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Diagnóstico Exclusivo Elana</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Qual é o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] via-[#FF7F5B] to-[#E66795]">Superpoder Parental?</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Toda mãe e todo pai têm uma força secreta na criação dos filhos. Responda a 15 perguntas reflexivas sobre a rotina real da sua casa e receba seu dossiê completo de autoconhecimento.
          </p>

          {/* Benefícios em cards sutis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-base">⏱️</span>
              <h4 className="text-xs font-black text-white">Rápido e Fluido</h4>
              <p className="text-[11px] text-slate-400">Apenas 3 minutos, com respostas diretas e instintivas.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-base">🛡️</span>
              <h4 className="text-xs font-black text-white">Sem Julgamento</h4>
              <p className="text-[11px] text-slate-400">Não existe resposta certa ou errada: existe o seu jeito único.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-base">🎁</span>
              <h4 className="text-xs font-black text-white">+75 pontos no Perfil</h4>
              <p className="text-[11px] text-slate-400">Desbloqueia a badge oficial e a jornada recomendada.</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7F5B] to-[#e06847] hover:from-[#ff8b6b] hover:to-[#eb7555] text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-[#FF7F5B]/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>{user?.parentalArchetype ? 'Refazer Meu Diagnóstico' : 'Descobrir Meu Superpoder'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {user?.parentalArchetype && calculationResult && (
              <button
                onClick={() => setStage('result')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ver Meu Resultado Atual
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. ETAPA PRELIMINAR 1: VOCÊ TEM FILHOS?
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'preliminary-status') {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in duration-300">
        <button
          onClick={() => setStage('intro')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18272B] to-[#101B1E] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7F5B]/10 border border-[#FF7F5B]/30 text-[#FF7F5B] text-xs font-extrabold uppercase tracking-wider">
              <span>Etapa 1 de 2 • Contexto Familiar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              1. Você tem filhos?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Isso nos ajuda a personalizar as recomendações práticas de acordo com o momento da sua casa.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'sim' as ParentalStatus,
                emoji: '👶',
                title: 'Sim, já tenho filhos',
                desc: 'Tenho uma ou mais crianças ou adolescentes em casa'
              },
              {
                id: 'gestante' as ParentalStatus,
                emoji: '🤰',
                title: 'Estou grávida ou esperando a chegada de um bebê',
                desc: 'Me preparando para a chegada, puerpério e os primeiros meses'
              },
              {
                id: 'nao' as ParentalStatus,
                emoji: '🌱',
                title: 'Ainda não tenho filhos',
                desc: 'Quero descobrir meu estilo de cuidado e autoconhecimento'
              }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectStatus(item.id)}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  parentalStatus === item.id
                    ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] shadow-lg shadow-[#FF7F5B]/10'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl sm:text-3xl shrink-0">{item.emoji}</span>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white group-hover:text-[#FFD166] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${
                  parentalStatus === item.id ? 'text-[#FF7F5B] translate-x-1' : 'text-slate-500 group-hover:text-white'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. ETAPA PRELIMINAR 2: IDADE DOS FILHOS (MÚLTIPLA SELEÇÃO)
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'preliminary-ages') {
    return (
      <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in duration-300">
        <button
          onClick={() => setStage('preliminary-status')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18272B] to-[#101B1E] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7F5B]/10 border border-[#FF7F5B]/30 text-[#FF7F5B] text-xs font-extrabold uppercase tracking-wider">
              <span>Etapa 2 de 2 • Idade dos Filhos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              2. Qual a idade deles?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Você pode marcar mais de uma alternativa se tiver mais de um filho:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHILD_AGE_OPTIONS.map(opt => {
              const isChecked = selectedAgeBrackets.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggleAgeBracket(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3 group ${
                    isChecked
                      ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-[#FF7F5B] border-[#FF7F5B] text-slate-950'
                      : 'border-slate-500 group-hover:border-slate-300'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-white group-hover:text-[#FFD166] transition-colors block">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-[11px] text-slate-400 block leading-tight">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStage('preliminary-status')}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Alterar pergunta anterior
            </button>

            <button
              type="button"
              onClick={handleContinueFromAges}
              disabled={selectedAgeBrackets.length === 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer ${
                selectedAgeBrackets.length > 0
                  ? 'bg-gradient-to-r from-[#FF7F5B] to-[#e06847] hover:from-[#ff8b6b] hover:to-[#eb7555] text-white shadow-[#FF7F5B]/30 active:scale-95'
                  : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>Ir para as Perguntas do Superpoder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. TELA DE CÁLCULO / INTERSTITIAL
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'calculating') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto animate-in fade-in">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#FF7F5B] animate-spin" />
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD166] to-[#FF7F5B] flex items-center justify-center text-slate-950 shadow-lg animate-pulse">
            <Zap className="w-6 h-6 fill-current" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight">
            Analisando seus instintos...
          </h3>
          <p className="text-xs text-[#FFD166] font-bold tracking-wide uppercase transition-all">
            {calculatingStepText}
          </p>
        </div>

        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Cruzando suas escolhas com os 12 arquétipos para revelar seu Superpoder Parental.
        </p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. TELA DE QUESTIONÁRIO
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'questions') {
    const q = PARENTAL_QUESTIONS[currentQuestionIdx];
    const progressPct = Math.round(((currentQuestionIdx + 1) / PARENTAL_QUESTIONS.length) * 100);
    const selectedOpt = selectedAnswers[currentQuestionIdx];

    return (
      <div className="max-w-2xl mx-auto py-6 px-4 animate-in fade-in duration-200">
        {/* Barra Superior com Voltar e Progresso */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={currentQuestionIdx === 0 ? () => setStage('intro') : handlePrevQuestion}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-2.5 -ml-2 rounded-xl min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <span className="text-xs font-extrabold text-[#FF7F5B] tracking-wider uppercase">
            Pergunta {currentQuestionIdx + 1} de {PARENTAL_QUESTIONS.length}
          </span>
        </div>

        {/* Linha de Progresso com Gradiente */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#FFD166] via-[#FF7F5B] to-[#E66795] transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Card da Pergunta */}
        <div className="rounded-3xl bg-[#101B1E]/95 border border-white/10 p-5 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
            {q.question}
          </h2>

          {/* Lista de Opções */}
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              return (
                <button
                  key={opt.letter}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer group active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] text-white shadow-lg shadow-[#FF7F5B]/10'
                      : 'bg-white/5 hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#FF7F5B] text-white'
                        : 'bg-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/15'
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 italic text-center pt-2">
            Escolha a reação que surge mais espontaneamente em você.
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. TELA DE RESULTADO (DOSSIÊ COMPLETO)
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'result' && calculationResult) {
    const { dominant, secondary, dominantPercentage, secondaryPercentage } = calculationResult;

    return (
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-in fade-in duration-300">
        {/* Topo com botão voltar e badge de XP */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Conteúdos</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Diagnóstico Concluído (+75 pontos)</span>
          </div>
        </div>

        {/* 🌟 CARDS DOS SUPERPODERES: DOMINANTE E SECUNDÁRIO COM O MESMO PESO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* ⚡ CARD DO SUPERPODER DOMINANTE */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18272B] via-[#101B1E] to-[#1a1310] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5 flex flex-col justify-between hover:border-[#FFD166]/40 transition-all">
            {/* Glows coloridos de fundo */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: dominant.themeColor }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                {/* Ícone Redondo */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl shrink-0"
                  style={{ backgroundColor: dominant.themeColor }}
                >
                  {getArchetypeIcon(dominant.iconName, 'w-7 h-7 sm:w-8 sm:h-8 text-slate-950 stroke-[2.5]')}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FFD166]">
                    SEU PODER DOMINANTE ({dominantPercentage}%)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {dominant.name}
                  </h2>
                </div>
              </div>

              {/* Mantra em Destaque */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs sm:text-sm font-semibold text-slate-200">
                "{dominant.mantra}"
              </div>

              {/* Sinopse Curta */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {dominant.shortSynopsis}
              </p>
            </div>
          </div>

          {/* ✨ CARD DO SUPERPODER SECUNDÁRIO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18272B] via-[#101B1E] to-[#1a1310] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5 flex flex-col justify-between hover:border-[#FF7F5B]/40 transition-all">
            {/* Glows coloridos de fundo */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: secondary.themeColor }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                {/* Ícone Redondo */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl shrink-0"
                  style={{ backgroundColor: secondary.themeColor }}
                >
                  {getArchetypeIcon(secondary.iconName, 'w-7 h-7 sm:w-8 sm:h-8 text-slate-950 stroke-[2.5]')}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FF7F5B]">
                    SEU PODER SECUNDÁRIO ({secondaryPercentage}%)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {secondary.name}
                  </h2>
                </div>
              </div>

              {/* Mantra em Destaque */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs sm:text-sm font-semibold text-slate-200">
                "{secondary.mantra}"
              </div>

              {/* Sinopse Curta */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {secondary.shortSynopsis}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Compartilhamento */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar Meus Superpoderes'}</span>
          </button>
        </div>

        {/* 📑 DOSSIÊ DETALHADO: ABAS (Luz, Sombra, Dicas Práticas) */}
        <div className="rounded-3xl bg-[#101B1E] border border-white/10 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Dossiê do seu Jeito de Educar
            </h3>

            {/* Abas */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTabDossie('luz')}
                className={`flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  activeTabDossie === 'luz' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sua Luz
              </button>
              <button
                onClick={() => setActiveTabDossie('sombra')}
                className={`flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  activeTabDossie === 'sombra' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ponto de Atenção
              </button>
              <button
                onClick={() => setActiveTabDossie('dicas')}
                className={`flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  activeTabDossie === 'dicas' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dicas Práticas
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          {activeTabDossie === 'luz' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Força Dominante */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-[#FFD166]/20 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-black text-[#FFD166]">
                  <Sparkles className="w-4 h-4" />
                  <span>Sua Força no Poder Dominante: {dominant.name}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {dominant.greatStrength || dominant.essence}
                </p>
              </div>

              {/* Força Secundária */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-[#FF7F5B]/20 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-black text-[#FF7F5B]">
                  <Sparkles className="w-4 h-4" />
                  <span>Sua Força no Poder Secundário: {secondary.name}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {secondary.greatStrength || secondary.essence}
                </p>
              </div>
            </div>
          )}

          {activeTabDossie === 'sombra' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Ponto de Atenção Dominante */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-rose-500/20 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-black text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ponto de Atenção: {dominant.name} (Poder Dominante)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {dominant.blindSpot || 'Lembre-se de cuidar de você para não se sobrecarregar nas decisões familiares.'}
                </p>
              </div>

              {/* Ponto de Atenção Secundário */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-rose-500/20 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-black text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ponto de Atenção: {secondary.name} (Poder Secundário)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                  {secondary.blindSpot || 'Mantenha a atenção equilibrada para não sobrecarregar as rotinas da casa.'}
                </p>
              </div>
            </div>
          )}

          {activeTabDossie === 'dicas' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Dicas do Dominante */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-black text-[#FFD166]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Exercícios Práticos para o Poder Dominante: {dominant.name}</span>
                </div>
                <div className="space-y-3">
                  {dominant.practicalTips?.map((tip, i) => {
                    const colonIdx = tip.indexOf(':');
                    const hasColon = colonIdx > 0 && colonIdx < 60;
                    const title = hasColon ? tip.slice(0, colonIdx).replace(/["'“”]/g, '').trim() : null;
                    const desc = hasColon ? tip.slice(colonIdx + 1).trim() : tip;
                    return (
                      <div key={`dom-${i}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                        {title ? (
                          <>
                            <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                              {title}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-4">
                              {desc}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {tip}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dicas do Secundário */}
              {secondary.practicalTips && secondary.practicalTips.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-[#FF7F5B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exercícios Práticos para o Poder Secundário: {secondary.name}</span>
                  </div>
                  <div className="space-y-3">
                    {secondary.practicalTips?.map((tip, i) => {
                      const colonIdx = tip.indexOf(':');
                      const hasColon = colonIdx > 0 && colonIdx < 60;
                      const title = hasColon ? tip.slice(0, colonIdx).replace(/["'“”]/g, '').trim() : null;
                      const desc = hasColon ? tip.slice(colonIdx + 1).trim() : tip;
                      return (
                        <div key={`sec-${i}`} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                          {title ? (
                            <>
                              <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                {title}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-4">
                                {desc}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {tip}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 📚 JORNADA RECOMENDADA BASEADA NA IDADE DOS FILHOS */}
        {(() => {
          const rec = getRecommendedJourneyByAge(parentalStatus, selectedAgeBrackets);
          if (!rec) return null;
          return (
            <div className="rounded-3xl bg-gradient-to-r from-[#18272B] to-[#101B1E] border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FF7F5B]">
                  Jornada Recomendada para o Momento da Sua Família
                </span>
                <span className="text-xs font-bold text-slate-400">Recomendação por Idade</span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-black text-white">
                  {rec.journeyTitle}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              <button
                onClick={() => {
                  if (onSelectJourney) {
                    onSelectJourney(rec.journeyId);
                  } else {
                    onBackToHome();
                  }
                }}
                className="inline-flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#FF7F5B]/20"
              >
                <span>Assistir {rec.journeyTitle}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}

        {/* VISITANTE CTA: SE NÃO ESTIVER LOGADO */}
        {!user && onOpenAuthModal && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FF7F5B]/15 via-[#FFD166]/10 to-transparent border border-[#FF7F5B]/30 text-center space-y-4">
            <h4 className="text-lg font-black text-white">
              Gostou de descobrir seu Superpoder?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Crie uma conta gratuita na Elana para salvar seu dossiê completo, acompanhar as aulas recomendadas e receber suporte da nossa comunidade.
            </p>
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-2xl shadow-xl shadow-[#FF7F5B]/30 transition-all cursor-pointer active:scale-95"
            >
              <span>Criar Conta e Salvar Meu Dossiê</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Botão Inferior de Retorno */}
        <div className="text-center pt-2">
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider font-bold">REFAZER</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

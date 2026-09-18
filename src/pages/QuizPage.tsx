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
  QuizCalculationResult
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

  // Estados do fluxo: 'intro' | 'questions' | 'calculating' | 'result'
  const [stage, setStage] = useState<'intro' | 'questions' | 'calculating' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [calculationResult, setCalculationResult] = useState<QuizCalculationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [calculatingStepText, setCalculatingStepText] = useState('Cruzando seus instintos...');
  const [activeTabDossie, setActiveTabDossie] = useState<'luz' | 'sombra' | 'dicas'>('luz');

  // Recupera resultado anterior se já existir
  useEffect(() => {
    if (user?.parentalArchetype && PARENTAL_ARCHETYPES[user.parentalArchetype]) {
      const dominant = PARENTAL_ARCHETYPES[user.parentalArchetype];
      const secondary = user.parentalSecondaryArchetype && PARENTAL_ARCHETYPES[user.parentalSecondaryArchetype]
        ? PARENTAL_ARCHETYPES[user.parentalSecondaryArchetype]
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
    }
  }, [user?.parentalArchetype, user?.parentalSecondaryArchetype]);

  const handleStart = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
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
    }
  };

  const finishQuiz = (finalAnswers: Record<number, number>) => {
    setStage('calculating');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Efeito de micro-passos durante o cálculo para engajamento
    setTimeout(() => setCalculatingStepText('Mapeando suas reações mais profundas...'), 500);
    setTimeout(() => setCalculatingStepText('Identificando sua grande força parental...'), 1100);

    setTimeout(() => {
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

      // Se o usuário está logado, persiste e premia
      if (user) {
        updateUser({
          parentalArchetype: result.dominant.id,
          parentalSecondaryArchetype: result.secondary.id,
          parentalQuizCompletedAt: new Date().toISOString()
        });

        // Concede badge de Superpoder Parental (+75 pontos)
        if (!user.badges?.some(b => b.id === 'b_superpoder')) {
          awardBadge('b_superpoder');
        }
      } else {
        // Se visitante, salva temporariamente no storage para hidratar caso crie conta
        try {
          localStorage.setItem('elana_guest_superpoder', JSON.stringify({
            dominantId: result.dominant.id,
            secondaryId: result.secondary.id,
            timestamp: new Date().toISOString()
          }));
        } catch {
          // ignore
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
  // 2. TELA DE CÁLCULO / INTERSTITIAL
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
          Cruzando suas escolhas com os 12 arquétipos para revelar sua maior força e sua trilha ideal.
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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
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

        {/* 🌟 CARD PRINCIPAL DO ARQUÉTIPO DOMINANTE */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18272B] via-[#101B1E] to-[#1a1310] border border-white/15 p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Glows coloridos de fundo de acordo com a cor do arquétipo */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: dominant.themeColor }}
          />

          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Ícone Redondo com Glow */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-slate-950 shadow-2xl shrink-0"
                style={{ backgroundColor: dominant.themeColor }}
              >
                {getArchetypeIcon(dominant.iconName, 'w-8 h-8 sm:w-10 sm:h-10 text-slate-950 stroke-[2.5]')}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FFD166]">
                  SEU SUPERPODER DOMINANTE ({dominantPercentage}%)
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {dominant.name}
                </h1>
                <p className="text-xs text-slate-400 font-semibold">
                  Arquétipo Clássico: {dominant.baseArchetype}
                </p>
              </div>
            </div>

            {/* Mantra em Destaque */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs sm:text-sm font-semibold text-slate-200">
              "{dominant.mantra}"
            </div>

            {/* Sinopse Curta Magnética */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {dominant.shortSynopsis}
            </p>
          </div>

          {/* ARQUÉTIPO SECUNDÁRIO / FORÇA DE APOIO */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 shrink-0"
                style={{ backgroundColor: secondary.themeColor }}
              >
                {getArchetypeIcon(secondary.iconName, 'w-5 h-5 text-slate-950')}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Força de Apoio Secundária ({secondaryPercentage}%)
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {secondary.name} ({secondary.baseArchetype})
                </span>
              </div>
            </div>

            {/* Botão Compartilhar */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar Resultado'}</span>
            </button>
          </div>
        </div>

        {/* 📑 DOSSIÊ DETALHADO: ABAS (Luz, Sombra, Dicas Práticas) */}
        <div className="rounded-3xl bg-[#101B1E] border border-white/10 p-5 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Dossiê do seu Jeito de Educar
            </h3>

            {/* Abas */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTabDossie('luz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabDossie === 'luz' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sua Luz
              </button>
              <button
                onClick={() => setActiveTabDossie('sombra')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabDossie === 'sombra' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ponto de Atenção
              </button>
              <button
                onClick={() => setActiveTabDossie('dicas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabDossie === 'dicas' ? 'bg-[#FF7F5B] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dicas Práticas
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          {activeTabDossie === 'luz' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Sua Grande Força como Mãe ou Pai</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {dominant.greatStrength || dominant.essence}
              </p>
            </div>
          )}

          {activeTabDossie === 'sombra' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>Onde Ter Cuidado no Dia a Dia</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {dominant.blindSpot || 'Lembre-se de cuidar de você para não se sobrecarregar nas decisões familiares.'}
              </p>
            </div>
          )}

          {activeTabDossie === 'dicas' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Exercícios Práticos para a Semana</span>
              </div>
              <ul className="space-y-2.5">
                {dominant.practicalTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <span className="text-[#FF7F5B] font-black text-sm shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 📚 JORNADA ELANA RECOMENDADA */}
        <div className="rounded-3xl bg-gradient-to-r from-[#18272B] to-[#101B1E] border border-white/10 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#FF7F5B]">
              Trilha Recomendada para o seu Superpoder
            </span>
            <span className="text-xs font-bold text-slate-400">Jornada Indicada</span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-black text-white">
              {dominant.recommendedJourneyTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dominant.recommendedJourneyReason}
            </p>
          </div>

          <button
            onClick={() => {
              if (onSelectJourney) {
                onSelectJourney(dominant.recommendedJourneyId);
              } else {
                onBackToHome();
              }
            }}
            className="inline-flex items-center gap-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#FF7F5B]/20"
          >
            <span>Ver Aulas da Jornada</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

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
            <span>Refazer Diagnóstico</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

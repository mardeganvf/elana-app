import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Heart } from 'lucide-react';

interface GuidedSpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface StepItem {
  targetSelector?: string;
  badge?: string;
  titleLines?: string[];
  messageLines: string[];
  tip?: string;
  tipCenter?: boolean;
}

export const GuidedSpotlightTour: React.FC<GuidedSpotlightTourProps> = ({ isOpen, onClose, onComplete }) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const firstName = user?.name.split(' ')[0] || 'Helena';

  const steps: StepItem[] = [
    {
      titleLines: [
        `Oi, ${firstName}. Que bom que você chegou! 💖`
      ],
      messageLines: [
        'Nós criamos esse espaço com todo carinho para você. Então deixa eu te apresentar cada cantinho, assim você já vai se sentindo em casa.'
      ]
    },
    {
      targetSelector: '[data-tour="profile-avatar"]',
      badge: 'Seu Perfil',
      titleLines: ['Um cantinho todinho sobre você!'],
      messageLines: [
        'Aqui você conta sua história, monta o álbum da sua família, acessa sua evolução, conquistas, depoimentos e muito mais.'
      ],
      tip: 'Clique na foto sempre que quiser ver o quanto já caminhou.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="contents-nav"]',
      badge: 'Suas Jornadas',
      titleLines: ['Aqui o cuidado começa por quem cuida.'],
      messageLines: [
        'Conteúdos curtinhos sobre o desenvolvimento infantil, adolescência, autocuidado, vida a dois e muito mais. Tudo pensado pra caber na sua rotina real, e não o contrário.'
      ],
      tip: 'Assista ou ouça quando der. Sem cobrança e sem culpa.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="community-nav"]',
      badge: 'Sua Rede de Apoio',
      titleLines: ['Um espaço seguro de escuta e troca.'],
      messageLines: [
        'Compartilhe suas dúvidas, celebre suas conquistas, desabafe e troque experiências com quem está vivendo o mesmo que você. Escolha o que combina com o seu dia.'
      ],
      tip: 'Nossa comunidade tá sempre aberta pra te acolher.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="profile-nav"]',
      badge: 'Suas Conquistas',
      titleLines: ['Cada gesto de cuidado faz sua árvore crescer.'],
      messageLines: [
        'Assistir conteúdos, concluir jornadas, responder alguém com carinho, aparecer nos dias difíceis, compartilhar suas dúvidas e experiências. Tudo isso vai liberando novas conquistas.'
      ],
      tip: 'Não é sobre ser o melhor. É sobre se desenvolver e contribuir.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="emotions-button"]',
      badge: 'Suas Emoções',
      titleLines: ['E hoje, como está se sentindo?'],
      messageLines: [
        'Todo dia você pode fazer uma pausa rápida e registrar como se sente. Reconhecer suas emoções e cuidar de você é parte de cuidar de quem você ama.'
      ],
      tip: 'Pequenos registros, grandes descobertas sobre você.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="sos-button"]',
      badge: 'Atenção e Empatia',
      titleLines: ['Quando o dia pesa demais.'],
      messageLines: [
        'Tem dia que dói mais do que dá pra postar, que pesa mais do que a gente acha que pode aguentar. O SOS te conecta com a nossa equipe, num espaço só seu.'
      ],
      tip: 'Pedir ajuda também é um ato de coragem.',
      tipCenter: true
    },
    {
      targetSelector: '[data-tour="privacy-note"]',
      badge: 'Seu espaço seguro',
      titleLines: ['Sua intimidade protegida.'],
      messageLines: [
        'Tudo que você compartilha — desabafos, check-ins, conversas — fica guardado com segurança. A gente leva isso tão a sério quanto você leva o cuidado com sua família.'
      ],
      tip: 'A gente cuida da sua história.',
      tipCenter: true
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const step = steps[currentStep];
      if (!step || !step.targetSelector) {
        setTargetRect(null);
        return;
      }

      const element = document.querySelector(step.targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStep]);

  if (!isOpen || !user) return null;

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem(`elana_spotlight_done_${user.email.toLowerCase().trim()}`, 'true');
      if (updateUser) {
        updateUser({ onboardingCompleted: true });
      }
      onClose();
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-auto select-none overflow-hidden">
      
      {/* Full Backdrop if no target selected (Step 0) */}
      {!targetRect && (
        <div className="absolute inset-0 bg-[#03070A]/85 backdrop-blur-md transition-all duration-300" />
      )}

      {/* Target Glowing Spotlight Box over the avatar or element */}
      {targetRect && (
        <div
          className="absolute z-[1000000] border-2 border-[#FF7F5B] rounded-full transition-all duration-300 pointer-events-none"
          style={{
            top: `${Math.max(8, targetRect.top - 4)}px`,
            left: `${Math.max(8, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(3, 7, 10, 0.82), 0 0 30px rgba(255, 127, 91, 0.9)'
          }}
        />
      )}

      {/* Floating Card (Strict 100% Flush Left Vertical Alignment) */}
      <div 
        className="fixed z-[1000001] w-full max-w-md bg-[#101B1E] border border-[#FF7F5B]/40 rounded-3xl p-6 shadow-2xl text-white space-y-4 transition-all duration-300 text-left"
        style={{
          top: targetRect ? `${Math.min(window.innerHeight - 300, Math.max(90, targetRect.bottom + 20))}px` : '50%',
          left: targetRect ? `${Math.min(window.innerWidth - 450, Math.max(20, targetRect.left))}px` : '50%',
          transform: targetRect ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        
        {/* Top Header Icon (No Close Button) */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/50 flex items-center justify-center text-[#FF7F5B]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            {current.badge && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full border border-white/10">
                {current.badge}
              </span>
            )}
          </div>
        </div>

        {/* Content Box (Title AND Message inside the exact same container with matching left padding) */}
        <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 space-y-3 text-left w-full">
          
          {/* Title - Flush with message left margin */}
          <div className="space-y-1 text-left">
            {current.titleLines?.map((line, idx) => (
              <h3 key={idx} className="text-lg sm:text-xl font-black text-white leading-tight text-left m-0 p-0" style={{ fontFamily: 'var(--font-heading)' }}>
                {line}
              </h3>
            ))}
          </div>

          {/* Message Lines - Flush with title left margin */}
          <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-normal text-left pt-1 border-t border-white/5">
            {current.messageLines.map((line, idx) => (
              <p key={idx} className="text-left m-0 p-0">
                {line}
              </p>
            ))}
          </div>

        </div>

        {/* Optional Tip (Centered if tipCenter is true) */}
        {current.tip && (
          <div className={`flex items-center gap-2 text-xs font-semibold text-[#FFD166] ${current.tipCenter ? 'justify-center text-center' : 'text-left'}`}>
            <Heart className="w-3.5 h-3.5 text-[#E66795] fill-current shrink-0" />
            <span>{current.tip}</span>
          </div>
        )}

        {/* Footer with Discrete Step Counter at the Bottom */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 w-full">
          
          {/* Discrete Step Counter at Bottom */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {currentStep + 1} de {steps.length}
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="text-slate-400 hover:text-white font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#E66795] to-[#FF7F5B] hover:opacity-95 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <span>{currentStep === steps.length - 1 ? 'Concluir 🎉' : 'Próximo'}</span>
              {currentStep === steps.length - 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

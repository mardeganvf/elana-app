import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Film, 
  MessageSquare, 
  LifeBuoy, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  Heart,
  X
} from 'lucide-react';
import logoElana from '../../assets/logo-elana.png';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({ isOpen, onClose }) => {
  const { user, addXP } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || !user) return null;

  const steps = [
    {
      icon: <Sparkles className="w-8 h-8 text-[#FFD166]" />,
      badge: '🌱 Semente Plantada',
      title: `Boas-vindas à Elana, ${user.name.split(' ')[0]}! 💖`,
      subtitle: 'Que alegria ter você com a gente nessa caminhada.',
      description: 'Maternidade e paternidade não precisam ser solitárias. Aqui você ganha oxigênio, acolhimento e conhecimento sem julgamentos.',
      highlight: '🎁 Você acabou de ganhar +25 XP e sua 1ª Conquista: "Semente Plantada"!',
      color: 'from-[#E66795]/20 to-[#FF7F5B]/20',
      borderColor: 'border-[#E66795]/40'
    },
    {
      icon: <Film className="w-8 h-8 text-[#FF7F5B]" />,
      badge: '📚 Conteúdos & Trilhas',
      title: 'Aulas Leves com Especialistas',
      subtitle: 'Direto ao ponto, no ritmo da sua rotina.',
      description: 'Explore nossas 6 Trilhas Guiadas sobre sono, autocuidado, fases do bebê e relacionamento. Aulas curtas em vídeo feitas para assistir até com o bebê no colo!',
      highlight: '💡 Assista aos módulos e acumule pontos (XP) para subir de nível!',
      color: 'from-[#FF7F5B]/20 to-[#FFD166]/20',
      borderColor: 'border-[#FF7F5B]/40'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-[#8A9A5B]" />,
      badge: '💬 Comunidade Acolhedora',
      title: 'Cantinho da Mel & Rodas de Conversa',
      subtitle: 'Um espaço seguro para desabafar e celebrar.',
      description: 'Nossa comunidade tem salas divididas por idade e temas. Enquetes gostosas, respostas das nossas especialistas e trocas reais com pais que entendem o que você sente.',
      highlight: '🤗 Você pode postar com seu nome ou anonimamente quando quiser mais privacidade.',
      color: 'from-[#8A9A5B]/20 to-[#003B46]/20',
      borderColor: 'border-[#8A9A5B]/40'
    },
    {
      icon: <LifeBuoy className="w-8 h-8 text-rose-400" />,
      badge: '🛟 Canal SOS Privado',
      title: 'Precisa Desabafar no Privado?',
      subtitle: 'Nossa equipe de apoio ao seu lado.',
      description: 'No botão "SOS" no topo da página, você envia mensagens 100% confidenciais direto para nossa equipe de acolhimento sem ninguém da comunidade ver.',
      highlight: '🔒 Espaço privado e prioritário para dias mais desafiadores.',
      color: 'from-rose-500/20 to-[#E66795]/20',
      borderColor: 'border-rose-500/40'
    },
    {
      icon: <Moon className="w-8 h-8 text-[#FFD166]" />,
      badge: '🌙 Cuidado Noturno & Acessibilidade',
      title: 'Modo Madrugada & Leitura Confortável',
      subtitle: 'Pensado para o acolhimento nas madrugadas.',
      description: 'Ative o Modo Madrugada no topo para reduzir a luz azul da tela sem despertar o bebê nas mamadas da noite. Você também pode aumentar ou diminuir o tamanho dos textos nos botões A- A A+.',
      highlight: '🌙 A luz certa para você e seu bebê descansarem tranquilos.',
      color: 'from-[#FFD166]/20 to-[#070D0F]',
      borderColor: 'border-[#FFD166]/40'
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finish Tour: Award +50 XP bonus!
      addXP(50);
      localStorage.setItem(`elana_onboarding_done_${user.email}`, 'true');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        
        {/* Top Gradient Decorative Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FFD166]" />

        {/* Close / Skip Button */}
        <button
          onClick={() => {
            localStorage.setItem(`elana_onboarding_done_${user.email}`, 'true');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          title="Pular Tutorial"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between pt-2">
          <img src={logoElana} alt="Elana" className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold text-slate-300">
            <span>Passo {currentStep + 1} de {steps.length}</span>
          </div>
        </div>

        {/* Step Content Card */}
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${current.color} border ${current.borderColor} space-y-4 transition-all duration-300`}>
          
          <div className="flex items-center justify-between">
            <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
              {current.icon}
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/10 text-white px-3 py-1 rounded-full border border-white/15">
              {current.badge}
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {current.title}
            </h3>
            <p className="text-xs font-bold text-[#FF7F5B]">
              {current.subtitle}
            </p>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {current.description}
          </p>

          <div className="p-3 bg-black/50 rounded-xl border border-white/10 text-xs font-semibold text-[#FFD166] flex items-center gap-2">
            <Heart className="w-4 h-4 shrink-0 fill-current text-[#E66795]" />
            <span>{current.highlight}</span>
          </div>

        </div>

        {/* Navigation Dots & Next Button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          
          {/* Dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#FF7F5B]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-[#E66795] to-[#FF7F5B] hover:opacity-95 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            <span>{currentStep === steps.length - 1 ? 'Concluir & Ganhar +50 XP 🎉' : 'Próximo'}</span>
            {currentStep === steps.length - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const BreathingModal: React.FC<BreathingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Reset do cronômetro sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(60);
    }
  }, [isOpen]);

  // Contagem regressiva de 60 segundos
  useEffect(() => {
    if (!isOpen) return;

    if (secondsRemaining <= 0) {
      onComplete?.();
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining, onComplete, onClose]);

  if (!isOpen) return null;

  // Derivação matemática exata da fase e do ciclo a partir do tempo decorrido
  // Elapsed vai de 0 (aos 60s) até 60 (aos 0s)
  const elapsed = 60 - secondsRemaining;
  // Cada ciclo completo dura 12s: 4s Inspire -> 4s Segure -> 4s Expire
  const cycleCount = Math.min(4, Math.floor(elapsed / 12));
  const secondInCycle = elapsed % 12;

  let phase: 'inspire' | 'segure' | 'expire' = 'inspire';
  if (secondInCycle >= 4 && secondInCycle < 8) {
    phase = 'segure';
  } else if (secondInCycle >= 8) {
    phase = 'expire';
  }

  // Formatação MM:SS (01:00, 00:59, etc.)
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-center relative text-white space-y-6 m-auto max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          aria-label="Fechar Respiro"
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
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

        {/* Animated Breathing Circle */}
        <div className="py-6 flex flex-col items-center justify-center space-y-5">
          <div className="relative flex items-center justify-center w-52 h-52">
            {/* Halo / Aura suave no fundo */}
            <div
              key={`aura-${cycleCount}-${phase}`}
              className={`absolute w-44 h-44 rounded-full pointer-events-none blur-xl ${
                phase === 'inspire'
                  ? 'animate-aura-in bg-[#FF7F5B]/30'
                  : phase === 'segure'
                  ? 'animate-aura-hold bg-[#FFD166]/30'
                  : 'animate-aura-out bg-[#8A9A5B]/20'
              }`}
            />

            {/* Bolinha principal que começa vazia e vai enchendo suavemente enquanto a pessoa inspira */}
            <div 
              key={`circle-${cycleCount}-${phase}`}
              className={`w-40 h-40 rounded-full border-4 flex items-center justify-center shadow-lg select-none ${
                phase === 'inspire'
                  ? 'animate-breathe-in'
                  : phase === 'segure'
                  ? 'animate-breathe-hold'
                  : 'animate-breathe-out'
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center px-3">
                <span className="text-base sm:text-lg font-black uppercase text-white tracking-wider">
                  {phase === 'inspire' && '🌊 Inspire...'}
                  {phase === 'segure' && '🧘 Segure...'}
                  {phase === 'expire' && '🍃 Expire...'}
                </span>
                <span className="text-[11px] font-medium text-white/80 mt-1">
                  {phase === 'inspire' && 'Puxe o ar suavemente'}
                  {phase === 'segure' && 'Mantenha nos pulmões'}
                  {phase === 'expire' && 'Solte o ar devagar'}
                </span>
              </div>
            </div>
          </div>

          {/* Cronômetro e Ciclos */}
          <div className="space-y-2">
            <div className="font-mono text-2xl font-bold text-[#FFD166] tracking-wider">
              {timeFormatted}
            </div>

            {/* Indicador visual de 5 ciclos de 12s */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[0, 1, 2, 3, 4].map(idx => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx < cycleCount
                      ? 'w-6 bg-[#8A9A5B]'
                      : idx === cycleCount
                      ? 'w-6 bg-[#FF7F5B]'
                      : 'w-2 bg-white/10'
                  }`}
                  title={`Ciclo ${idx + 1} de 5`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          Concluir Respiro
        </button>

      </div>
    </div>,
    document.body
  );
};

import React from 'react';
import { Badge } from '../../types';
import { X } from 'lucide-react';

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const renderBadgeIcon = () => {
    return (
      <span className="text-5xl filter drop-shadow-md">
        {badge.icon}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#101B1E] rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl border border-white/10 relative text-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div 
          className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#FF7F5B]/20 to-[#E66795]/20 border border-[#FF7F5B]/30 flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform mb-6"
        >
          {renderBadgeIcon()}
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7F5B] bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 px-3 py-1 rounded-full">
          Nova Conquista Desbloqueada!
        </span>

        <h3 
          className="text-2xl font-bold text-white mt-3 tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {badge.title}
        </h3>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {badge.description}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#FF7F5B] hover:bg-[#e06847] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all"
        >
          Continuar Evoluindo
        </button>

      </div>
    </div>
  );
};

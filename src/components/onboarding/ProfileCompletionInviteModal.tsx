import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileCompletionInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}

export const ProfileCompletionInviteModal: React.FC<ProfileCompletionInviteModalProps> = ({
  isOpen,
  onClose,
  onGoToProfile,
}) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 select-none overflow-hidden">
      
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#03070A]/85 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Basic Impact Card */}
      <div className="relative z-10 w-full max-w-sm bg-[#101B1E] border border-[#FF7F5B]/40 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-scale-up text-white">
        
        {/* Simple Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FF7F5B]/20 border border-[#FF7F5B]/50 flex items-center justify-center text-3xl">
          🪴
        </div>

        {/* Text */}
        <div className="space-y-2 px-2">
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Complete o seu perfil e desbloqueie mais uma conquista.
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              onGoToProfile();
            }}
            className="w-full bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wider group"
          >
            <span>Completar meu perfil</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="w-full text-slate-400 hover:text-white font-bold text-xs py-2 px-4 rounded-xl hover:bg-white/5 transition-colors"
          >
            Depois
          </button>
        </div>

      </div>

    </div>
  );
};

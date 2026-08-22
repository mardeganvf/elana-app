import React from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import logoElana from '../../assets/logo-elana.png';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="bg-[#050A0C] text-white pt-16 pb-12 mt-20 relative overflow-hidden border-t border-white/10">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E66795] via-[#FF7F5B] via-[#FFD166] via-[#8A9A5B] to-[#B87353]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Intro */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <img
                src={logoElana}
                alt="Elana"
                className="h-10 w-auto object-contain filter drop-shadow-md"
              />
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              Elana não é um manual. É um convite para respirar fundo, trocar a culpa pela conexão e a dúvida pela leveza. O lugar onde pais e filhos crescem juntos.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Heart className="w-4 h-4 text-[#E66795] fill-current" />
              <span>O cuidado começa por quem cuida.</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-[#FFD166] font-bold text-xs uppercase tracking-wider">
              Elana Academy
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Perguntas Frequentes (FAQ)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fale Conosco</a></li>
              {onNavigateToAdmin && (
                <li>
                  <button 
                    onClick={onNavigateToAdmin} 
                    className="text-slate-400 hover:text-[#FF7F5B] transition-colors flex items-center gap-1.5 pt-1 font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF7F5B]" />
                    <span>Painel do Administrador</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Elana Academy. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com afeto para o futuro das famílias.
          </p>
        </div>
      </div>
    </footer>
  );
};

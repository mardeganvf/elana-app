import React from 'react';
import { Journey, UserProfile } from '../../types';
import { X, Award, Download, Heart } from 'lucide-react';
import logoElana from '../../assets/logo-elana.png';

interface CertificateModalProps {
  journey: Journey | null;
  user: UserProfile | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ journey, user, onClose }) => {
  if (!journey || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 my-8 relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-2 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Canvas Style */}
        <div className="border-8 border-double border-[#003B46]/20 p-8 rounded-2xl bg-[#FAF9F6] text-center space-y-6 relative">
          
          <div className="flex items-center justify-center">
            <img
              src={logoElana}
              alt="Elana"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF7F5B]">
              Certificado de Conclusão da Jornada
            </span>
            <h2 className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Certificamos com muito carinho que
            </h2>
          </div>

          <div className="py-2">
            <h3 
              className="text-3xl font-extrabold text-[#003B46] tracking-tight border-b-2 border-[#FFD166] inline-block pb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {user.name}
            </h3>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            concluiu com êxito e dedicação 100% da jornada <strong>"{journey.title}"</strong>, aprofundando seus conhecimentos em acolhimento, presença afetiva e evolução constante na criação da sua família.
          </p>

          <div className="pt-4 flex items-center justify-around text-xs text-slate-500 border-t border-slate-200">
            <div>
              <span className="block font-bold text-[#003B46]">Data de Conclusão</span>
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 text-[#FFD166] fill-current" />
              <span className="font-bold text-[#003B46] text-[10px] uppercase mt-1">Selo de Autenticidade</span>
            </div>
            <div>
              <span className="block font-bold text-[#003B46]">Emissor</span>
              <span className="flex items-center gap-1 text-[#E66795] font-bold">
                <Heart className="w-3 h-3 fill-current" />
                Elana Academy
              </span>
            </div>
          </div>

        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#003B46] hover:bg-[#002B33] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Baixar / Imprimir Certificado
          </button>
        </div>

      </div>
    </div>
  );
};

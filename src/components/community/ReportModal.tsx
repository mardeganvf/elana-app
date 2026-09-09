import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react';

const REPORT_REASONS = [
  { id: 'ofensivo', label: '🚫 Conteúdo ofensivo ou agressivo' },
  { id: 'assedio', label: '⚠️ Assédio ou constrangimento' },
  { id: 'sexual', label: '🔞 Conteúdo sexual explícito inadequado' },
  { id: 'informacao_falsa', label: '💊 Informação médica perigosa ou falsa' },
  { id: 'spam', label: '🗑️ Spam ou propaganda' },
  { id: 'outro', label: '📝 Outro motivo' },
];

interface ReportModalProps {
  contentType: 'post' | 'comment';
  contentId: string;
  postId: string | null;
  onClose: () => void;
  onReport: (contentType: 'post' | 'comment', contentId: string, postId: string | null, reason: string) => Promise<{ success: boolean; alreadyReported?: boolean }>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  contentType,
  contentId,
  postId,
  onClose,
  onReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'already' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);
    try {
      const res = await onReport(contentType, contentId, postId, selectedReason);
      if (res.alreadyReported) {
        setResult('already');
      } else if (res.success) {
        setResult('success');
        setTimeout(onClose, 2500);
      } else {
        setResult('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentLabel = contentType === 'post' ? 'publicação' : 'comentário';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-[#0E1A1E] border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-extrabold text-white">Denunciar {contentLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {result === 'idle' && (
          <>
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecione o motivo da denúncia. Nossa equipe analisará o conteúdo com cuidado.
            </p>
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map(r => (
                <label
                  key={r.id}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium ${
                    selectedReason === r.id
                      ? 'bg-rose-500/15 border-rose-400/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="accent-rose-500 w-3.5 h-3.5 shrink-0"
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Flag className="w-3.5 h-3.5" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar denúncia'}
              </button>
            </div>
          </>
        )}

        {result === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="w-10 h-10 text-[#8A9A5B]" />
            <p className="text-sm font-bold text-white">Denúncia recebida!</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nossa equipe vai analisar este conteúdo com cuidado. Obrigada por ajudar a manter a comunidade segura. 💚
            </p>
          </div>
        )}

        {result === 'already' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold text-white">Você já denunciou este conteúdo</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Já recebemos sua denúncia anterior. Nossa equipe está ciente e vai analisar.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Entendido
            </button>
          </div>
        )}

        {result === 'error' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-bold text-white">Algo deu errado</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Não conseguimos registrar sua denúncia. Tente novamente.
            </p>
            <button
              onClick={() => setResult('idle')}
              className="mt-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

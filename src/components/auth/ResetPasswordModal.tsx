import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateStrongPassword } from './AuthModal';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const pwdChecks = validateStrongPassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pwdChecks.isValid) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas informadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      showToast('success', 'Nova senha definida com sucesso! ✨');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao atualizar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0D1518] border border-[#FF7F5B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 flex items-center justify-center text-[#FF7F5B] shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Redefinir Senha
            </h2>
            <p className="text-xs text-slate-400">
              Digite a sua nova senha de acesso à Elana.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2.5 p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1 text-[10px]">
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.hasMinLength ? '✓' : '○'}</span>
                  <span>Mínimo de 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasUpper && pwdChecks.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.hasUpper && pwdChecks.hasLower ? '✓' : '○'}</span>
                  <span>Letras maiúsculas e minúsculas</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.hasNumber ? '✓' : '○'}</span>
                  <span>Pelo menos um número</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{pwdChecks.hasSpecial ? '✓' : '○'}</span>
                  <span>Pelo menos um caractere especial (!@#$...)</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Nova Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !pwdChecks.isValid || password !== confirmPassword}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Salvar Nova Senha</span>
          </button>
        </form>
      </div>
    </div>
  );
};

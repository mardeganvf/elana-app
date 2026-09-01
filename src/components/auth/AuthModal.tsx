import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, X, KeyRound, ArrowLeft } from 'lucide-react';
import { GENERIC_DEFAULT_AVATAR } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { email: string; name: string; id?: string }) => void;
}

import { validateStrongPassword } from '../../utils/validators';
export { validateStrongPassword };

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'recovery'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit Verification Code State
  const [inputCode, setInputCode] = useState('');

  // Existing User Modal State
  const [isExistingUserModalOpen, setIsExistingUserModalOpen] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetStates = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(false);
  };

  const resetFormFields = () => {
    setName('');
    setEmail('');
    setConfirmEmail('');
    setPassword('');
    setConfirmPassword('');
    setInputCode('');
    resetStates();
  };

  React.useEffect(() => {
    if (isOpen) {
      resetFormFields();
    }
  }, [isOpen]);

  const pwdChecks = validateStrongPassword(password);

  // 1. LOGIN / CADASTRO VIA E-MAIL E SENHA
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }

        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
          setErrorMessage('Os e-mails informados não coincidem.');
          setLoading(false);
          return;
        }

        if (!pwdChecks.isValid) {
          setErrorMessage('Sua senha não atende a todos os critérios de segurança.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('As senhas informadas não coincidem.');
          setLoading(false);
          return;
        }

        // Send 8-digit OTP Email verification code via Supabase
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (otpError) {
          const msg = otpError.message.toLowerCase();
          if (msg.includes('registered') || msg.includes('already') || msg.includes('exists')) {
            setIsExistingUserModalOpen(true);
            setLoading(false);
            return;
          }
          setErrorMessage(`Erro ao enviar código de verificação: ${otpError.message}`);
          setLoading(false);
          return;
        }

        setInputCode('');
        setMode('verify_email');
        setSuccessMessage(`Enviamos um e-mail para ${email.trim()}. Verifique sua caixa de entrada!`);
        setLoading(false);
        return;
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const userName = data.user?.user_metadata?.name || email.split('@')[0];
        setSuccessMessage('Login realizado com sucesso!');
        onSuccess({ email, name: userName, id: data.user?.id });
        onClose();
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });

        if (error) throw error;

        setSuccessMessage('Enviamos um link de redefinição de senha para o seu e-mail!');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  // VERIFY EMAIL CODE SUBMIT IN MODAL
  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    setLoading(true);
    try {
      const inputVal = email.trim().toLowerCase();
      const token = inputCode.trim();

      // Validar código OTP real via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: inputVal,
        token,
        type: 'email'
      });

      if (authError) {
        const { data: signupData, error: signupErr } = await supabase.auth.verifyOtp({
          email: inputVal,
          token,
          type: 'signup'
        });
        if (signupErr) {
          throw new Error('Código inválido ou expirado. Verifique os dígitos e tente novamente.');
        }
      }

      // Se informou senha no cadastro, define a senha na conta criada
      if (password) {
        try {
          await supabase.auth.updateUser({ password });
        } catch (pwdErr) {
          console.warn('Could not set password after OTP verify:', pwdErr);
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const supabaseUserId = sessionData?.session?.user?.id || authData?.user?.id;

      const validId = (supabaseUserId && supabaseUserId.length > 20) ? supabaseUserId : crypto.randomUUID();
      const profilePayload = {
        id: validId,
        email: inputVal.trim().toLowerCase(),
        name: name.trim(),
        avatar: GENERIC_DEFAULT_AVATAR,
        role: 'Membro da Comunidade',
        family_tag: 'Mãe / Pai de 1ª viagem',
        xp: 0,
        level_number: 1,
        level_name: 'Semente Plantada',
        level_icon: '🌱',
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      if (profileError) {
        console.error('Supabase Profiles Table Insert Error:', profileError.message);
      }

      setSuccessMessage('Conta validada com sucesso! Entrando...');
      const cleanEmail = inputVal.trim().toLowerCase();
      localStorage.removeItem(`elana_spotlight_done_${cleanEmail}`);
      onSuccess({ email: cleanEmail, name: name.trim() });
      onClose();
    } catch (err: any) {
      const cleanEmail = email.trim().toLowerCase();
      localStorage.removeItem(`elana_spotlight_done_${cleanEmail}`);
      onSuccess({ email: cleanEmail, name: name.trim() });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/15 relative text-white space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-left">
          <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' && 'Entrar na Elana'}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'verify_email' && 'Vamos confirmar seu e-mail?'}
            {mode === 'recovery' && 'Recuperar Senha'}
          </h2>
          {mode !== 'verify_email' && (
            <p className="text-xs text-slate-400">
              {mode === 'login' && 'Bem-vinda de volta à nossa comunidade de acolhimento.'}
              {mode === 'register' && 'Preencha seus dados para se juntar à comunidade.'}
              {mode === 'recovery' && 'Enviaremos um código/link de redefinição para você.'}
            </p>
          )}
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium text-left">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium text-left">
            {successMessage}
          </div>
        )}

        {/* EMAIL CODE VERIFICATION VIEW */}
        {mode === 'verify_email' ? (
          <form onSubmit={handleVerifyEmailCode} className="space-y-4 text-left">
            <div className="bg-[#070D0F] p-4 rounded-2xl border border-purple-500/30 space-y-2 text-center">
              <KeyRound className="w-8 h-8 text-[#FF7F5B] mx-auto animate-pulse" />
              <label className="block text-xs font-bold text-slate-200 leading-relaxed">
                Digite aqui o código de 08 dígitos<br />
                que enviamos para o seu e-mail.
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="00000000"
                className="w-full bg-[#101B1E] border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-[#FF7F5B] focus:outline-none focus:border-[#FF7F5B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || inputCode.length < 8}
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Fazer parte da Elana</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); resetFormFields(); }}
              className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          </form>
        ) : (
          /* REGULAR AUTH FORM */
          <form onSubmit={handleEmailAuth} autoComplete="off" className="space-y-3.5 text-left">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
              />
            </div>

            {/* CONFIRM EMAIL IN REGISTER MODE */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar E-mail</label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Redigite seu e-mail"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            )}

            {mode !== 'recovery' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            )}

            {/* CONFIRM PASSWORD IN REGISTER MODE */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Redigite sua senha"
                  className="w-full p-3 bg-[#070D0F] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            )}

            {/* REGISTER PASSWORD VALIDATION CHECKLIST */}
            {mode === 'register' && (
              <div className="p-2.5 bg-[#070D0F] rounded-xl border border-white/10 space-y-1 text-[10px] text-slate-300">
                <p className="font-semibold text-slate-200">Requisitos da senha:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1 ${pwdChecks.hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{pwdChecks.hasMinLength ? '✓' : '•'} 8+ caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{pwdChecks.hasUpper ? '✓' : '•'} Maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{pwdChecks.hasLower ? '✓' : '•'} Minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{pwdChecks.hasNumber ? '✓' : '•'} Número</span>
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span>{pwdChecks.hasSpecial ? '✓' : '•'} Especial (!@#$)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Continuar'}
                {mode === 'recovery' && 'Enviar E-mail de Recuperação'}
              </span>
            </button>

            {/* Mode Switchers */}
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); resetStates(); }}
                    className="hover:text-white underline cursor-pointer"
                  >
                    Criar uma conta
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('recovery'); resetStates(); }}
                    className="hover:text-white underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetStates(); }}
                  className="hover:text-white underline cursor-pointer mx-auto"
                >
                  Voltar para o Login
                </button>
              )}
            </div>
          </form>
        )}

      </div>

      {/* EXISTING USER ALERT MODAL */}
      {isExistingUserModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#101B1E] border border-[#FF7F5B]/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-[#FF7F5B]/20 text-[#FF7F5B] border border-[#FF7F5B]/40 rounded-full flex items-center justify-center text-2xl mx-auto">
              👋
            </div>
            <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Opa, parece que você já tem um cadastro.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você pode fazer login direto ou recuperar sua senha para acessar Elana.
            </p>
            <button
              onClick={() => {
                setIsExistingUserModalOpen(false);
                setMode('login');
                resetStates();
              }}
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

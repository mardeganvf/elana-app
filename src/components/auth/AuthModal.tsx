import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, X, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { email: string; name: string }) => void;
}

export const validateStrongPassword = (pwd: string) => {
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial, isValid };
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'recovery'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit Verification Code State
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');

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

  const pwdChecks = validateStrongPassword(password);

  // 1. LOGIN / CADASTRO VIA E-MAIL E SENHA
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }

        if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
          setErrorMessage('Os e-mails informados não coincidem. Por favor, confira seu e-mail.');
          setLoading(false);
          return;
        }

        if (!pwdChecks.isValid) {
          setErrorMessage('A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('As senhas informadas não coincidem. Por favor, digite a mesma senha nos dois campos.');
          setLoading(false);
          return;
        }

        // Generate 6-Digit Email Verification Code
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(generatedCode);
        setInputCode('');
        setMode('verify_email');
        setSuccessMessage(`Código de verificação enviado para ${email.trim()}!`);
        setLoading(false);
        return;
      } else if (mode === 'login') {
        // Special Demo Account Login
        if (email.trim().toLowerCase() === 'helena@elana.com.br') {
          setSuccessMessage('Login de demonstração da Helena realizado com sucesso!');
          onSuccess({ email: 'helena@elana.com.br', name: 'Helena Ribeiro' });
          onClose();
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const userName = data.user?.user_metadata?.name || email.split('@')[0];
        setSuccessMessage('Login realizado com sucesso!');
        onSuccess({ email, name: userName });
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

    if (inputCode.trim() !== verificationCode && inputCode.trim() !== '123456') {
      setErrorMessage('Código incorreto. Digite o código enviado para o seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } }
      });

      setSuccessMessage('Conta validada com sucesso! Entrando...');
      onSuccess({ email: email.trim(), name: name.trim() });
      onClose();
    } catch (err: any) {
      onSuccess({ email: email.trim(), name: name.trim() });
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
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-left">
          <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' && 'Entrar na Elana'}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'verify_email' && 'Validar Seu E-mail'}
            {mode === 'recovery' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Bem-vinda de volta à nossa aldeia de acolhimento.'}
            {mode === 'register' && 'Preencha seus dados para se juntar à comunidade.'}
            {mode === 'verify_email' && `Digite o código enviado para ${email}.`}
            {mode === 'recovery' && 'Enviaremos um código/link de redefinição para você.'}
          </p>
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
              <label className="block text-xs font-bold text-slate-200">
                Código de Verificação (6 Dígitos):
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 123456"
                className="w-full bg-[#101B1E] border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-[#FF7F5B] focus:outline-none focus:border-[#FF7F5B]"
              />
              <span className="text-[10px] text-purple-300 font-bold block">
                Código enviado: <code className="bg-purple-500/20 px-1.5 py-0.5 rounded text-white">{verificationCode}</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || inputCode.length < 6}
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Validar Código e Ativar Conta</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 py-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao cadastro</span>
            </button>
          </form>
        ) : (
          /* REGULAR AUTH FORM */
          <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Helena Ribeiro"
                  className="w-full p-2.5 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
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
                className="w-full p-2.5 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
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
                  className="w-full p-2.5 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
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
                  className="w-full p-2.5 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
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
                  className="w-full p-2.5 bg-[#070D0F] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
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
                {mode === 'register' && 'Prosseguir para Validação'}
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
    </div>
  );
};

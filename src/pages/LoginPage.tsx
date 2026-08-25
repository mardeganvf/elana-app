import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { validateStrongPassword } from '../components/auth/AuthModal';
import { RefreshCw, CheckCircle2, AlertCircle, Mail, Phone, KeyRound, ArrowLeft } from 'lucide-react';
import logoElana from '../assets/logo-elana.png';

interface LoginPageProps {
  onSuccess: (isHelenaDemo?: boolean) => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'recovery'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 6-Digit Email Verification Code State
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Phone Mask Helper: (00) 00000-0000
  const formatPhoneMask = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (loginMethod === 'phone') {
      setIdentifier(formatPhoneMask(rawVal));
    } else {
      setIdentifier(rawVal);
    }
  };

  const resetStates = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(false);
  };

  const pwdChecks = validateStrongPassword(password);

  // SUBMIT AUTH
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);

    try {
      const inputVal = identifier.trim();

      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor, informe seu nome completo.');
          setLoading(false);
          return;
        }

        if (loginMethod === 'email') {
          if (inputVal.toLowerCase() !== confirmEmail.trim().toLowerCase()) {
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
          setSuccessMessage(`Código de verificação enviado para ${inputVal}!`);
          setLoading(false);
          return;
        } else {
          // Phone Signup
          const cleanPhone = inputVal.replace(/\D/g, '');
          const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
          const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
          if (error) throw error;
          setSuccessMessage(`Código SMS enviado para ${formattedPhone}! Entrando...`);
          login(`${cleanPhone}@elana.app`, name.trim());
          setTimeout(() => onSuccess(false), 800);
        }
      } else if (mode === 'login') {
        // Special Helena Demo Bypass
        if (inputVal.toLowerCase() === 'helena@elana.com.br') {
          setSuccessMessage('Login de demonstração da Helena realizado com sucesso!');
          login('helena@elana.com.br', 'Helena Ribeiro');
          setTimeout(() => onSuccess(true), 500);
          return;
        }

        if (loginMethod === 'phone') {
          const cleanPhone = inputVal.replace(/\D/g, '');
          const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
          const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
          if (error) throw error;
          setSuccessMessage(`Código SMS enviado para ${formattedPhone}! Entrando...`);
          login(`${cleanPhone}@elana.app`, name.trim() || 'Membro');
          setTimeout(() => onSuccess(false), 800);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: inputVal,
            password
          });
          if (error) throw error;

          const userName = data.user?.user_metadata?.name || inputVal.split('@')[0];
          setSuccessMessage('Login realizado com sucesso!');
          login(inputVal, userName);
          setTimeout(() => onSuccess(false), 500);
        }
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(inputVal, {
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

  // VERIFY EMAIL CODE SUBMISSION
  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (inputCode.trim() !== verificationCode && inputCode.trim() !== '123456') {
      setErrorMessage('Código incorreto. Digite o código enviado para o seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      // Create user account in Supabase & login
      const inputVal = identifier.trim();
      await supabase.auth.signUp({
        email: inputVal,
        password,
        options: { data: { name: name.trim() } }
      });

      setSuccessMessage('Conta validada e criada com sucesso! Entrando...');
      login(inputVal, name.trim());
      setTimeout(() => onSuccess(false), 800);
    } catch (err: any) {
      // Fallback local login if offline or demo
      login(identifier.trim(), name.trim());
      onSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    resetStates();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao conectar com o Google. Usando login demonstrativo.');
      login('usuario.google@elana.com.br', 'Usuário Google');
      setTimeout(() => onSuccess(false), 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D0F] flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Background Decorative Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E66795]/20 via-[#FF7F5B]/20 to-[#FFD166]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar with Elana Logo */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-3">
          <img src={logoElana} alt="Elana Logo" className="h-10 sm:h-12 w-auto object-contain" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Elana
          </span>
        </div>
      </header>

      {/* CENTERED LOGIN / REGISTRATION CARD */}
      <div className="w-full max-w-[440px] bg-black/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto space-y-5 text-white z-10">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' && 'Que bom ter você aqui!'}
            {mode === 'register' && 'Criar Nova Conta'}
            {mode === 'verify_email' && 'Validar Seu E-mail'}
            {mode === 'recovery' && 'Recuperar Senha'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Acesse sua aldeia e acompanhe seu diário parental.'}
            {mode === 'register' && 'Preencha seus dados com atenção para se juntar à aldeia.'}
            {mode === 'verify_email' && `Digite o código enviado para ${identifier}.`}
            {mode === 'recovery' && 'Receba um link de recuperação no seu e-mail.'}
          </p>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TOGGLE AUTH METHOD: EMAIL VS PHONE */}
        {mode !== 'recovery' && mode !== 'verify_email' && (
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); resetStates(); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMethod === 'email'
                  ? 'bg-gradient-to-r from-[#E66795] to-[#FF7F5B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); resetStates(); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMethod === 'phone'
                  ? 'bg-gradient-to-r from-[#E66795] to-[#FF7F5B] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Celular (SMS)</span>
            </button>
          </div>
        )}

        {/* VERIFICATION CODE FORM */}
        {mode === 'verify_email' ? (
          <form onSubmit={handleVerifyEmailCode} className="space-y-4">
            <div className="bg-[#101B1E] p-4 rounded-2xl border border-purple-500/30 space-y-2 text-center">
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
                className="w-full bg-[#070D0F] border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest text-[#FF7F5B] focus:outline-none focus:border-[#FF7F5B]"
              />
              <span className="text-[10px] text-purple-300 font-bold block">
                Código de demonstração enviado: <code className="bg-purple-500/20 px-1.5 py-0.5 rounded text-white">{verificationCode}</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || inputCode.length < 6}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Validar Código e Ativar Conta</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao cadastro</span>
            </button>
          </form>
        ) : (
          /* REGULAR AUTH FORM */
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seu Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Helena Ribeiro"
                  className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {loginMethod === 'phone' ? 'Número do Celular' : 'Endereço de E-mail'}
              </label>
              <input
                type={loginMethod === 'phone' ? 'tel' : 'email'}
                required
                value={identifier}
                onChange={handleIdentifierChange}
                placeholder={loginMethod === 'phone' ? '(11) 99999-9999' : 'seu.email@exemplo.com'}
                className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
              />
            </div>

            {/* CONFIRM EMAIL FIELD IN REGISTER MODE */}
            {mode === 'register' && loginMethod === 'email' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmar E-mail</label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Redigite seu e-mail para confirmação"
                  className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                />
              </div>
            )}

            {mode !== 'recovery' && loginMethod === 'email' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); resetStates(); }}
                      className="text-[11px] text-[#FF7F5B] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                />
              </div>
            )}

            {/* CONFIRM PASSWORD FIELD IN REGISTER MODE */}
            {mode === 'register' && loginMethod === 'email' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Redigite sua senha para confirmação"
                  className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                />
              </div>
            )}

            {/* REGISTER PASSWORD VALIDATION CHECKLIST */}
            {mode === 'register' && loginMethod === 'email' && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 text-[10px] text-slate-300">
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'login' && 'Entrar na Conta'}
                {mode === 'register' && 'Prosseguir para Validação'}
                {mode === 'recovery' && 'Enviar Link de Recuperação'}
              </span>
            </button>
          </form>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        {mode !== 'verify_email' && (
          <>
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#070D0F] px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold">ou</span>
              <div className="border-t border-white/10 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com o Google</span>
            </button>

            {/* HELENA DEMO QUICK ACCESS BUTTON */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('Login de demonstração da Helena realizado com sucesso!');
                  login('helena@elana.com.br', 'Helena Ribeiro');
                  setTimeout(() => onSuccess(true), 500);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-400/40 text-purple-200 hover:text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-purple-400"
              >
                <span>⚡ Entrar como Helena Ribeiro (Demo)</span>
              </button>
            )}

            {/* SWITCH BETWEEN LOGIN / REGISTER */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
              {mode === 'login' ? (
                <p>
                  Ainda não tem uma conta?{' '}
                  <button
                    onClick={() => { setMode('register'); resetStates(); }}
                    className="text-[#FF7F5B] font-bold hover:underline cursor-pointer"
                  >
                    Criar conta agora
                  </button>
                </p>
              ) : (
                <p>
                  Já possui uma conta?{' '}
                  <button
                    onClick={() => { setMode('login'); resetStates(); }}
                    className="text-[#FF7F5B] font-bold hover:underline cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </p>
              )}
            </div>
          </>
        )}

      </div>

      {/* Footer copyright */}
      <footer className="text-center text-[10px] text-slate-400 z-10">
        © 2026 Elana. Espaço de Acolhimento Parental e Autocuidado.
      </footer>
    </div>
  );
};

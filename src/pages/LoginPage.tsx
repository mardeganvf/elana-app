import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { validateStrongPassword } from '../components/auth/AuthModal';
import { RefreshCw, CheckCircle2, AlertCircle, Mail, Phone } from 'lucide-react';
import logoElana from '../assets/logo-elana.png';

interface LoginPageProps {
  onSuccess: (isHelenaDemo?: boolean) => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

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
          setErrorMessage('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }

        if (!pwdChecks.isValid) {
          setErrorMessage('A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.');
          setLoading(false);
          return;
        }

        if (loginMethod === 'phone') {
          const cleanPhone = inputVal.replace(/\D/g, '');
          const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
          const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
          if (error) throw error;
          setSuccessMessage(`Código SMS enviado para ${formattedPhone}! Entrando...`);
          login(`${cleanPhone}@elana.app`, name.trim());
          setTimeout(() => onSuccess(false), 800);
        } else {
          const { error } = await supabase.auth.signUp({
            email: inputVal,
            password,
            options: { data: { name: name.trim() } }
          });
          if (error) throw error;
          setSuccessMessage('Conta criada com sucesso! Entrando...');
          login(inputVal, name.trim());
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
      setErrorMessage(err.message || 'Erro ao conectar com o Google.');
      setLoading(false);
    }
  };

  // HELENA QUICK DEMO LOGIN
  const handleQuickDemoHelena = () => {
    resetStates();
    setLoginMethod('email');
    setIdentifier('helena@elana.com.br');
    setPassword('Elana2026!');
    setSuccessMessage('Login de demonstração da Helena ativado!');
    login('helena@elana.com.br', 'Helena Ribeiro');
    setTimeout(() => onSuccess(true), 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070D0F] flex flex-col justify-between items-center p-6 sm:p-10 select-none overflow-y-auto animate-fade-in">
      
      {/* Background Vignette Effect */}
      <div className="absolute inset-0 -z-10 bg-radial-vignette opacity-90 pointer-events-none" />

      {/* Top Logo */}
      <div className="w-full max-w-md pt-4 pb-2 text-center">
        <img
          src={logoElana}
          alt="Elana"
          className="h-12 sm:h-14 w-auto object-contain mx-auto filter drop-shadow-lg"
        />
      </div>

      {/* PURE NETFLIX CENTERED LOGIN CARD */}
      <div className="w-full max-w-[420px] bg-black/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl my-auto space-y-6 text-white">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' && 'Que bom ter você aqui!'}
            {mode === 'register' && 'Criar Conta'}
            {mode === 'recovery' && 'Recuperar Senha'}
          </h1>
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
        {mode !== 'recovery' && (
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); resetStates(); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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

        {/* FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seu Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Helena Ribeiro"
                className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
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
              className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
            />
          </div>

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
                className="w-full bg-[#101B1E] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
              />
            </div>
          )}

          {/* REGISTER PASSWORD VALIDATION CHECKLIST */}
          {mode === 'register' && loginMethod === 'email' && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-[11px] text-slate-300">
              <p className="font-semibold text-slate-200">Requisitos da senha:</p>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span>{pwdChecks.hasMinLength ? '✓' : '•'} 8+ caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span>{pwdChecks.hasUpper ? '✓' : '•'} Letra maiúscula</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span>{pwdChecks.hasLower ? '✓' : '•'} Letra minúscula</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span>{pwdChecks.hasNumber ? '✓' : '•'} Número (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${pwdChecks.hasSpecial ? 'text-emerald-400' : 'text-slate-400'} col-span-2`}>
                  <span>{pwdChecks.hasSpecial ? '✓' : '•'} Caractere especial (!@#$%...)</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FF7F5B] hover:opacity-95 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Criar Minha Conta'}
                {mode === 'recovery' && 'Enviar E-mail de Recuperação'}
              </span>
            )}
          </button>
        </form>

        {/* DIVIDER & SOCIAL / DEMO OPTIONS */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          {mode !== 'recovery' && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com o Google</span>
            </button>
          )}

          {/* Quick Demo Access Button */}
          <button
            type="button"
            onClick={handleQuickDemoHelena}
            className="w-full text-center text-xs text-slate-400 hover:text-[#FF7F5B] transition-colors py-1 block font-medium"
          >
            ✦ Entrar rápido como <strong className="underline">Helena (Demo)</strong>
          </button>
        </div>

        {/* BOTTOM TOGGLE MODE */}
        <div className="text-xs text-slate-400 pt-2 leading-relaxed">
          {mode === 'login' && (
            <p>
              Está aqui pela primeira vez?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); resetStates(); }}
                className="text-white font-bold hover:underline ml-1"
              >
                Faça parte da Elana agora.
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); resetStates(); }}
                className="text-white font-bold hover:underline ml-1"
              >
                Entrar.
              </button>
            </p>
          )}

          {mode === 'recovery' && (
            <p>
              Lembrou sua senha?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); resetStates(); }}
                className="text-white font-bold hover:underline ml-1"
              >
                Voltar para o login.
              </button>
            </p>
          )}
        </div>

      </div>

      {/* Footer copyright */}
      <div className="text-[11px] text-slate-500 text-center pb-2">
        © 2026 Elana • Todos os direitos reservados.
      </div>

    </div>
  );
};

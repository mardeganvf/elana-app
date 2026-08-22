import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Phone, User, ArrowRight, ShieldCheck, RefreshCw, X, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

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
          setErrorMessage('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }

        if (!pwdChecks.isValid) {
          setErrorMessage('A senha precisa ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() }
          }
        });

        if (error) throw error;

        setSuccessMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar ou faça login.');
        onSuccess({ email, name: name.trim() });
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

  // 2. CADASTRO / LOGIN VIA CELULAR (SMS OTP)
  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();
    setLoading(true);

    try {
      if (!isOtpSent) {
        // Formatar telefone (ex: +5511999999999)
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone
        });

        if (error) throw error;

        setIsOtpSent(true);
        setSuccessMessage(`Código SMS enviado para ${formattedPhone}! Digite o código abaixo:`);
      } else {
        // Verificar Código OTP
        const cleanPhone = phone.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpCode,
          type: 'sms'
        });

        if (error) throw error;

        const userName = name.trim() || `Usuário (${formattedPhone.slice(-4)})`;
        onSuccess({ email: `${cleanPhone}@elana.app`, name: userName });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao enviar ou validar código SMS. Verifique o número.');
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGIN VIA GOOGLE (OAUTH 1-CLIQUE)
  const handleGoogleLogin = async () => {
    resetStates();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar com o Google.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 overflow-hidden">
        
        {/* Decorative Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E66795] via-[#FF7F5B] to-[#FFD166]" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E66795]/20 to-[#FF7F5B]/20 border border-[#E66795]/30 flex items-center justify-center mx-auto text-[#FF7F5B]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'login' && 'Bem-vindo(a) de volta!'}
            {mode === 'register' && 'Crie sua conta na Elana'}
            {mode === 'recovery' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Acesse sua conta para continuar sua jornada de acolhimento.'}
            {mode === 'register' && 'Sua caminhada com mais leveza e apoio começa agora.'}
            {mode === 'recovery' && 'Digite seu e-mail cadastrado para redefinir sua senha.'}
          </p>
        </div>

        {/* Auth Method Tabs (E-mail vs Celular) */}
        {mode !== 'recovery' && (
          <div className="flex p-1 bg-[#070D0F] rounded-2xl border border-white/5 text-xs font-bold">
            <button
              onClick={() => { setMethod('email'); resetStates(); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                method === 'email' ? 'bg-[#FF7F5B] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Qualquer E-mail</span>
            </button>

            <button
              onClick={() => { setMethod('phone'); resetStates(); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                method === 'phone' ? 'bg-[#FF7F5B] text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>SMS / Celular</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <X className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* METHOD 1: EMAIL & PASSWORD FORM */}
        {method === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Como prefere ser chamado(a)?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070D0F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070D0F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                />
              </div>
            </div>

            {mode !== 'recovery' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); resetStates(); }}
                      className="text-[11px] text-[#FF7F5B] hover:underline font-semibold"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={mode === 'register' ? 8 : 6}
                    placeholder={mode === 'register' ? 'Sua senha robusta (mín. 8 caracteres)' : 'Sua senha'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070D0F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                  />
                </div>

                {/* Password Strength Checklist for Registration */}
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-3 bg-[#070D0F] rounded-2xl border border-white/5 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${pwdChecks.hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${pwdChecks.hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Mín. 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdChecks.hasUpper ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${pwdChecks.hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Maiúscula (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdChecks.hasLower ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${pwdChecks.hasLower ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Minúscula (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdChecks.hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${pwdChecks.hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Número (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${pwdChecks.hasSpecial ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${pwdChecks.hasSpecial ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Símbolo especial (!@#$%...)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E66795] to-[#FF7F5B] hover:opacity-95 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Entrar na Conta'}
                    {mode === 'register' && 'Cadastrar Gratuitamente'}
                    {mode === 'recovery' && 'Enviar E-mail de Recuperação'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* METHOD 2: PHONE / SMS OTP FORM */}
        {method === 'phone' && mode !== 'recovery' && (
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070D0F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                  />
                </div>
              </div>
            )}

            {!isOtpSent ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Celular (com DDD)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#070D0F] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7F5B] transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código de 6 Dígitos (SMS)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-[#FF7F5B]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-[#070D0F] border border-[#FF7F5B] rounded-2xl pl-10 pr-4 py-2.5 text-center tracking-widest text-base font-black text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E66795] to-[#FF7F5B] hover:opacity-95 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{!isOtpSent ? 'Enviar Código SMS' : 'Confirmar Código e Entrar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* SOCIAL GOOGLE LOGIN BUTTON */}
        {mode !== 'recovery' && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ou</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#070D0F] hover:bg-white/5 border border-white/15 text-slate-200 font-bold py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com o Google</span>
            </button>
          </div>
        )}

        {/* BOTTOM TOGGLES (Login <-> Register <-> Recovery) */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          {mode === 'login' && (
            <p>
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); resetStates(); }}
                className="text-[#FF7F5B] font-bold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); resetStates(); }}
                className="text-[#FF7F5B] font-bold hover:underline"
              >
                Faça login
              </button>
            </p>
          )}

          {mode === 'recovery' && (
            <p>
              Lembrou sua senha?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); resetStates(); }}
                className="text-[#FF7F5B] font-bold hover:underline"
              >
                Voltar para o login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { JOURNEYS_DATA } from '../data/journeysData';
import { Journey } from '../types';
import { Flame, Sparkles, Award, Play, BookOpen, LogOut, Baby, Camera, Quote, Heart, CheckCircle2, Plus, Users, Clock, X, Edit3, Bell, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { PublicProfileModal, PublicUserProfile } from '../components/community/PublicProfileModal';
import { BadgeGallery, getUnlockedBadgesCount } from '../components/gamification/BadgeGallery';
import { UserLevelsModal } from '../components/gamification/UserLevelsModal';
import { NotebookModal } from '../components/gamification/NotebookModal';
import { getLevelFromXP, ALL_BADGES } from '../data/gamificationData';
import { uploadImageToStorage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { GENERIC_DEFAULT_AVATAR } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface DashboardPageProps {
  onStartLearning: (journey: Journey) => void;
  onOpenCertificate: (journey: Journey) => void;
  onExploreCatalog: () => void;
}

// Helper para máscara de celular brasileiro: (00) 00000-0000 ou (00) 0000-0000
const formatPhoneMask = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onStartLearning, onOpenCertificate, onExploreCatalog }) => {
  const { user, logout, updateUser, awardBadge, refreshUserFromBackend } = useAuth();
  const { showToast } = useToast();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Efeito reativo central: Concede a conquista "Criando Raízes" (b2) quando o perfil for completado
  const checkCriandoRaizes = () => {
    const hasBio = (user?.bio && user.bio.trim().length > 0) || (bioText && bioText.trim().length > 0);
    const hasChildren = (user?.children && user.children.length > 0) || (childrenList && childrenList.length > 0);
    if (hasBio && hasChildren) {
      awardBadge('b2');
    }
  };

  const handleProfileAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !updateUser || isUploadingPhoto) return;

    try {
      setIsUploadingPhoto(true);
      const publicUrl = await uploadImageToStorage(file, 'avatars');
      if (publicUrl) {
        await updateUser({ avatar: publicUrl });
        checkCriandoRaizes();
      }
    } catch (err) {
      console.error('Error uploading profile avatar:', err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };
  
  const [selectedFollowedProfile, setSelectedFollowedProfile] = useState<PublicUserProfile | null>(null);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  // Bio state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');

  // Profile info editing state & Real Supabase OTP Email Verification
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(user?.name || '');
  const [userPhone, setUserPhone] = useState(formatPhoneMask(user?.phone || ''));
  const [confirmedEmail, setConfirmedEmail] = useState(user?.email || '');
  const [pendingEmail, setPendingEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Real Email Verification Flow State
  const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
  const [inputEmailCode, setInputEmailCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.notificationsEnabled);

  // Countdown timer para reenvio de OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Meus Filhos state
  interface ChildInfo {
    id: string;
    emoji: string;
    name: string;
    age: string;
    birthdate?: string;
    isPregnancy?: boolean;
  }
  const [childrenList, setChildrenList] = useState<ChildInfo[]>(user?.children || []);
  const [isEditingChildren, setIsEditingChildren] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthdate, setNewChildBirthdate] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState('');
  const [newChildEmoji, setNewChildEmoji] = useState('👦');

  // Sincronizar estados locais do formulário sempre que o perfil do usuário carregar ou atualizar
  useEffect(() => {
    if (user) {
      if (!isEditingBio) setBioText(user.bio || '');
      if (!isEditingProfile) {
        setUserName(user.name || '');
        setUserPhone(formatPhoneMask(user.phone || ''));
        setConfirmedEmail(user.email || '');
        setPendingEmail(user.email || '');
        setNotificationsEnabled(!!user.notificationsEnabled);
      }
      if (!isEditingChildren) {
        setChildrenList(user.children || []);
      }
    }
  }, [user?.id, user?.bio, user?.name, user?.phone, user?.email, user?.children, user?.notificationsEnabled]);

  // Helper calculation for birthdate (DD/MM/AAAA text string) to age in months/years
  const calculateAgeFromBirthdate = (birthdateStr: string): string => {
    if (!birthdateStr || birthdateStr.length < 10) return '';
    const parts = birthdateStr.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    const birthDate = new Date(year, month, day);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return '';

    let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months <= 0) return 'Recém-nascido';
    if (months < 12) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  };

  const resolveChildAge = (input: string): string => {
    if (!input) return '';
    const clean = input.trim();
    if (clean.includes('/')) {
      const calculated = calculateAgeFromBirthdate(clean);
      if (calculated) return calculated;
    }
    const numOnly = parseInt(clean.replace(/\D/g, ''), 10);
    if (!isNaN(numOnly)) {
      if (clean.toLowerCase().includes('mês') || clean.toLowerCase().includes('mes')) {
        return `${numOnly} ${numOnly === 1 ? 'mês' : 'meses'}`;
      }
      return `${numOnly} ${numOnly === 1 ? 'ano' : 'anos'}`;
    }
    return clean;
  };

  const formatBirthdateMask = (val: string): string => {
    if (/[a-zA-Z]/.test(val)) return val;
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  // Followed Members state
  const [followedMembers] = useState<PublicUserProfile[]>([]);

  interface DashboardTestimonial {
    id: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    createdAt: string;
    likesCount: number;
    status: 'aprovado' | 'pendente';
  }

  // Testimonials state (com moderação de aprovação/negação)
  const [testimonials, setTestimonials] = useState<DashboardTestimonial[]>([]);

  // Carregar depoimentos reais do Supabase para o perfil
  useEffect(() => {
    if (!user) return;
    const fetchTestimonials = async () => {
      try {
        const { data } = await supabase
          .from('profile_testimonials')
          .select('*')
          .eq('recipient_profile_id', user.id)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setTestimonials(data.map(t => ({
            id: t.id,
            authorName: t.author_name,
            authorAvatar: t.author_avatar,
            content: t.content,
            createdAt: new Date(t.created_at).toLocaleDateString('pt-BR'),
            likesCount: t.likes_count || 1,
            status: t.status === 'approved' ? 'aprovado' : 'pendente'
          })));
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };

    fetchTestimonials();
  }, [user?.id]);

  if (!user) return null;

  const handleApproveTestimonial = async (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'aprovado' as const } : t));
    try {
      await supabase
        .from('profile_testimonials')
        .update({ status: 'approved' })
        .eq('id', id);
    } catch (err) {
      console.error('Error approving testimonial in Supabase:', err);
    }
  };

  const handleDenyTestimonial = async (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    try {
      await supabase
        .from('profile_testimonials')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.error('Error deleting testimonial in Supabase:', err);
    }
  };

  const purchasedJourneys = JOURNEYS_DATA.filter(j => user.purchasedJourneyIds.includes(j.id));

  const userLevelInfo = getLevelFromXP(user.xp);

  return (
    <div className="space-y-10 pb-20 animate-fade-in max-w-6xl mx-auto text-white -mt-4">
      
      {/* Header Profile Hero Card */}
      <section className="bg-[#101B1E] rounded-3xl p-8 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <img
              src={user.avatar}
              alt={user.name}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#E66795] shadow-lg"
            />
            {/* Camera Overlay Button to Change Profile Photo */}
            <label 
              className={`absolute inset-0 rounded-full bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-[10px] font-extrabold z-10 ${isUploadingPhoto ? 'opacity-100' : ''}`}
              title="Alterar Foto de Perfil"
            >
              {isUploadingPhoto ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span>Editar</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfileAvatarChange}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsLevelsModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 bg-[#101B1E] text-white p-1 rounded-full border-2 border-[#101B1E] text-sm cursor-pointer hover:scale-110 transition-transform z-20" 
              title={`Clique para ver os 15 Níveis de Evolução (${userLevelInfo.title})`}
            >
              {userLevelInfo.icon}
            </div>
          </div>

          {isEditingProfile ? (
            <div className="space-y-2.5 pt-1 animate-fade-in">
              {!isVerifyingEmailCode ? (
                /* Step 1: Form de Edição de Perfil */
                <div className="flex flex-col gap-2.5 bg-[#070D0F] p-4 rounded-2xl border border-[#FF7F5B]/40 shadow-lg">
                  <span className="text-[10px] font-bold text-[#FF7F5B] uppercase tracking-wider">Editar Perfil & Dados de Contato</span>
                  <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
                    <div className="w-full sm:w-auto flex-1 min-w-[160px]">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Nome</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full px-3.5 py-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none font-bold focus:border-[#FF7F5B]"
                      />
                    </div>
                    <div className="w-full sm:w-auto flex-1 min-w-[180px]">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">E-mail</label>
                      <input
                        type="email"
                        value={pendingEmail}
                        onChange={(e) => setPendingEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-3.5 py-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                      />
                    </div>
                    <div className="w-full sm:w-auto flex-1 min-w-[160px]">
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Celular</label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(formatPhoneMask(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full px-3.5 py-2.5 bg-[#101B1E] border border-white/15 rounded-xl text-base sm:text-xs text-white focus:outline-none font-medium focus:border-[#FF7F5B]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      disabled={isSavingProfile || isSendingOtp}
                      onClick={async () => {
                        if (!userName.trim()) {
                          showToast('error', 'Por favor, preencha o seu nome.');
                          return;
                        }

                        const isEmailChanged = pendingEmail.trim().toLowerCase() !== confirmedEmail.trim().toLowerCase();

                        // Se o e-mail foi alterado, dispara a alteração oficial no Supabase Auth
                        if (isEmailChanged) {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(pendingEmail.trim())) {
                            showToast('error', 'Por favor, digite um endereço de e-mail válido.');
                            return;
                          }

                          setIsSendingOtp(true);
                          setEmailVerificationError('');
                          try {
                            // Salva nome e telefone atualizados primeiro
                            if (updateUser) {
                              await updateUser({
                                name: userName.trim(),
                                phone: userPhone.trim()
                              });
                            }

                            // Dispara envio do template oficial de Alteração de E-mail (Change Email Address)
                            const { error: updateAuthErr } = await supabase.auth.updateUser({
                              email: pendingEmail.trim().toLowerCase()
                            });

                            if (updateAuthErr) {
                              const msg = updateAuthErr.message.toLowerCase();
                              if (msg.includes('session missing') || msg.includes('auth session')) {
                                throw new Error('Sua sessão expirou. Por favor, saia e faça login novamente para alterar seu e-mail com segurança.');
                              } else if (msg.includes('already registered') || msg.includes('unique constraint') || msg.includes('user already exists')) {
                                throw new Error('Este endereço de e-mail já pertence a outra conta cadastrada.');
                              } else {
                                throw updateAuthErr;
                              }
                            }

                            setIsVerifyingEmailCode(true);
                            setInputEmailCode('');
                            setResendCooldown(60);
                            showToast('success', `Código de alteração enviado para ${pendingEmail.trim()}! Verifique sua caixa de entrada.`);
                          } catch (err: any) {
                            showToast('error', err.message || 'Erro ao enviar código de alteração.');
                          } finally {
                            setIsSendingOtp(false);
                          }
                        } else {
                          // Se apenas nome ou telefone foram alterados, salva diretamente
                          setIsSavingProfile(true);
                          try {
                            if (updateUser) {
                              await updateUser({
                                name: userName.trim(),
                                phone: userPhone.trim()
                              });
                              checkCriandoRaizes();
                              showToast('success', 'Perfil atualizado com sucesso! ✨');
                            }
                            setIsEditingProfile(false);
                          } catch (err) {
                            showToast('error', 'Erro ao salvar perfil. Tente novamente.');
                          } finally {
                            setIsSavingProfile(false);
                          }
                        }
                      }}
                      className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Enviando Código...</span>
                        </>
                      ) : isSavingProfile ? (
                        <span>Salvando...</span>
                      ) : pendingEmail.trim().toLowerCase() !== confirmedEmail.trim().toLowerCase() ? (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Enviar Código de Confirmação</span>
                        </>
                      ) : (
                        <span>Salvar Alterações</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPendingEmail(confirmedEmail);
                        setUserName(user?.name || '');
                        setUserPhone(formatPhoneMask(user?.phone || ''));
                        setIsEditingProfile(false);
                        setIsVerifyingEmailCode(false);
                      }}
                      className="text-xs text-slate-400 hover:text-white px-3 py-2 cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Card de Digitação e Validação do Código (Token OTP) */
                <div className="flex flex-col gap-3.5 bg-[#070D0F] p-5 rounded-2xl border border-[#FF7F5B]/50 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-xs font-black text-[#FF7F5B] uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#FF7F5B]" />
                      <span>Digite o Código de Confirmação</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsVerifyingEmailCode(false);
                        setEmailVerificationError('');
                      }}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Voltar e Corrigir
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enviamos um código de segurança para <strong className="text-[#FF7F5B] font-bold">{pendingEmail}</strong>. Digite o código de 8 dígitos recebido no seu e-mail:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <input
                      type="text"
                      maxLength={8}
                      value={inputEmailCode}
                      onChange={(e) => {
                        setInputEmailCode(e.target.value.replace(/\D/g, ''));
                        if (emailVerificationError) setEmailVerificationError('');
                      }}
                      placeholder="00000000"
                      className="px-4 py-3 bg-[#101B1E] border border-white/20 rounded-xl text-lg font-black text-center text-white tracking-widest focus:outline-none focus:border-[#FF7F5B] w-full sm:w-52 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600 shadow-inner"
                    />

                    <button
                      disabled={isVerifyingOtp || inputEmailCode.trim().length < 6}
                      onClick={async () => {
                        const token = inputEmailCode.trim();
                        if (!token) {
                          setEmailVerificationError('Por favor, digite o código recebido no seu e-mail.');
                          return;
                        }

                        setIsVerifyingOtp(true);
                        setEmailVerificationError('');
                        try {
                          // Validação real do token OTP para alteração de e-mail via Supabase Auth
                          const { data: authData, error: authError } = await supabase.auth.verifyOtp({
                            email: pendingEmail.trim().toLowerCase(),
                            token,
                            type: 'email_change'
                          });

                          if (authError) {
                            const { error: retryError } = await supabase.auth.verifyOtp({
                              email: pendingEmail.trim().toLowerCase(),
                              token,
                              type: 'email'
                            });

                            if (retryError) {
                              const { error: signupErr } = await supabase.auth.verifyOtp({
                                email: pendingEmail.trim().toLowerCase(),
                                token,
                                type: 'signup'
                              });
                              if (signupErr) {
                                throw new Error('Código inválido ou expirado. Verifique os dígitos e tente novamente.');
                              }
                            }
                          }

                          // Código validado com sucesso! Atualiza no banco Supabase e no AuthContext
                          if (updateUser) {
                            await updateUser({
                              name: userName.trim(),
                              phone: userPhone.trim(),
                              email: pendingEmail.trim().toLowerCase()
                            });
                            setConfirmedEmail(pendingEmail.trim().toLowerCase());
                            checkCriandoRaizes();
                          }

                          if (refreshUserFromBackend) {
                            await refreshUserFromBackend();
                          }

                          setIsVerifyingEmailCode(false);
                          setIsEditingProfile(false);
                          showToast('success', 'E-mail atualizado com sucesso! ✨');
                        } catch (err: any) {
                          setEmailVerificationError(err.message || 'Código inválido. Tente novamente.');
                        } finally {
                          setIsVerifyingOtp(false);
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Validando Código...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmar Código ✨</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={resendCooldown > 0 || isSendingOtp}
                      onClick={async () => {
                        setIsSendingOtp(true);
                        setEmailVerificationError('');
                        try {
                          const { error: resendErr } = await supabase.auth.updateUser({
                            email: pendingEmail.trim().toLowerCase()
                          });

                          if (resendErr) {
                            throw resendErr;
                          }

                          setResendCooldown(60);
                          showToast('success', 'Novo código enviado para sua caixa de entrada!');
                        } catch (err: any) {
                          setEmailVerificationError(err.message || 'Erro ao reenviar código.');
                        } finally {
                          setIsSendingOtp(false);
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-white px-2 py-2 cursor-pointer disabled:opacity-40 transition-colors text-center"
                    >
                      {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar Código'}
                    </button>
                  </div>

                  {emailVerificationError && (
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{emailVerificationError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {userName}
                </h1>
              </div>

              <div className="mt-2 mb-4">
                <button
                  onClick={() => setIsLevelsModalOpen(true)}
                  className="bg-[#FF7F5B]/20 hover:bg-[#FF7F5B]/30 text-[#FF7F5B] text-xs font-bold px-3 py-1 rounded-xl border border-[#FF7F5B]/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm inline-flex"
                  title="Clique para ver os 15 Níveis de Evolução"
                >
                  <span>{userLevelInfo.icon}</span>
                  <span>{userLevelInfo.title}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail</span>
                  <span className="text-sm font-medium text-slate-300">{confirmedEmail}</span>
                </div>
                
                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Celular</span>
                  <span className="text-sm font-medium text-slate-300">{userPhone || 'Não informado'}</span>
                </div>

                <button
                  onClick={() => {
                    setPendingEmail(confirmedEmail);
                    setIsEditingProfile(true);
                  }}
                  className="ml-0 sm:ml-2 mt-2 sm:mt-0 text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 active:scale-95 shrink-0"
                  title="Editar Perfil"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Toggle */}
          <button
            onClick={async () => {
              const nextVal = !notificationsEnabled;
              setNotificationsEnabled(nextVal);
              if (updateUser) {
                await updateUser({ notificationsEnabled: nextVal });
              }
              if (nextVal) {
                awardBadge('b3');
              }
            }}
            className={`text-xs font-bold flex items-center gap-2 transition-all px-4 py-2 rounded-xl border active:scale-95 shadow-md ${
              notificationsEnabled 
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 hover:bg-amber-400/30' 
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title={notificationsEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}
          >
            <Bell className="w-4 h-4" />
            <span>{notificationsEnabled ? 'Notificações Ligadas' : 'Ligar Notificações'}</span>
          </button>
        </div>
      </section>

      {/* 📝 Um pouquinho sobre mim & 👶 Minha Família */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 📝 Um pouquinho sobre mim... (Bio Card - Esquerda) */}
        <div className="bg-[#101B1E] p-6 rounded-3xl border border-white/10 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-[#FF7F5B] uppercase tracking-wider flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#FF7F5B]" />
                Um pouquinho sobre mim...
              </h3>
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingBio ? 'Salvar' : 'Editar'}</span>
              </button>
            </div>

            {isEditingBio ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={4}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Escreva uma breve apresentação sobre você..."
                  className="w-full p-3.5 bg-[#070D0F] border border-[#FF7F5B]/50 rounded-2xl text-base sm:text-xs text-white focus:outline-none transition-all resize-none"
                />
                <button
                  onClick={async () => {
                    setIsEditingBio(false);
                    if (updateUser) {
                      await updateUser({ bio: bioText });
                      checkCriandoRaizes();
                    }
                  }}
                  className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic leading-relaxed bg-[#070D0F] p-4 rounded-2xl border border-white/10 flex-1">
                {bioText ? `"${bioText}"` : <span className="text-slate-400 not-italic">Divida conosco um pouquinho sobre você! ✨</span>}
              </p>
            )}
          </div>
        </div>

        {/* 👶 Minha Família (Direita) */}
        <div className="bg-[#101B1E] p-6 rounded-3xl border border-white/10 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-extrabold text-[#FF7F5B] uppercase tracking-wider flex items-center gap-2">
              <Baby className="w-5 h-5 text-[#FF7F5B]" />
              Minha Família
            </h3>
            <button
              onClick={async () => {
                if (isEditingChildren) {
                  // Auto-save if user filled name and age/pregnancy
                  const isPregnancy = newChildEmoji === '🤰';
                  const computedAge = isPregnancy ? pregnancyMonth : resolveChildAge(newChildBirthdate);
                  const childName = isPregnancy ? (newChildName.trim() || 'Gestante') : newChildName.trim();
                  if (childName && (isPregnancy ? !!pregnancyMonth : !!computedAge)) {
                    const newChild = {
                      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `child-${Date.now()}`,
                      emoji: newChildEmoji,
                      name: childName,
                      age: computedAge,
                      birthdate: isPregnancy ? undefined : newChildBirthdate,
                      isPregnancy: isPregnancy
                    };
                    const next = [...childrenList, newChild];
                    setChildrenList(next);
                    setNewChildName('');
                    setNewChildBirthdate('');
                    setPregnancyMonth('');
                    if (updateUser) {
                      await updateUser({ children: next });
                      checkCriandoRaizes();
                    }
                  }
                  setIsEditingChildren(false);
                } else {
                  setIsEditingChildren(true);
                }
              }}
              className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingChildren ? 'Fechar' : 'Editar'}</span>
            </button>
          </div>

          {isEditingChildren ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {childrenList.map((child) => (
                  <div key={child.id} className="bg-[#070D0F] border border-white/15 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-2xl p-1.5 bg-white/5 rounded-xl border border-white/10 shrink-0">{child.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-white block truncate">{child.name}</span>
                        <span className="text-xs text-slate-400 font-semibold block">{child.age}</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const next = childrenList.filter(c => c.id !== child.id);
                        setChildrenList(next);
                        if (updateUser) await updateUser({ children: next });
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                      title="Remover"
                      aria-label="Remover filho(a)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form to Add Child */}
              <div className="bg-[#070D0F] p-3.5 rounded-2xl border border-[#FF7F5B]/30 space-y-3">
                <span className="text-xs font-bold text-[#FF7F5B] uppercase tracking-wider block">A FAMÍLIA CRESCEU?</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newChildEmoji}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewChildEmoji(val);
                      if (val === '🤰') {
                        setNewChildName('Gestante');
                      } else if (newChildName === 'Gestante') {
                        setNewChildName('');
                      }
                    }}
                    className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="👦">👦 Menino</option>
                    <option value="👧">👧 Menina</option>
                    <option value="🤰">🤰 Gestante</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Nome do filho(a)"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none placeholder-slate-500 font-bold"
                  />

                  {newChildEmoji === '🤰' ? (
                    <select
                      value={pregnancyMonth}
                      onChange={(e) => setPregnancyMonth(e.target.value)}
                      className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2.5 text-base sm:text-xs text-purple-200 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="" disabled hidden>Quantos meses?</option>
                      <option value="1º mês">1º mês</option>
                      <option value="2º mês">2º mês</option>
                      <option value="3º mês">3º mês</option>
                      <option value="4º mês">4º mês</option>
                      <option value="5º mês">5º mês</option>
                      <option value="6º mês">6º mês</option>
                      <option value="7º mês">7º mês</option>
                      <option value="8º mês">8º mês</option>
                      <option value="9º mês">9º mês</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Data (DD/MM/AAAA) ou Idade"
                      value={newChildBirthdate}
                      onChange={(e) => setNewChildBirthdate(formatBirthdateMask(e.target.value))}
                      className="bg-[#101B1E] border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none w-full placeholder-slate-500 font-medium"
                    />
                  )}
                </div>

                <button
                  onClick={async () => {
                    const isPregnancy = newChildEmoji === '🤰';
                    const computedAge = isPregnancy ? pregnancyMonth : resolveChildAge(newChildBirthdate);
                    const childName = isPregnancy ? (newChildName.trim() || 'Gestante') : newChildName.trim();

                    if (!childName || (!isPregnancy && !computedAge)) return;

                    const newChild = {
                      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `child-${Date.now()}`,
                      emoji: newChildEmoji,
                      name: childName,
                      age: computedAge,
                      birthdate: isPregnancy ? undefined : newChildBirthdate,
                      isPregnancy: isPregnancy
                    };

                    const next = [...childrenList, newChild];
                    setChildrenList(next);
                    setNewChildName('');
                    setNewChildBirthdate('');
                    setPregnancyMonth('');

                    if (updateUser) {
                      await updateUser({ children: next });
                      checkCriandoRaizes();
                    }
                  }}
                  disabled={
                    (newChildEmoji === '🤰' && !pregnancyMonth) ||
                    (newChildEmoji !== '🤰' && (!newChildName.trim() || !newChildBirthdate.trim()))
                  }
                  className="w-full bg-[#FF7F5B] hover:bg-[#e06847] disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  + Adicionar Filho(a)
                </button>
              </div>
            </div>
          ) : childrenList.length === 0 ? (
            <div 
              onClick={() => setIsEditingChildren(true)}
              className="bg-[#070D0F] border border-dashed border-white/20 hover:border-[#FF7F5B]/50 p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all hover:bg-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF7F5B]/10 text-[#FF7F5B] flex items-center justify-center mx-auto text-xl font-bold">
                +
              </div>
              <span className="text-xs text-[#FF7F5B] font-bold block underline">Está grávida ou tem filhos. Conte para a gente!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 shadow-md ${
                    child.isPregnancy
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/40'
                      : 'bg-[#070D0F] border-white/15'
                  }`}
                >
                  {/* Icon on the Left - Larger */}
                  <div className="text-3xl shrink-0 p-2 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                    {child.emoji}
                  </div>

                  {/* Name and Age directly to the right */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate">
                      {child.name}
                    </h4>
                    <span className="text-xs text-slate-300 font-semibold block mt-0.5">
                      {child.age}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 🌿 Card Minha Evolução */}
      <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/5 rounded-2xl border border-white/10">{userLevelInfo.icon}</span>
            <div>
              <span className="text-xs font-extrabold text-[#FF7F5B] uppercase tracking-wider block">Minha Evolução</span>
              <h3 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {userLevelInfo.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsLevelsModalOpen(true)}
            className="text-xs font-bold text-[#FF7F5B] hover:text-[#FFD166] bg-[#FF7F5B]/10 hover:bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 w-fit"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Ver todos os 15 níveis →</span>
          </button>
        </div>

        {/* Poetic description: "O que isso diz sobre você" */}
        <p className="text-xs text-slate-200 italic bg-[#070D0F] p-4 rounded-2xl border border-white/10 leading-relaxed">
          "{userLevelInfo.description}"
        </p>

        {/* Progress Bar towards Next Level */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">
              Progresso {userLevelInfo.nextLevelTitle ? `para ${userLevelInfo.nextLevelTitle}` : 'Máximo Alcançado!'}
            </span>
            <span className="text-[#FFD166]">
              Pontos: {user.xp}{userLevelInfo.nextLevelXp ? `/${userLevelInfo.nextLevelXp}` : ''}
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF7F5B] to-[#FFD166] rounded-full transition-all duration-500"
              style={{ width: `${userLevelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Modal das 15 Árvores de Evolução */}
      {isLevelsModalOpen && (
        <UserLevelsModal
          currentXp={user.xp}
          onClose={() => setIsLevelsModalOpen(false)}
        />
      )}

      {/* 💬 Meus Depoimentos Recebidos (Com Aprovação/Negação) */}
      <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#E66795] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Quote className="w-5 h-5 text-[#E66795]" />
            Depoimentos Recebidos ({testimonials.length})
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {testimonials.filter(t => t.status === 'pendente').length} Pendentes
            </span>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {testimonials.filter(t => t.status === 'aprovado').length} Publicados
            </span>
          </div>
        </div>

        {/* List of Testimonials with Approve / Deny Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className={`p-4 rounded-2xl border space-y-3 relative overflow-hidden flex flex-col justify-between transition-all ${
              t.status === 'pendente' 
                ? 'bg-gradient-to-b from-amber-500/10 to-[#070D0F] border-amber-500/40 shadow-lg' 
                : 'bg-[#070D0F] border-white/10'
            }`}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={t.authorAvatar}
                      alt={t.authorName}
                      className="w-9 h-9 rounded-full object-cover border border-white/15"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-white">{t.authorName}</h5>
                      <span className="text-[10px] text-slate-400 block">{t.createdAt}</span>
                    </div>
                  </div>

                  {t.status === 'pendente' ? (
                    <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Aguardando aprovação
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Publicado no perfil
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#101B1E] p-3 rounded-xl border border-white/5 italic">
                  "{t.content}"
                </p>
              </div>

              {/* Action Buttons for Pending or Approved Testimonials */}
              {t.status === 'pendente' ? (
                <div className="pt-2 flex items-center gap-2 border-t border-white/10">
                  <button
                    onClick={() => handleApproveTestimonial(t.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar e Exibir no meu Perfil</span>
                  </button>
                  <button
                    onClick={() => handleDenyTestimonial(t.id)}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Negar</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
                  <div className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>{t.likesCount || 1} afetos</span>
                  </div>
                  <button
                    onClick={() => handleDenyTestimonial(t.id)}
                    className="text-slate-400 hover:text-rose-400 text-[10px] font-bold underline transition-colors"
                  >
                    Remover do perfil
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 👥 Minha Rede de Apoio */}
      <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Users className="w-5 h-5 text-[#FF7F5B]" />
            Minha Rede de Apoio
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Membros que estou acompanhando
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {followedMembers.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedFollowedProfile(member)}
              className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 hover:border-[#FF7F5B]/50 transition-all cursor-pointer group flex items-center gap-3 shadow-md"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover border border-white/20 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF7F5B] transition-colors">
                  {member.name}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {member.levelIcon} {member.levelName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for viewing followed member public profile */}
      {selectedFollowedProfile && (
        <PublicProfileModal
          profile={selectedFollowedProfile}
          onClose={() => setSelectedFollowedProfile(null)}
        />
      )}

      {/* Purchased Journeys Section */}
      <section className="space-y-4">
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Minhas Jornadas ({purchasedJourneys.length})
          </h2>
          <div className="flex items-center gap-3">
            {purchasedJourneys.length > 0 && (
              <button
                onClick={() => {
                  setIsNotebookOpen(true);
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className="bg-[#FF7F5B]/20 hover:bg-[#FF7F5B]/30 text-[#FF7F5B] border border-[#FF7F5B]/40 text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              >
                <BookOpen className="w-4 h-4 text-[#FFD166]" />
                <span>Minhas Anotações (PDF)</span>
              </button>
            )}
            <button
              onClick={onExploreCatalog}
              className="text-xs font-bold text-[#FF7F5B] hover:underline"
            >
              Explore novas jornadas →
            </button>
          </div>
        </div>

        {purchasedJourneys.length === 0 ? (
          <div className="bg-[#101B1E] rounded-3xl p-8 text-center border border-white/10 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Você ainda não adquiriu nenhum módulo.</h3>
            <p className="text-xs text-slate-400">Adquira qualquer uma das 06 jornadas de conhecimento para ter acesso vitalício aos conteúdos.</p>
            <button
              onClick={onExploreCatalog}
              className="mt-2 bg-[#FF7F5B] hover:bg-[#e06847] text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl"
            >
              Ver Catálogo de Módulos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchasedJourneys.map(journey => {
              const totalLessons = journey.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              const completedInJourney = journey.modules
                .flatMap(m => m.lessons)
                .filter(l => user.completedLessonIds.includes(l.id)).length;
              const progressPercent = totalLessons > 0 ? Math.round((completedInJourney / totalLessons) * 100) : 0;

              return (
                <div key={journey.id} className="bg-[#101B1E] rounded-3xl p-6 border border-white/10 shadow-lg space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md"
                        style={{ backgroundColor: `${journey.themeColor}33`, color: journey.themeColor }}
                      >
                        {journey.subtitle}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {progressPercent}% Concluído
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {journey.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {journey.description}
                    </p>

                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%`, backgroundColor: journey.themeColor }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onStartLearning(journey)}
                      className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all hover:brightness-110"
                      style={{ backgroundColor: journey.themeColor }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Continuar Conteúdos
                    </button>

                    {progressPercent === 100 && (
                      <button
                        onClick={() => onOpenCertificate(journey)}
                        className="bg-[#FFD166] text-slate-900 p-3 rounded-xl font-bold text-xs shadow-md hover:scale-105 transition-all"
                        title="Ver Certificado"
                      >
                        <Award className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🎖️ Minhas Conquistas (Categorizadas em Sliders no Mobile e Grid no Desktop) */}
      <section className="space-y-4">
        <BadgeGallery unlockedBadges={user.badges} hideHeaderTitle={false} />
      </section>

      {/* Logout button */}
      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>

      {/* 📖 Caderno de Anotações Modal */}
      {isNotebookOpen && (
        <NotebookModal onClose={() => setIsNotebookOpen(false)} />
      )}

    </div>
  );
};

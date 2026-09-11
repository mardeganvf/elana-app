import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useJourneys } from '../context/JourneysContext';
import { useCommunity } from '../context/CommunityContext';
import { JOURNEYS_DATA as STATIC_JOURNEYS } from '../data/journeysData';
import { Journey, CommunityPost } from '../types';
import { Flame, Sparkles, Award, Play, BookOpen, LogOut, Baby, Camera, Quote, Heart, CheckCircle2, Plus, Users, Clock, X, Edit3, Bell, Mail, RefreshCw, AlertCircle, HelpCircle, Trash2, ArrowRight, MessageSquare, ChevronDown, LayoutDashboard, Shield } from 'lucide-react';
import { PublicProfileModal, PublicUserProfile } from '../components/community/PublicProfileModal';
import { getFollowedMembers, syncFollowedMembersFromSupabase, FOLLOWED_MEMBERS_CHANGED_EVENT } from '../lib/followService';
import { BadgeGallery, getUnlockedBadgesCount } from '../components/gamification/BadgeGallery';
import { UserLevelsModal } from '../components/gamification/UserLevelsModal';
import { NotebookModal } from '../components/gamification/NotebookModal';
import { getLevelFromXP, ALL_BADGES } from '../data/gamificationData';
import { uploadImageToStorage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { GENERIC_DEFAULT_AVATAR } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface DashboardPageProps {
  onStartLearning: (journey: Journey, lessonId?: string) => void;
  onOpenCertificate: (journey: Journey) => void;
  onExploreCatalog: () => void;
  onRestartTutorial?: () => void;
  onGoToCommunity?: () => void;
}

// Helper para máscara de celular brasileiro: (00) 00000-0000 ou (00) 0000-0000
const formatPhoneMask = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onStartLearning, onOpenCertificate, onExploreCatalog, onRestartTutorial, onGoToCommunity }) => {
  const { user, logout, updateUser, awardBadge, refreshUserFromBackend } = useAuth();
  const { fetchUserPosts, deletePost } = useCommunity();
  const { showToast } = useToast();

  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'badges' | 'posts'>('overview');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // User Authored Posts Management
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [visibleUserPostsCount, setVisibleUserPostsCount] = useState<number>(5);
  const [isLoadingUserPosts, setIsLoadingUserPosts] = useState(false);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setIsLoadingUserPosts(true);
      fetchUserPosts(user.id)
        .then(posts => {
          setUserPosts(posts);
          setVisibleUserPostsCount(5);
        })
        .finally(() => setIsLoadingUserPosts(false));
    }
  }, [user?.id]);

  const handleDeleteUserPost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    try {
      await deletePost(postToDelete.id);
      setUserPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      showToast('info', 'Publicação removida da plataforma com sucesso.');
      setPostToDelete(null);
    } catch (err) {
      showToast('error', 'Não foi possível remover a publicação no momento.');
    } finally {
      setIsDeletingPost(false);
    }
  };

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
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editingChildName, setEditingChildName] = useState('');
  const [editingChildAgeOrBirthdate, setEditingChildAgeOrBirthdate] = useState('');
  const [editingChildEmoji, setEditingChildEmoji] = useState('👦');
  const [editingPregnancyMonth, setEditingPregnancyMonth] = useState('');

  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthdate, setNewChildBirthdate] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState('');
  const [newChildEmoji, setNewChildEmoji] = useState('👦');

  // Helper calculation for birthdate (DD/MM/AAAA or YYYY-MM-DD or DD-MM-AAAA) to age in months/years
  const calculateAgeFromBirthdate = (birthdateStr?: string): string => {
    if (!birthdateStr || birthdateStr.length < 8) return '';
    const clean = birthdateStr.trim();
    let day = 0, month = 0, year = 0;

    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD (Supabase standard)
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        // DD-MM-YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    } else if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts[2]?.length === 4) {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else if (parts[0]?.length === 4) {
        // YYYY/MM/DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }
    }

    if (isNaN(day) || isNaN(month) || isNaN(year) || !year) return '';
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
    if (clean.includes('/') || clean.includes('-')) {
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
        const rawChildren = user.children || [];
        let hasChanges = false;
        const refreshedChildren = rawChildren.map(child => {
          if (child.isPregnancy) return child;
          // Recalcular idade dinamicamente a partir da data de nascimento se existir
          if (child.birthdate) {
            const calculated = calculateAgeFromBirthdate(child.birthdate);
            if (calculated && calculated !== child.age) {
              hasChanges = true;
              return { ...child, age: calculated };
            }
          }
          // Atualização específica do Leo (completou 16 anos)
          if (child.name?.toLowerCase().trim() === 'leo' && (child.age?.includes('15') || child.age === '15 anos')) {
            hasChanges = true;
            return { ...child, age: '16 anos' };
          }
          return child;
        });
        setChildrenList(refreshedChildren);
        if (hasChanges && updateUser) {
          updateUser({ children: refreshedChildren });
        }
      }
    }
  }, [user?.id, user?.bio, user?.name, user?.phone, user?.email, user?.children, user?.notificationsEnabled]);


  const formatBirthdateMask = (val: string): string => {
    if (/[a-zA-Z]/.test(val)) return val;
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  // Followed Members state
  const [followedMembers, setFollowedMembers] = useState<PublicUserProfile[]>(() => getFollowedMembers(user?.id));

  // Sincroniza membros acompanhados em tempo real
  useEffect(() => {
    const syncFollowed = () => {
      const list = getFollowedMembers(user?.id);
      setFollowedMembers(list);
      if (list.length >= 1) awardBadge('b54');
      if (list.length >= 10) awardBadge('b62');
      if (list.length >= 20) awardBadge('b63');
    };

    syncFollowed();
    if (user?.id) {
      syncFollowedMembersFromSupabase(user.id);
    }

    window.addEventListener(FOLLOWED_MEMBERS_CHANGED_EVENT, syncFollowed);
    window.addEventListener('storage', syncFollowed);

    return () => {
      window.removeEventListener(FOLLOWED_MEMBERS_CHANGED_EVENT, syncFollowed);
      window.removeEventListener('storage', syncFollowed);
    };
  }, [user?.id]);

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
          const approvedCount = data.filter(t => t.status === 'approved').length;
          if (approvedCount >= 1) awardBadge('b57'); // Afeto Recebido
          if (approvedCount >= 5) awardBadge('b71'); // Mural Florido (5)
          if (approvedCount >= 10) awardBadge('b72'); // Avalanche de Carinho (10)

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
    awardBadge('b57'); // Afeto Recebido
    const approvedCount = testimonials.filter(t => t.id === id || t.status === 'aprovado').length;
    if (approvedCount >= 5) awardBadge('b71');
    if (approvedCount >= 10) awardBadge('b72');
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

  const { journeys: dynamicJourneys } = useJourneys();
  const allJourneys = dynamicJourneys && dynamicJourneys.length > 0 ? dynamicJourneys : STATIC_JOURNEYS;
  const purchasedJourneys = allJourneys.filter(j => user.purchasedJourneyIds.includes(j.id));

  const userLevelInfo = getLevelFromXP(user.xp);

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-6xl mx-auto text-white -mt-4">
      
      {/* Header Profile Hero Card */}
      <section className="bg-[#101B1E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5 w-full md:w-auto">
            <div className="relative group cursor-pointer shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#FF7F5B] shadow-lg"
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
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLevelsModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 bg-[#070D0F] text-[#FFD166] p-1.5 rounded-full border-2 border-[#101B1E] cursor-pointer hover:scale-110 transition-transform z-20 flex items-center justify-center shadow-md" 
                title={`Clique para ver os 15 Níveis de Evolução (Nível ${userLevelInfo.level} • ${userLevelInfo.title})`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-2.5 pt-1 animate-fade-in flex-1">
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
                                showToast('success', 'Perfil atualizado com sucesso!');
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
                            const newEmail = pendingEmail.trim().toLowerCase();

                            // 1. Verificar o código OTP recebido no e-mail
                            const { error: changeErr } = await supabase.auth.verifyOtp({
                              email: newEmail,
                              token,
                              type: 'email_change'
                            });

                            if (changeErr) {
                              const { error: emailErr } = await supabase.auth.verifyOtp({
                                email: newEmail,
                                token,
                                type: 'email'
                              });

                              if (emailErr) {
                                throw new Error('Código inválido ou expirado. Verifique os dígitos e tente novamente.');
                              }
                            }

                            // 2. Chamar Edge Function com API Admin para garantir
                            //    que auth.users.email é atualizado com a service role key
                            const { data: fnData, error: fnErr } = await supabase.functions.invoke('update-user-email', {
                              body: { new_email: newEmail }
                            });

                            if (fnErr || fnData?.error) {
                              throw new Error(fnData?.error || fnErr?.message || 'Erro ao atualizar e-mail no servidor. Tente novamente.');
                            }

                            // 3. Atualizar o AuthContext local
                            if (updateUser) {
                              await updateUser({
                                name: userName.trim(),
                                phone: userPhone.trim(),
                                email: newEmail
                              });
                              setConfirmedEmail(newEmail);
                              checkCriandoRaizes();
                            }

                            if (refreshUserFromBackend) {
                              await refreshUserFromBackend();
                            }

                            setIsVerifyingEmailCode(false);
                            setIsEditingProfile(false);
                            showToast('success', 'E-mail atualizado com sucesso!');
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
                            <span>Confirmar Código</span>
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
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    {userName}
                  </h1>
                  {user.role === 'admin' ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      Administrador
                    </span>
                  ) : user.role === 'guide' ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Guia Parental
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Membro
                    </span>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setIsLevelsModalOpen(true)}
                    className="bg-[#FF7F5B]/15 hover:bg-[#FF7F5B]/25 text-[#FF7F5B] text-xs font-bold px-3 py-1 rounded-xl border border-[#FF7F5B]/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm inline-flex"
                    title="Clique para ver os 15 Níveis de Evolução"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Nível {userLevelInfo.level} • {userLevelInfo.title}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail</span>
                    <span className="font-medium text-slate-300">{confirmedEmail}</span>
                  </div>
                  
                  {userPhone && (
                    <>
                      <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Celular</span>
                        <span className="font-medium text-slate-300">{userPhone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Top-Right Profile Actions */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {!isEditingProfile && (
              <button
                onClick={() => {
                  setPendingEmail(confirmedEmail);
                  setIsEditingProfile(true);
                }}
                className="text-xs text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition-all bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 active:scale-95 shrink-0 cursor-pointer shadow-sm"
                title="Editar Perfil"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF7F5B]" />
                <span>Editar Perfil</span>
              </button>
            )}

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
              className={`text-xs font-bold flex items-center gap-2 transition-all px-3.5 py-2 rounded-xl border active:scale-95 shadow-sm cursor-pointer ${
                notificationsEnabled 
                  ? 'bg-amber-400/15 text-amber-300 border-amber-400/30 hover:bg-amber-400/25' 
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title={notificationsEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}
            >
              <Bell className={`w-3.5 h-3.5 ${notificationsEnabled ? 'text-amber-300 fill-current' : 'text-slate-400'}`} />
              <span>{notificationsEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}</span>
            </button>
          </div>
        </div>

        {/* Trajectory / Metrics Strip: 2 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-white/10">
          {/* Card 1: Evolução */}
          <div 
            onClick={() => setIsLevelsModalOpen(true)}
            className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 hover:border-[#FF7F5B]/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Evolução
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">{user.xp} Pontos</span>
                <span className="text-slate-400 text-[11px]">
                  {userLevelInfo.nextLevelXp ? `Próximo Nível: ${userLevelInfo.nextLevelXp} Pontos` : 'Nível Máximo'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF7F5B] to-[#FFD166] rounded-full transition-all duration-500"
                  style={{ width: `${userLevelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Conquistas */}
          <div 
            onClick={() => setActiveProfileTab('badges')}
            className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 hover:border-[#8A9A5B]/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Conquistas
              </span>
              <Award className="w-3.5 h-3.5 text-[#8A9A5B]" />
            </div>
            <div>
              <div className="text-sm font-black text-white group-hover:text-[#8A9A5B] transition-colors">
                Total: {ALL_BADGES.length} Conquistas | Conquistadas: {getUnlockedBadgesCount(user.badges)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {Math.round((getUnlockedBadgesCount(user.badges) / ALL_BADGES.length) * 100)}% concluído
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Segmented Profile Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#101B1E] rounded-2xl border border-white/10 shadow-lg overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveProfileTab('overview')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeProfileTab === 'overview'
              ? 'bg-[#FF7F5B] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('badges')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeProfileTab === 'badges'
              ? 'bg-[#FF7F5B] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Conquistas ({getUnlockedBadgesCount(user.badges)}/{ALL_BADGES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProfileTab('posts')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeProfileTab === 'posts'
              ? 'bg-[#FF7F5B] text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Minhas Publicações ({userPosts.length})</span>
        </button>
      </div>

      {/* Tab 1: Visão Geral */}
      {activeProfileTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Minhas Jornadas Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <BookOpen className="w-5 h-5 text-[#FF7F5B]" />
                <span>Minhas Jornadas ({purchasedJourneys.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                {purchasedJourneys.length > 0 && (
                  <button
                    onClick={() => {
                      setIsNotebookOpen(true);
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                    className="bg-[#FF7F5B]/20 hover:bg-[#FF7F5B]/30 text-[#FF7F5B] border border-[#FF7F5B]/40 text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#FFD166]" />
                    <span>Minhas Anotações (PDF)</span>
                  </button>
                )}
                <button
                  onClick={onExploreCatalog}
                  className="text-xs font-bold text-[#FF7F5B] hover:underline cursor-pointer"
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
                  className="mt-2 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl cursor-pointer"
                >
                  Ver Catálogo de Módulos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchasedJourneys.map(journey => {
                  const allLessonsInJourney = journey.modules.flatMap(m => m.lessons);
                  const totalLessons = allLessonsInJourney.length;
                  const completedInJourney = allLessonsInJourney.filter(l => user.completedLessonIds.includes(l.id)).length;
                  const progressPercent = totalLessons > 0 ? Math.round((completedInJourney / totalLessons) * 100) : 0;
                  const nextLesson = allLessonsInJourney.find(l => !user.completedLessonIds.includes(l.id)) || allLessonsInJourney[0];

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
                          onClick={() => onStartLearning(journey, nextLesson?.id)}
                          className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all hover:brightness-110 cursor-pointer"
                          style={{ backgroundColor: journey.themeColor }}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Continuar Conteúdos</span>
                        </button>

                        {progressPercent === 100 && (
                          <button
                            onClick={() => onOpenCertificate(journey)}
                            className="bg-[#FFD166] text-slate-900 p-3 rounded-xl font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
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

          {/* Um pouquinho sobre mim & Minha Família */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Um pouquinho sobre mim... (Bio Card - Esquerda) */}
            <div className="bg-[#101B1E] p-6 rounded-3xl border border-white/10 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-extrabold text-[#FF7F5B] uppercase tracking-wider flex items-center gap-2">
                    <Quote className="w-4 h-4 text-[#FF7F5B]" />
                    <span>Um pouquinho sobre mim...</span>
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditingBio) {
                        // Cancelar: descartar alterações e restaurar valor original
                        setBioText(user?.bio || '');
                        setIsEditingBio(false);
                      } else {
                        setIsEditingBio(true);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 active:scale-95 cursor-pointer"
                  >
                    {isEditingBio ? (
                      <X className="w-3.5 h-3.5" />
                    ) : (
                      <Edit3 className="w-3.5 h-3.5" />
                    )}
                    <span>{isEditingBio ? 'Cancelar' : 'Editar'}</span>
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
                      className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 italic leading-relaxed bg-[#070D0F] p-4 rounded-2xl border border-white/10 flex-1">
                    {bioText ? `"${bioText}"` : <span className="text-slate-400 not-italic">Divida conosco um pouquinho sobre você.</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Minha Família (Direita) */}
            <div className="bg-[#101B1E] p-6 rounded-3xl border border-white/10 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-[#FF7F5B] uppercase tracking-wider flex items-center gap-2">
                  <Baby className="w-5 h-5 text-[#FF7F5B]" />
                  <span>Minha Família</span>
                </h3>
                <button
                  onClick={async () => {
                    if (isEditingChildren) {
                      setEditingChildId(null);
                      // Auto-save if user filled name and age/pregnancy
                      const isPregnancy = newChildEmoji === '🤰';
                      const computedAge = isPregnancy ? pregnancyMonth : resolveChildAge(newChildBirthdate);
                      const childName = isPregnancy ? (newChildName.trim() || 'Gestante') : newChildName.trim();
                      if (childName && (isPregnancy ? !!pregnancyMonth : !!computedAge)) {
                        let normalizedBirthdate: string | undefined = undefined;
                        if (newChildBirthdate.includes('/')) {
                          const parts = newChildBirthdate.split('/');
                          if (parts.length === 3 && parts[2].length === 4) {
                            normalizedBirthdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                          }
                        } else if (newChildBirthdate.includes('-')) {
                          normalizedBirthdate = newChildBirthdate;
                        }

                        const newChild = {
                          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `child-${Date.now()}`,
                          emoji: newChildEmoji,
                          name: childName,
                          age: computedAge,
                          birthdate: isPregnancy ? undefined : normalizedBirthdate,
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
                  className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingChildren ? 'Concluir' : 'Editar'}</span>
                </button>
              </div>

              {isEditingChildren ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {childrenList.map((child) => (
                      editingChildId === child.id ? (
                        <div key={child.id} className="col-span-1 sm:col-span-2 bg-[#070D0F] border border-[#FF7F5B]/50 p-4 rounded-2xl space-y-3 shadow-md animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#FF7F5B] uppercase tracking-wider">
                              Editar {child.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingChildId(null)}
                              className="text-slate-400 hover:text-white text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select
                              value={editingChildEmoji}
                              onChange={(e) => setEditingChildEmoji(e.target.value)}
                              className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
                            >
                              <option value="👦">Menino</option>
                              <option value="👧">Menina</option>
                              <option value="🤰">Gestante</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Nome"
                              value={editingChildName}
                              onChange={(e) => setEditingChildName(e.target.value)}
                              className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
                            />
                            {editingChildEmoji === '🤰' ? (
                              <select
                                value={editingPregnancyMonth}
                                onChange={(e) => setEditingPregnancyMonth(e.target.value)}
                                className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none cursor-pointer font-bold"
                              >
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
                                placeholder="DD/MM/AAAA ou Idade"
                                value={editingChildAgeOrBirthdate}
                                onChange={(e) => setEditingChildAgeOrBirthdate(formatBirthdateMask(e.target.value))}
                                className="bg-[#101B1E] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-medium"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <span className="text-[10px] text-slate-400">
                              Dica: Insira data completa (DD/MM/AAAA) para aniversários automáticos.
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingChildId(null)}
                                className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const isPregnancy = editingChildEmoji === '🤰';
                                  const computedAge = isPregnancy ? editingPregnancyMonth : resolveChildAge(editingChildAgeOrBirthdate);
                                  const childName = editingChildName.trim() || child.name;
                                  if (!childName || (!isPregnancy && !computedAge)) return;

                                  let normalizedBirthdate = child.birthdate;
                                  if (editingChildAgeOrBirthdate.includes('/')) {
                                    const parts = editingChildAgeOrBirthdate.split('/');
                                    if (parts.length === 3 && parts[2].length === 4) {
                                      normalizedBirthdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                    }
                                  } else if (!editingChildAgeOrBirthdate.includes('-')) {
                                    normalizedBirthdate = undefined;
                                  }

                                  const updated = childrenList.map(c => c.id === child.id ? {
                                    ...c,
                                    name: childName,
                                    emoji: editingChildEmoji,
                                    age: computedAge,
                                    birthdate: isPregnancy ? undefined : normalizedBirthdate,
                                    isPregnancy
                                  } : c);

                                  setChildrenList(updated);
                                  setEditingChildId(null);
                                  if (updateUser) await updateUser({ children: updated });
                                }}
                                className="px-4 py-1.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={child.id} className="bg-[#070D0F] border border-white/15 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-2xl p-1.5 bg-white/5 rounded-xl border border-white/10 shrink-0">{child.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-bold text-white block truncate">{child.name}</span>
                              <span className="text-xs text-slate-400 font-semibold block">
                                {child.birthdate ? (calculateAgeFromBirthdate(child.birthdate) || child.age) : child.age}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingChildId(child.id);
                                setEditingChildName(child.name);
                                setEditingChildEmoji(child.emoji || '👦');
                                const displayBirth = child.birthdate 
                                  ? (child.birthdate.includes('-') ? child.birthdate.split('-').reverse().join('/') : child.birthdate)
                                  : child.age;
                                setEditingChildAgeOrBirthdate(displayBirth);
                                setEditingPregnancyMonth(child.isPregnancy ? child.age : '1º mês');
                              }}
                              className="text-slate-400 hover:text-[#FF7F5B] p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                              title="Editar idade ou dados"
                              aria-label="Editar filho(a)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const next = childrenList.filter(c => c.id !== child.id);
                                setChildrenList(next);
                                if (updateUser) await updateUser({ children: next });
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-white/5 rounded-lg transition-colors shrink-0 cursor-pointer"
                              title="Remover"
                              aria-label="Remover filho(a)"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
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
                        <option value="👦">Menino</option>
                        <option value="👧">Menina</option>
                        <option value="🤰">Gestante</option>
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

                    <p className="text-[10px] text-slate-400 font-medium">
                      Dica: Digite a data de nascimento completa (DD/MM/AAAA) para atualizar a idade automaticamente a cada aniversário.
                    </p>

                    <button
                      onClick={async () => {
                        const isPregnancy = newChildEmoji === '🤰';
                        const computedAge = isPregnancy ? pregnancyMonth : resolveChildAge(newChildBirthdate);
                        const childName = isPregnancy ? (newChildName.trim() || 'Gestante') : newChildName.trim();

                        if (!childName || (!isPregnancy && !computedAge)) return;

                        let normalizedBirthdate: string | undefined = undefined;
                        if (newChildBirthdate.includes('/')) {
                          const parts = newChildBirthdate.split('/');
                          if (parts.length === 3 && parts[2].length === 4) {
                            normalizedBirthdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                          }
                        } else if (newChildBirthdate.includes('-')) {
                          normalizedBirthdate = newChildBirthdate;
                        }

                        const newChild = {
                          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `child-${Date.now()}`,
                          emoji: newChildEmoji,
                          name: childName,
                          age: computedAge,
                          birthdate: isPregnancy ? undefined : normalizedBirthdate,
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
                          {child.birthdate ? (calculateAgeFromBirthdate(child.birthdate) || child.age) : child.age}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Minha Rede de Apoio */}
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Users className="w-5 h-5 text-[#FF7F5B]" />
                  <span>Minha Rede de Apoio</span>
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Total: {followedMembers.length}
              </span>
            </div>

            {followedMembers.length === 0 ? (
              <div className="text-center py-8 px-4 bg-[#070D0F]/60 rounded-2xl border border-dashed border-white/10 space-y-3">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  Você ainda não está acompanhando nenhum membro.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ao visitar publicações na Comunidade e clicar no perfil de outros pais, mães ou guias, clique em <strong>"Acompanhar"</strong> para adicioná-los à sua Rede de Apoio!
                </p>
                {onGoToCommunity && (
                  <button
                    onClick={onGoToCommunity}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#FF7F5B]/15 hover:bg-[#FF7F5B]/25 text-[#FF7F5B] text-xs font-bold rounded-xl border border-[#FF7F5B]/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Explorar membros na Comunidade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {followedMembers.map(member => (
                  <div
                    key={member.id || member.name}
                    onClick={() => setSelectedFollowedProfile(member)}
                    className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 hover:border-[#FF7F5B]/50 transition-all cursor-pointer group flex items-center gap-3 shadow-md hover:bg-white/[0.02]"
                  >
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/20 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF7F5B] transition-colors">
                        {member.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Sparkles className="w-3 h-3 text-[#FFD166]" />
                        <span>{member.levelName || 'Semente Curiosa'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Depoimentos Recebidos */}
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#E66795] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Quote className="w-5 h-5 text-[#E66795]" />
                <span>Depoimentos Recebidos ({testimonials.length})</span>
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{testimonials.filter(t => t.status === 'pendente').length} Pendentes</span>
                </span>
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{testimonials.filter(t => t.status === 'aprovado').length} Publicados</span>
                </span>
              </div>
            </div>

            {testimonials.length === 0 ? (
              <div className="text-center py-8 px-4 bg-[#070D0F]/60 rounded-2xl border border-dashed border-white/10 space-y-2">
                <Quote className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  Nenhum depoimento recebido ainda.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Quando outros membros da comunidade deixarem mensagens de carinho no seu perfil, elas aparecerão aqui para sua aprovação.
                </p>
              </div>
            ) : (
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
                            <Clock className="w-3 h-3" />
                            <span>Aguardando aprovação</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Publicado no perfil</span>
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
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aprovar e Exibir no meu Perfil</span>
                        </button>
                        <button
                          onClick={() => handleDenyTestimonial(t.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
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
                          className="text-slate-400 hover:text-rose-400 text-[10px] font-bold underline transition-colors cursor-pointer"
                        >
                          Remover do perfil
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab 2: Conquistas & Evolução */}
      {activeProfileTab === 'badges' && (
        <div className="space-y-8 animate-fade-in">
          {/* Card Minha Evolução */}
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[#FFD166]">
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#FF7F5B] uppercase tracking-wider block">Minha Evolução</span>
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Nível {userLevelInfo.level} • {userLevelInfo.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLevelsModalOpen(true)}
                className="text-xs font-bold text-[#FF7F5B] hover:text-[#FFD166] bg-[#FF7F5B]/10 hover:bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 w-fit cursor-pointer"
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

          {/* Minhas Conquistas (Badge Gallery with Category Filter) */}
          <section className="space-y-4">
            <BadgeGallery unlockedBadges={user.badges} hideHeaderTitle={false} />
          </section>
        </div>
      )}

      {/* Tab 3: Minhas Publicações */}
      {activeProfileTab === 'posts' && (
        <div className="space-y-8 animate-fade-in">
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8A9A5B]/20 border border-[#8A9A5B]/40 flex items-center justify-center text-[#8A9A5B] shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    Minhas Publicações
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gerencie todas as publicações de sua autoria na plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  {userPosts.length > 5 
                    ? `${Math.min(visibleUserPostsCount, userPosts.length)} de ${userPosts.length} publicações`
                    : `${userPosts.length} ${userPosts.length === 1 ? 'publicação' : 'publicações'}`}
                </span>
                <button
                  onClick={() => {
                    if (user?.id) {
                      setIsLoadingUserPosts(true);
                      fetchUserPosts(user.id)
                        .then(posts => {
                          setUserPosts(posts);
                          setVisibleUserPostsCount(5);
                        })
                        .finally(() => setIsLoadingUserPosts(false));
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Atualizar minhas publicações"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUserPosts ? 'animate-spin text-[#FF7F5B]' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingUserPosts ? (
              <div className="p-8 text-center bg-[#101B1E] rounded-3xl border border-white/10">
                <RefreshCw className="w-6 h-6 animate-spin text-[#FF7F5B] mx-auto mb-2" />
                <span className="text-xs text-slate-400">Carregando suas publicações...</span>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="p-8 text-center bg-[#101B1E] rounded-3xl border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#8A9A5B]/10 border border-[#8A9A5B]/20 flex items-center justify-center text-[#8A9A5B] mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Você ainda não fez nenhuma publicação</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Nossa comunidade é um espaço seguro de escuta e acolhimento. Compartilhe suas dúvidas, histórias ou desabafos com outros pais.
                  </p>
                </div>
                {onGoToCommunity && (
                  <button
                    onClick={onGoToCommunity}
                    className="inline-flex items-center gap-1.5 bg-[#8A9A5B] hover:bg-[#78884e] text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>Ir para a Comunidade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.slice(0, visibleUserPostsCount).map(post => {
                  const reactionsCount = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);
                  const commentsCount = post.comments?.length || 0;

                  return (
                    <div
                      key={post.id}
                      className="bg-[#101B1E] p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all space-y-3 relative group"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.isAnonymous ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <Shield className="w-3 h-3" />
                              <span>Post Anônimo no Confessionário</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30">
                              <MessageSquare className="w-3 h-3" />
                              <span>Publicação Aberta</span>
                            </span>
                          )}

                          {post.status === 'sob_moderacao' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              <span>Em Moderação</span>
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {post.createdAt}
                          </span>
                        </div>

                        <button
                          onClick={() => setPostToDelete(post)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-400 p-1.5 sm:px-3 sm:py-1 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                          title="Excluir publicação da plataforma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Excluir Post</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#8A9A5B]" />
                            {commentsCount} {commentsCount === 1 ? 'resposta' : 'respostas'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-[#E66795]" />
                            {reactionsCount} {reactionsCount === 1 ? 'reação' : 'reações'}
                          </span>
                        </div>

                        {post.isAnonymous && (
                          <span className="text-[10px] italic text-purple-300/80">
                            Publicado como: {post.authorName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {visibleUserPostsCount < userPosts.length && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleUserPostsCount(prev => prev + 5)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all border border-white/10 hover:border-white/20 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ChevronDown className="w-4 h-4 text-[#8A9A5B]" />
                      <span>Carregar mais 5 publicações</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({userPosts.length - visibleUserPostsCount} restantes)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Footer Actions: Rever Tutorial & Sair da Conta */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {onRestartTutorial && (
          <button
            onClick={onRestartTutorial}
            className="flex items-center justify-center gap-2 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#FF7F5B]" />
            <span>Rever Tutorial de Boas-Vindas</span>
          </button>
        )}
        <div className="flex justify-end">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>

      {/* Caderno de Anotações Modal */}
      {isNotebookOpen && (
        <NotebookModal onClose={() => setIsNotebookOpen(false)} />
      )}

      {/* Níveis de Evolução Modal */}
      {isLevelsModalOpen && (
        <UserLevelsModal
          currentXp={user.xp}
          onClose={() => setIsLevelsModalOpen(false)}
        />
      )}

      {/* Perfil de Membro Acompanhado Modal */}
      {selectedFollowedProfile && (
        <PublicProfileModal
          profile={selectedFollowedProfile}
          onClose={() => setSelectedFollowedProfile(null)}
        />
      )}

      {/* Modal de Confirmação de Exclusão de Post */}
      {postToDelete && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-[#101B1E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-500/30 text-white space-y-5 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Excluir publicação?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tem certeza de que deseja retirar esta publicação da plataforma? Ela deixará de ser visível para todos os membros da comunidade.
              </p>
            </div>

            <div className="bg-[#070D0F] p-3.5 rounded-2xl border border-white/10 text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                {postToDelete.isAnonymous ? 'Confessionário (Anônimo)' : 'Comunidade'}
              </span>
              <p className="text-xs font-bold text-white truncate">
                "{postToDelete.title}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeletingPost}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteUserPost}
                disabled={isDeletingPost}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingPost ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Sim, Excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

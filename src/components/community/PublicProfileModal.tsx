import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Flame, 
  MessageSquare, 
  Heart, 
  Calendar, 
  Send, 
  CheckCircle2, 
  EyeOff,
  UserCheck,
  Baby,
  Quote,
  Smile,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BadgeGallery } from '../gamification/BadgeGallery';
import { UserLevelsModal } from '../gamification/UserLevelsModal';
import { JOURNEYS_DATA } from '../../data/journeysData';
import { getLevelFromXP } from '../../data/gamificationData';
import { supabase } from '../../lib/supabase';

export interface ChildInfo {
  id: string;
  name?: string;
  age: string;
}

export interface ProfileTestimonial {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount?: number;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  avatar: string;
  role?: 'membro' | 'guia' | 'curadoria';
  tag?: string;
  levelName?: string;
  levelIcon?: string;
  levelNumber?: number;
  xp?: number;
  bio?: string;
  joinedDate?: string;
  streakDays?: number;
  postsCount?: number;
  commentsCount?: number;
  reactionsReceivedCount?: number;
  isAnonymous?: boolean;
  children?: ChildInfo[];
  testimonials?: ProfileTestimonial[];
  badges?: any[];
  recentPosts?: Array<{ id: string; title: string; createdAt: string; commentsCount: number }>;
}

interface PublicProfileModalProps {
  profile: PublicUserProfile;
  onClose: () => void;
  onSendSupport?: (authorName: string) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  profile,
  onClose,
  onSendSupport
}) => {
  const { user } = useAuth();
  const isOwnProfile = Boolean(user && (user.id === profile.id || profile.name === user.name));
  const [isFollowing, setIsFollowing] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  // Children info state
  const [childrenList] = useState<ChildInfo[]>(profile.children || [
    { id: '1', name: 'Cecília', age: '8 meses' },
    { id: '2', name: 'Theo', age: '3 anos' }
  ]);

  // Testimonials state (Estilo Orkut)
  const [testimonials, setTestimonials] = useState<ProfileTestimonial[]>(profile.testimonials || [
    {
      id: 't1',
      authorName: 'Mariana Santos',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: 'A Maria é um anjo nesta comunidade! Me acolheu com palavras tão calmas durante a madrugada mais difícil da amamentação da Cecília. Gratidão eterna por essa luz! ✨💖',
      createdAt: 'Há 2 dias',
      likesCount: 12
    },
    {
      id: 't2',
      authorName: 'Camila Rodrigues',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      content: 'Pessoa maravilhosa e super dedicada. Suas respostas sempre transmitem paz e zero julgamento. Orgulho de ter você na nossa rede de apoio! 🌿🌸',
      createdAt: 'Há 1 semana',
      likesCount: 8
    }
  ]);

  const [newTestimonial, setNewTestimonial] = useState('');
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);

  const handleSupportClick = () => {
    setSupportSent(true);
    if (onSendSupport) {
      onSendSupport(profile.name);
    }
    setTimeout(() => {
      setSupportSent(false);
    }, 4000);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.trim()) return;

    const testimonial: ProfileTestimonial = {
      id: `t-${Date.now()}`,
      authorName: user?.name || 'Membro da Rede',
      authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: newTestimonial.trim(),
      createdAt: 'Agora mesmo',
      likesCount: 1
    };

    setTestimonials(prev => [testimonial, ...prev]);
    setNewTestimonial('');
    setTestimonialSuccess(true);

    // Gravar no Supabase
    try {
      await supabase.from('profile_testimonials').insert([{
        recipient_profile_id: (profile.id && profile.id.length > 20) ? profile.id : null,
        author_id: user?.id || null,
        author_name: user?.name || 'Membro da Rede',
        author_avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: newTestimonial.trim(),
        status: 'approved'
      }]);
    } catch (err) {
      console.error('Error saving testimonial to Supabase:', err);
    }

    setTimeout(() => setTestimonialSuccess(false), 3500);
  };

  const xp = profile.xp || 650;
  const levelInfo = getLevelFromXP(xp);
  const streakDays = profile.streakDays || 5;
  const postsCount = profile.postsCount ?? 12;
  const commentsCount = profile.commentsCount ?? 34;
  const reactionsReceived = profile.reactionsReceivedCount ?? 89;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white overflow-y-auto">
      <div className="bg-[#101B1E] rounded-3xl max-w-xl w-full border border-white/15 shadow-2xl relative overflow-hidden my-8 animate-scale-up max-h-[90vh] flex flex-col">
        
        {/* Header Background Banner */}
        <div className="h-28 bg-gradient-to-r from-[#E66795]/30 via-[#FF7F5B]/30 to-[#8A9A5B]/30 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10"
            title="Fechar Perfil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="px-6 sm:px-8 pb-8 relative -mt-12 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#101B1E] shadow-xl"
              />
              <span 
                onClick={() => setIsLevelsModalOpen(true)}
                className="absolute bottom-0 right-0 bg-[#FF7F5B] text-white p-1.5 rounded-full border-2 border-[#101B1E] text-xs cursor-pointer hover:scale-110 transition-transform" 
                title={`Clique para ver os 15 Níveis de Evolução (${levelInfo.title})`}
              >
                {levelInfo.icon}
              </span>
            </div>

            {/* Support / Follow Action Buttons */}
            {!profile.isAnonymous && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isFollowing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'Acompanhando' : 'Acompanhar'}</span>
                </button>

                <button
                  onClick={handleSupportClick}
                  disabled={supportSent}
                  className="flex items-center gap-1.5 bg-[#FF7F5B] hover:bg-[#e06847] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-80"
                >
                  {supportSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Carinho Enviado! 💖</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Apoio</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Name & Primary Badges */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {profile.name}
              </h2>

              <button
                onClick={() => setIsLevelsModalOpen(true)}
                className="bg-[#FF7F5B]/20 hover:bg-[#FF7F5B]/30 text-[#FF7F5B] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#FF7F5B]/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Clique para ver os Níveis de Desenvolvimento"
              >
                <span>{levelInfo.icon}</span>
                <span>{levelInfo.title}</span>
              </button>

              {profile.isAnonymous && (
                <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" /> Pseudônimo Confessionário
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" /> Membro desde {profile.joinedDate || 'Janeiro/2026'}
              </span>
            </div>
          </div>

          {/* Grade 2 Colunas: Bio na esquerda, Minha Família na direita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* 1. Um pouquinho sobre mim... (Bio) */}
            <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>✨</span> Um pouquinho sobre mim...
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic font-medium">
                  "{profile.bio || (profile.isAnonymous ? 'Espaço de confidencialidade e desabafo sem julgamentos.' : 'Vivendo um dia de cada vez, aprendendo sobre paciência, amor e criando memórias afetuosas com meus filhos.')}"
                </p>
              </div>
            </div>

            {/* 2. Minha Família */}
            <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#FF7F5B]" />
                  Minha Família
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {childrenList.map((child, idx) => (
                  <div key={child.id || idx} className="bg-[#101B1E] border border-white/10 p-2.5 rounded-xl flex items-center gap-3 shadow-sm">
                    <div className="text-2xl shrink-0 p-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                      👶
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{child.name || 'Filho(a)'}</h4>
                      <span className="text-[11px] text-slate-300 font-semibold block">{child.age}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Minha Evolução (Sem o botão de 15 níveis) */}
          <div className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1.5 bg-white/5 rounded-xl">{levelInfo.icon}</span>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Minha Evolução</span>
                  <span className="text-sm font-extrabold text-white">{levelInfo.title}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[#FF7F5B] text-xs font-bold bg-[#FF7F5B]/10 px-2.5 py-1 rounded-full border border-[#FF7F5B]/20">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{streakDays} dias conosco</span>
                </div>
              </div>
            </div>

            {/* Level Description ("O que isso diz sobre você") */}
            <p className="text-xs text-slate-300 italic bg-[#101B1E] p-2.5 rounded-xl border border-white/5 leading-relaxed">
              "{levelInfo.description}"
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Progresso {levelInfo.nextLevelTitle ? `para ${levelInfo.nextLevelTitle}` : 'Máximo'}</span>
                <span className="text-[#FFD166]">{xp} pontos {levelInfo.nextLevelXp ? `/ ${levelInfo.nextLevelXp}` : ''}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF7F5B] to-[#FFD166] rounded-full transition-all"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Modal das 15 Árvores de Evolução */}
          {isLevelsModalOpen && (
            <UserLevelsModal
              currentXp={xp}
              onClose={() => setIsLevelsModalOpen(false)}
            />
          )}

          {/* 5. Contadores de Engajamento */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#070D0F] p-3 rounded-2xl border border-white/5 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF7F5B]" />
                <span>Tópicos</span>
              </div>
              <span className="text-base font-black text-white">{postsCount}</span>
            </div>

            <div className="bg-[#070D0F] p-3 rounded-2xl border border-white/5 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Respostas</span>
              </div>
              <span className="text-base font-black text-white">{commentsCount}</span>
            </div>

            <div className="bg-[#070D0F] p-3 rounded-2xl border border-white/5 space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Apoios</span>
              </div>
              <span className="text-base font-black text-white">{reactionsReceived}</span>
            </div>
          </div>

          {/* 6. Minhas Jornadas Adquiridas (Exibido para o próprio perfil do usuário) */}
          {isOwnProfile && user && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#FFD166] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FFD166]" />
                  Minhas Jornadas ({user.purchasedJourneyIds?.length || 0})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {JOURNEYS_DATA.filter(j => user.purchasedJourneyIds?.includes(j.id)).map(j => (
                  <div key={j.id} className="bg-[#070D0F] p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{j.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{j.tagline}</p>
                    </div>
                    <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                      Ativa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Meus Depoimentos */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#E66795] uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-[#E66795]" />
                Meus Depoimentos ({testimonials.length})
              </h4>
            </div>

            {/* Form to leave a public testimonial (only for other members' profiles) */}
            {!isOwnProfile && (
              <form onSubmit={handleTestimonialSubmit} className="space-y-2.5 bg-[#070D0F] p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#FF7F5B]" />
                  <span className="text-xs font-bold text-white">Deixar um depoimento para {profile.name}</span>
                </div>
                <textarea
                  rows={2}
                  placeholder={`Escreva uma mensagem carinhosa ou depoimento público para ${profile.name}...`}
                  value={newTestimonial}
                  onChange={(e) => setNewTestimonial(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 text-xs bg-[#101B1E] text-white focus:outline-none focus:border-[#E66795] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#E66795] hover:bg-[#d45583] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Depoimento Público</span>
                  </button>
                </div>
              </form>
            )}

            {testimonialSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl text-emerald-300 text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Depoimento público publicado no perfil com sucesso! 💖</span>
              </div>
            )}

            {/* List of Testimonials */}
            <div className="space-y-3">
              {testimonials.map(t => (
                <div key={t.id} className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={t.authorAvatar}
                        alt={t.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-white/15"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-white">{t.authorName}</h5>
                        <span className="text-[10px] text-slate-400 block">{t.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{t.likesCount || 1}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#101B1E] p-3 rounded-xl border border-white/5 italic">
                    "{t.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Conquistas do Membro (ÚLTIMO ELEMENTO DO PERFIL) */}
          <div className="pt-4 border-t border-white/10">
            <BadgeGallery unlockedBadges={isOwnProfile && user ? user.badges : profile.badges} onlyUnlocked={!isOwnProfile} />
          </div>

          {/* Support feedback banner */}
          {supportSent && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl text-emerald-300 text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seu carinho foi enviado em caráter privado para {profile.name}! 💖</span>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};

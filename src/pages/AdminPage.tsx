import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock,
  LifeBuoy, 
  Upload, 
  Video, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Users, 
  TrendingUp, 
  Send, 
  AlertTriangle,
  Heart,
  Inbox,
  Trash2,
  RotateCcw,
  Search,
  Vote,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { supabase } from '../lib/supabase';

// Types for Admin Data
interface SOSTicket {
  id: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  urgency: 'alta' | 'media' | 'baixa';
  subject: string;
  message: string;
  createdAt: string;
  status: 'pendente' | 'atendido' | 'deletado';
  adminReply?: string;
  repliedAt?: string;
}

interface ModerationItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  roomName: string;
  content: string;
  flagReason: string;
  createdAt: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface MemberUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'membro' | 'guia';
  levelTitle: string;
  levelIcon: string;
  xp: number;
  joinedDays: number;
}

export interface AdminPageProps {
  onBackToHome?: () => void;
  onOpenLogin?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome, onOpenLogin }) => {
  const { user, isAuthenticated, replySosTicket } = useAuth();

  const isAdmin = Boolean(
    user && (
      user.role?.toLowerCase().includes('admin') || 
      user.role?.toLowerCase().includes('guia') ||
      user.email?.toLowerCase().includes('admin') ||
      user.email?.toLowerCase().includes('mardegan') ||
      user.email === 'helena@elana.com.br'
    )
  );

  const [activeAdminTab, setActiveAdminTab] = useState<'sos' | 'moderation' | 'analytics' | 'content' | 'users' | 'polls'>('sos');

  // 🗳️ Enquetes State
  const { polls, createPoll, togglePollStatus } = useCommunity();
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollCategory, setNewPollCategory] = useState('Rotina & Maternidade');
  const [newPollOptions, setNewPollOptions] = useState<string[]>(['', '', '']);
  const [isPublishingPoll, setIsPublishingPoll] = useState(false);
  const [pollSuccessMessage, setPollSuccessMessage] = useState(false);

  // 🛟 SOS Email Inbox Folder State
  const [sosFolder, setSosFolder] = useState<'inbox' | 'completed' | 'trash'>('inbox');
  const [sosSearchQuery, setSosSearchQuery] = useState('');
  const [sosUrgencyFilter, setSosUrgencyFilter] = useState<'todos' | 'alta' | 'media' | 'baixa'>('todos');

  // 🛟 SOS Tickets State with AI Urgency Classification
  const [sosTickets, setSosTickets] = useState<SOSTicket[]>([]);

  const [selectedSosTicket, setSelectedSosTicket] = useState<SOSTicket | null>(null);
  const [sosReplyText, setSosReplyText] = useState('');

  // 🛡️ Moderation Items State
  const [modItems, setModItems] = useState<ModerationItem[]>([]);

  // 👥 Members State
  const [members, setMembers] = useState<MemberUser[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      const { data } = await supabase
        .from('sos_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setSosTickets(data.map(t => ({
          id: t.id,
          userName: t.user_name || 'Anônimo',
          userEmail: t.user_email || '',
          userAvatar: t.user_avatar || '',
          urgency: t.urgency || 'media',
          subject: t.subject || '',
          message: t.message || '',
          createdAt: new Date(t.created_at).toLocaleString('pt-BR'),
          status: t.status || 'pendente',
          adminReply: t.admin_reply,
          repliedAt: t.replied_at ? new Date(t.replied_at).toLocaleString('pt-BR') : undefined
        })));
      }
    };
    loadTickets();

    const loadModeration = async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data && data.length > 0) {
        setModItems(data.map(p => ({
          id: p.id,
          authorName: p.author_name || 'Anônimo',
          authorAvatar: p.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          roomName: p.transversal_room_id || p.journey_id || 'Comunidade Geral',
          content: p.content,
          flagReason: p.is_anonymous ? 'Post em sala anônima' : 'Verificação preventiva de acolhimento',
          createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
          status: 'pendente'
        })));
      }
    };
    loadModeration();

    const loadMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setMembers(data.map(p => ({
          id: p.id,
          name: p.name || 'Sem nome',
          email: p.email || '',
          avatar: p.avatar || '',
          role: p.role || 'membro',
          levelTitle: p.level_name || 'Semente Plantada',
          levelIcon: p.level_icon || '🌱',
          xp: p.xp || 0,
          joinedDays: Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)
        })));
      }
    };
    loadMembers();
  }, []);

  // 🎬 Upload Form State
  const [selectedArea, setSelectedArea] = useState('Comunicação Não-Violenta');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [rewardPoints, setRewardPoints] = useState(15);
  const [hasCertificate, setHasCertificate] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 🛟 SOS Ticket Handlers
  const handleSendSosReply = async () => {
    if (!selectedSosTicket || !sosReplyText.trim()) return;
    const replyText = sosReplyText.trim();

    await supabase
      .from('sos_tickets')
      .update({ status: 'atendido', admin_reply: replyText, replied_at: new Date().toISOString() })
      .eq('id', selectedSosTicket.id);

    replySosTicket(replyText);
    setSosTickets(prev => prev.map(t => t.id === selectedSosTicket.id ? { 
      ...t, 
      status: 'atendido',
      adminReply: replyText,
      repliedAt: new Date().toLocaleString('pt-BR')
    } : t));
    setSelectedSosTicket(prev => prev ? { ...prev, status: 'atendido', adminReply: replyText, repliedAt: new Date().toLocaleString('pt-BR') } : null);
    setSosReplyText('');
  };

  const handleMoveToTrash = async (ticketId: string) => {
    await supabase.from('sos_tickets').update({ status: 'deletado' }).eq('id', ticketId);
    setSosTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'deletado' } : t));
    if (selectedSosTicket?.id === ticketId) {
      setSelectedSosTicket(null);
    }
  };

  const handleRestoreTicket = async (ticketId: string) => {
    await supabase.from('sos_tickets').update({ status: 'pendente' }).eq('id', ticketId);
    setSosTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'pendente' } : t));
    if (selectedSosTicket?.id === ticketId) {
      setSelectedSosTicket(prev => prev ? { ...prev, status: 'pendente' } : null);
    }
  };

  const handlePermanentDelete = (ticketId: string) => {
    setSosTickets(prev => prev.filter(t => t.id !== ticketId));
    if (selectedSosTicket?.id === ticketId) {
      setSelectedSosTicket(null);
    }
  };

  // Moderation Handlers
  const handleModerateItem = async (id: string, newStatus: 'aprovado' | 'rejeitado') => {
    setModItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    if (newStatus === 'rejeitado') {
      try {
        await supabase.from('community_posts').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting rejected post in Supabase:', err);
      }
    }
  };

  // Role Toggle Handler
  const handleToggleRole = async (userId: string) => {
    const target = members.find(m => m.id === userId);
    if (!target) return;
    const newRole = target.role === 'guia' ? 'membro' : 'guia';
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    } catch (err) {
      console.warn('Error updating member role in Supabase:', err);
    }
  };

  // Upload Submit Handler
  const handlePublishLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setLessonTitle('');
      setLessonDesc('');
      setVideoFile(null);
      setPdfFile(null);
    }, 3000);
  };

  // Filtered SOS Tickets for Email Inbox
  const filteredSosTickets = sosTickets.filter(t => {
    // Filter by Folder Status
    if (sosFolder === 'inbox' && t.status !== 'pendente') return false;
    if (sosFolder === 'completed' && t.status !== 'atendido') return false;
    if (sosFolder === 'trash' && t.status !== 'deletado') return false;

    // Filter by Urgency
    if (sosUrgencyFilter !== 'todos' && t.urgency !== sosUrgencyFilter) return false;

    // Filter by Search Query
    if (sosSearchQuery.trim()) {
      const q = sosSearchQuery.toLowerCase();
      return (
        t.userName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }

    return true;
  }).sort((a, b) => {
    // AI Urgency Priority Sorting for Inbox
    const urgencyOrder = { alta: 1, media: 2, baixa: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const pendingCount = sosTickets.filter(t => t.status === 'pendente').length;
  const completedCount = sosTickets.filter(t => t.status === 'atendido').length;
  const trashCount = sosTickets.filter(t => t.status === 'deletado').length;

  // Security Guard 1: User is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#101B1E] border border-red-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Acesso Restrito ao Painel
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Esta área administrativa é restrita e exige autenticação prévia com credenciais autorizadas.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="w-full py-3.5 px-4 bg-[#FF7F5B] hover:bg-[#FF7F5B]/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Fazer Login como Administrador
              </button>
            )}
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-white/10 active:scale-95 cursor-pointer"
              >
                Voltar para o Início
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Security Guard 2: User is logged in but does not have admin permissions
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#101B1E] border border-amber-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Acesso Não Autorizado (403)
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              O usuário <strong>{user.email}</strong> não possui privilégios de administrador no Elana Academy.
            </p>
          </div>
          <div className="pt-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-white/15 active:scale-95 cursor-pointer"
              >
                Voltar para a Página Inicial
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-6xl mx-auto text-white -mt-4">
      
      {/* Admin Header Hero */}
      <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#FF7F5B]/20 text-[#FF7F5B] rounded-2xl border border-[#FF7F5B]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Painel do Administrador & Guardião
              </h1>
              <span className="bg-[#FF7F5B] text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Elana Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Atendimento SOS, Moderação Antijulgamento, Gestão de Áreas e Saúde da Comunidade.
            </p>
          </div>
        </div>

        {/* Quick SOS Badge Counter */}
        <div className="flex items-center gap-3 bg-[#070D0F] px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <LifeBuoy className="w-5 h-5 text-[#FF7F5B] animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chamados SOS Pendentes</span>
            <span className="text-sm font-black text-amber-400">
              {pendingCount} aguardando atendimento
            </span>
          </div>
        </div>
      </section>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('sos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'sos'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Atendimento SOS ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'moderation'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Moderação Antijulgamento ({modItems.filter(m => m.status === 'pendente').length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'analytics'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Termômetro Emocional</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('content')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'content'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload de Aulas & Áreas</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'users'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestão de Membros ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('polls')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shrink-0 border ${
            activeAdminTab === 'polls'
              ? 'bg-[#FF7F5B] text-slate-950 border-[#FF7F5B] shadow-lg scale-[1.02]'
              : 'bg-[#101B1E] text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Enquetes Interativas ({polls.length})</span>
        </button>
      </div>

      {/* TAB 1: 🛟 ATENDIMENTO SOS (EMAIL INBOX STYLE) */}
      {activeAdminTab === 'sos' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <LifeBuoy className="w-5 h-5 text-[#FF7F5B]" />
                Atendimento SOS
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acolha com empatia e carinho aos chamados pela comunidade em momentos de exaustão.
              </p>
            </div>

            {/* Urgency Filter Pills (Without 'Triagem IA' title) */}
            <div className="flex items-center gap-1.5 bg-[#070D0F] p-1.5 rounded-2xl border border-white/10 self-start sm:self-center">
              <button
                onClick={() => setSosUrgencyFilter('todos')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  sosUrgencyFilter === 'todos' ? 'bg-[#FF7F5B] text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSosUrgencyFilter('alta')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  sosUrgencyFilter === 'alta' ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10'
                }`}
                title="Filtrar Urgência Alta"
              >
                🔴
              </button>
              <button
                onClick={() => setSosUrgencyFilter('media')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  sosUrgencyFilter === 'media' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
                title="Filtrar Urgência Média"
              >
                🟡
              </button>
              <button
                onClick={() => setSosUrgencyFilter('baixa')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  sosUrgencyFilter === 'baixa' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
                title="Filtrar Urgência Baixa"
              >
                🟢
              </button>
            </div>
          </div>

          {/* Email Inbox Layout Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sub-Folder Navigation (3 cols) */}
            <div className="lg:col-span-3 space-y-2">
              <div className="bg-[#070D0F] p-3 rounded-2xl border border-white/10 space-y-1 text-left">
                <button
                  onClick={() => {
                    setSosFolder('inbox');
                    setSelectedSosTicket(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                    sosFolder === 'inbox'
                      ? 'bg-[#FF7F5B] text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4" />
                    <span>Caixa de Entrada</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      sosFolder === 'inbox' ? 'bg-slate-950 text-white' : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSosFolder('completed');
                    setSelectedSosTicket(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                    sosFolder === 'completed'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Finalizados</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {completedCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSosFolder('trash');
                    setSelectedSosTicket(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition-all text-left cursor-pointer ${
                    sosFolder === 'trash'
                      ? 'bg-rose-500 text-white shadow-md font-black'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-slate-400" />
                    <span>Lixeira</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {trashCount}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  value={sosSearchQuery}
                  onChange={(e) => setSosSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#070D0F] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            </div>

            {/* Middle Column: Email Messages List (4 cols) */}
            <div className="lg:col-span-4 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredSosTickets.length === 0 ? (
                <div className="bg-[#070D0F] p-8 rounded-2xl border border-white/5 text-center space-y-2 text-slate-400">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">Nenhum chamado encontrado nesta pasta.</p>
                </div>
              ) : (
                filteredSosTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedSosTicket(ticket)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 text-left relative ${
                      selectedSosTicket?.id === ticket.id
                        ? 'bg-[#162327] border-[#FF7F5B] shadow-xl'
                        : 'bg-[#070D0F] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={ticket.userAvatar} alt={ticket.userName} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10" />
                        <h4 className="text-xs font-bold text-white truncate">{ticket.userName}</h4>
                      </div>

                      {/* Colored Urgency Dot Indicator Only */}
                      <span 
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          ticket.urgency === 'alta' 
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' 
                            : ticket.urgency === 'media'
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                        }`} 
                        title={ticket.urgency === 'alta' ? 'Urgência Alta' : ticket.urgency === 'media' ? 'Urgência Média' : 'Urgência Baixa'}
                      />
                    </div>

                    <h5 className="text-xs font-medium text-slate-300 truncate leading-snug">{ticket.subject}</h5>
                  </div>
                ))
              )}
            </div>

            {/* Right Panel: Email Reader & Responder View (5 cols) */}
            <div className="lg:col-span-5">
              {selectedSosTicket ? (
                <div className="bg-[#070D0F] p-6 rounded-2xl border border-[#FF7F5B]/30 space-y-4 text-left">
                  
                  {/* Email Action Toolbar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={selectedSosTicket.userAvatar} alt={selectedSosTicket.userName} className="w-10 h-10 rounded-full object-cover border border-[#FF7F5B] shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{selectedSosTicket.userName}</h3>
                        <span className="text-[10px] text-slate-400 truncate block">{selectedSosTicket.userEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedSosTicket.status === 'deletado' ? (
                        <>
                          <button
                            onClick={() => handleRestoreTicket(selectedSosTicket.id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Restaurar para Caixa de Entrada"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>

                          <button
                            onClick={() => handlePermanentDelete(selectedSosTicket.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title="Excluir Definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleMoveToTrash(selectedSosTicket.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Mover para Lixeira"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Deletar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Body Message */}
                  <div className="bg-[#101B1E] p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-xs font-black text-[#FF7F5B]">{selectedSosTicket.subject}</h4>
                      <span className="text-[10px] text-slate-400">{selectedSosTicket.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-100 italic leading-relaxed pt-1">
                      "{selectedSosTicket.message}"
                    </p>
                  </div>

                  {/* Previous Admin Reply if completed */}
                  {selectedSosTicket.adminReply && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-1 text-xs text-emerald-200">
                      <div className="flex justify-between items-center font-bold text-[10px] text-emerald-400">
                        <span>✓ Resposta Acolhedora Enviada:</span>
                        <span>{selectedSosTicket.repliedAt}</span>
                      </div>
                      <p className="italic">"{selectedSosTicket.adminReply}"</p>
                    </div>
                  )}

                  {/* Reply Form (If not deleted) */}
                  {selectedSosTicket.status !== 'deletado' && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <textarea
                        value={sosReplyText}
                        onChange={(e) => setSosReplyText(e.target.value)}
                        placeholder="Escreva uma resposta acolhedora e empática para enviar em privado..."
                        rows={4}
                        className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                      />

                      <button
                        onClick={handleSendSosReply}
                        disabled={!sosReplyText.trim()}
                        className="w-full py-2.5 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar Acolhimento Privado & Finalizar</span>
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-[#070D0F] p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-3 text-slate-400 min-h-[400px]">
                  <LifeBuoy className="w-12 h-12 text-[#FF7F5B]/40" />
                  <p className="text-xs">Selecione uma mensagem da lista ao lado para ler o e-mail completo e responder.</p>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* TAB 2: 🛡️ MODERAÇÃO ANTIJULGAMENTO */}
      {activeAdminTab === 'moderation' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <ShieldCheck className="w-5 h-5 text-[#8A9A5B]" />
                Fila de Moderação Antijulgamento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Avalie os alertas da IA Antijulgamento para manter a comunidade livre de julgamentos e cobranças.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {modItems.length === 0 ? (
              <div className="bg-[#070D0F] p-8 rounded-2xl border border-white/5 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-[#8A9A5B] opacity-60" />
                <span className="font-bold text-slate-300">Fila de moderação limpa!</span>
                <span className="text-[11px] text-slate-500">Nenhuma publicação pendente de revisão no momento.</span>
              </div>
            ) : (
              modItems.map(item => (
                <div key={item.id} className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <img src={item.authorAvatar} alt={item.authorName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.authorName}</h4>
                        <span className="text-[10px] text-[#FF7F5B] font-bold">Sala: {item.roomName} • {item.createdAt}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      {item.flagReason}
                    </span>
                  </div>

                  <div className="bg-[#101B1E] p-3.5 rounded-xl border border-white/5 text-xs text-slate-200 italic leading-relaxed">
                    "{item.content}"
                  </div>

                  {item.status === 'pendente' ? (
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => handleModerateItem(item.id, 'rejeitado')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Remover Post</span>
                      </button>

                      <button
                        onClick={() => handleModerateItem(item.id, 'aprovado')}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar Publicação</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold flex items-center gap-1 justify-end ${item.status === 'aprovado' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.status === 'aprovado' ? '✓ Aprovado e Mantido na Comunidade' : '✕ Removido por infringir diretrizes de acolhimento'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* TAB 3: 📊 TERMÔMETRO EMOCIONAL DA ALDEIA */}
      {activeAdminTab === 'analytics' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <TrendingUp className="w-5 h-5 text-[#FFD166]" />
                Termômetro Emocional da Aldeia (Saúde da Comunidade)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o estado emocional predominante dos pais para planejar novos conteúdos e encontros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuários Ativos</span>
              <span className="text-2xl font-black text-[#FF7F5B]">1.248</span>
              <span className="text-[10px] text-emerald-400 block">+14% este mês</span>
            </div>

            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pontos de Afeto Distribuídos</span>
              <span className="text-2xl font-black text-[#FFD166]">184.920</span>
              <span className="text-[10px] text-slate-400 block">Recompensas acumuladas</span>
            </div>

            <div className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acolhimentos na Comunidade</span>
              <span className="text-2xl font-black text-[#8A9A5B]">8.410</span>
              <span className="text-[10px] text-emerald-400 block">Reações de carinho trocadas</span>
            </div>
          </div>

          {/* Emotional Breakdown Progress */}
          <div className="bg-[#070D0F] p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#E66795]" />
              Sentimentos Mais Registrados nos Check-ins (Últimos 7 dias)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-amber-300">😫 Cansaço & Exaustão</span>
                  <span className="text-slate-300">42% (524 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-300">🌅 Esperança & Leveza</span>
                  <span className="text-slate-300">28% (349 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-rose-300">🛑 Sobrecarga Materna/Paternal</span>
                  <span className="text-slate-300">18% (224 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#FFD166]">🌸 Gratidão & Conexão</span>
                  <span className="text-slate-300">12% (151 mães/pais)</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFD166] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: 🎬 UPLOAD DE AULAS & ÁREAS */}
      {activeAdminTab === 'content' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Upload className="w-5 h-5 text-[#FF7F5B]" />
                Upload de Vídeo-Aulas & Cadastro de Áreas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adicione novos conteúdos pedagógicos, defina recompensas em pontos e anexe PDFs de apoio.
              </p>
            </div>
          </div>

          <form onSubmit={handlePublishLesson} className="bg-[#070D0F] p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FF7F5B] uppercase tracking-wider block">
                1. Selecione a Área / Trilha Temática:
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
              >
                <option value="Comunicação Não-Violenta">Comunicação Não-Violenta e Birras Infantis</option>
                <option value="Sono do Bebê">Sono do Bebê e Rotinas Noturnas</option>
                <option value="Espaço a Dois">Espaço a Dois & Parceria no Lar</option>
                <option value="Introdução Alimentar">Introdução Alimentar com Leveza</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Título da Vídeo-Aula:</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ex: O que acontece durante o pico da birra?"
                  className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Pontos Concedidos ao Assistir:</label>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Descrição Resumida da Aula:</label>
              <textarea
                value={lessonDesc}
                onChange={(e) => setLessonDesc(e.target.value)}
                placeholder="Descreva brevemente o que os pais vão aprender nesta aula..."
                rows={3}
                className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border-2 border-dashed border-white/15 p-5 rounded-2xl bg-[#101B1E] text-center space-y-2 cursor-pointer hover:border-[#FF7F5B]/50 transition-colors">
                <Video className="w-8 h-8 text-[#FF7F5B] mx-auto" />
                <span className="text-xs font-bold text-white block">Upload do Vídeo da Aula (MP4/WebM)</span>
                <span className="text-[10px] text-slate-400 block">Arraste o arquivo ou selecione no seu computador</span>
                <button type="button" onClick={() => setVideoFile('aula_birras_modulo1.mp4')} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg">
                  {videoFile ? `✓ Vídeo Selecionado: ${videoFile}` : 'Selecionar Arquivo de Vídeo'}
                </button>
              </div>

              <div className="border-2 border-dashed border-white/15 p-5 rounded-2xl bg-[#101B1E] text-center space-y-2 cursor-pointer hover:border-[#FFD166]/50 transition-colors">
                <FileText className="w-8 h-8 text-[#FFD166] mx-auto" />
                <span className="text-xs font-bold text-white block">Anexar Material de Apoio em PDF</span>
                <span className="text-[10px] text-slate-400 block">Checklists, resumos práticos e guias</span>
                <button type="button" onClick={() => setPdfFile('guia_pratico_birras.pdf')} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg">
                  {pdfFile ? `✓ PDF Anetado: ${pdfFile}` : 'Selecionar PDF de Apoio'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="certCheck"
                checked={hasCertificate}
                onChange={(e) => setHasCertificate(e.target.checked)}
                className="w-4 h-4 accent-[#FF7F5B] rounded cursor-pointer"
              />
              <label htmlFor="certCheck" className="text-xs text-slate-300 font-bold cursor-pointer">
                Concluir esta aula/trilha gera Certificado Digital de Conclusão para o aluno
              </label>
            </div>

            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Vídeo-aula publicada com sucesso na área "{selectedArea}"!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Publicar Vídeo-Aula na Trilha</span>
            </button>
          </form>
        </section>
      )}

      {/* TAB 5: 👥 GESTÃO DE MEMBROS */}
      {activeAdminTab === 'users' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Users className="w-5 h-5 text-[#FF7F5B]" />
                Gestão de Membros & Guia de Acolhimento
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Atribua o selo especial de Guia & Mentora para membros experientes e acompanhe a pontuação.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="bg-[#070D0F] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E66795]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <span className="bg-[#FF7F5B]/20 text-[#FF7F5B] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#FF7F5B]/30 flex items-center gap-1">
                        <span>{member.levelIcon}</span>
                        <span>{member.levelTitle}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {member.email} • {member.joinedDays} dias conosco • {member.xp} pontos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === 'guia' ? (
                    <span className="text-[10px] font-extrabold bg-[#8A9A5B]/20 text-[#8A9A5B] border border-[#8A9A5B]/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Guia & Mentora Oficial
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full">
                      Membro da Aldeia
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleRole(member.id)}
                    className="text-xs font-bold text-[#FF7F5B] hover:text-[#FFD166] bg-[#FF7F5B]/10 hover:bg-[#FF7F5B]/20 border border-[#FF7F5B]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    {member.role === 'guia' ? 'Remover Selo Guia' : 'Conceder Selo Guia'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 6: 🗳️ GESTÃO DE ENQUETES (SUA VOZ IMPORTA) */}
      {activeAdminTab === 'polls' && (
        <div className="space-y-8">
          {/* Card 1: Criar Nova Enquete */}
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Vote className="w-5 h-5 text-[#FF7F5B]" />
                  Lançar Nova Enquete na Comunidade (Sua Voz Importa)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  As enquetes publicadas aparecem em destaque no topo do feed e como pop-up de boas-vindas para os membros.
                </p>
              </div>
            </div>

            {pollSuccessMessage && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enquete publicada com sucesso na Comunidade! 🎉</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newPollTitle.trim()) return;
                const validOptions = newPollOptions.filter(opt => opt.trim().length > 0);
                if (validOptions.length < 2) {
                  alert('Por favor, preencha pelo menos 2 opções de resposta.');
                  return;
                }

                setIsPublishingPoll(true);
                try {
                  await createPoll({
                    title: newPollTitle.trim(),
                    description: newPollDesc.trim() || undefined,
                    category: newPollCategory,
                    options: validOptions
                  });
                  setNewPollTitle('');
                  setNewPollDesc('');
                  setNewPollOptions(['', '', '']);
                  setPollSuccessMessage(true);
                  setTimeout(() => setPollSuccessMessage(false), 4000);
                } finally {
                  setIsPublishingPoll(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Pergunta da Enquete *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder="Ex: Qual é o seu maior desafio na rotina noturna com os pequenos?"
                    className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Categoria / Tema
                  </label>
                  <select
                    value={newPollCategory}
                    onChange={(e) => setNewPollCategory(e.target.value)}
                    className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Rotina & Maternidade">Rotina & Maternidade</option>
                    <option value="Sono & Desaceleração">Sono & Desaceleração</option>
                    <option value="Birras & Limites">Birras & Limites</option>
                    <option value="Rede de Apoio">Rede de Apoio</option>
                    <option value="Autocuidado & Culpa">Autocuidado & Culpa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Descrição ou Contexto (Opcional)
                </label>
                <input
                  type="text"
                  value={newPollDesc}
                  onChange={(e) => setNewPollDesc(e.target.value)}
                  placeholder="Ex: Sua resposta ajuda nossa curadoria a criar os próximos conteúdos e acolhimentos."
                  className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Opções de Resposta * (mínimo 2)
                </label>
                {newPollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-mono font-bold text-[#FF7F5B]">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[idx] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      placeholder={`Opção de resposta ${idx + 1}`}
                      className="flex-1 bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 p-2 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {newPollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                    className="text-xs font-bold text-[#FF7F5B] hover:text-[#FFD166] flex items-center gap-1.5 pt-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar mais uma opção</span>
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishingPoll}
                  className="bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isPublishingPoll ? 'Publicando...' : 'Publicar Enquete na Comunidade'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Card 2: Lista e Histórico de Enquetes */}
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Enquetes Cadastradas & Resultados em Tempo Real</span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                    {polls.length}
                  </span>
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {polls.map((poll) => {
                const total = Math.max(1, poll.totalVotes);
                const isOpen = poll.status === 'open';

                return (
                  <div
                    key={poll.id}
                    className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 space-y-4 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isOpen
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}>
                            {isOpen ? '🟢 Aberta para Votação' : '⚪ Encerrada'}
                          </span>
                          {poll.category && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              {poll.category}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">
                          {poll.title}
                        </h4>
                        {poll.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {poll.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-300">
                          {poll.totalVotes} votos
                        </span>
                        <button
                          onClick={() => togglePollStatus(poll.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            isOpen
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isOpen ? 'Encerrar Votação' : 'Reabrir Enquete'}
                        </button>
                      </div>
                    </div>

                    {/* Progress bars per option */}
                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const pct = Math.round((opt.votesCount / total) * 100);
                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span>{opt.text}</span>
                              <span className="font-mono font-bold text-[#FFD166]">
                                {opt.votesCount} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#FF7F5B] h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

    </div>
  );
};

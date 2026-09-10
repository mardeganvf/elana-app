import React, { useState, useEffect, useCallback } from 'react';
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
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Menu,
  Sparkles,
  Brain,
  ToggleLeft,
  ToggleRight,
  Power,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth, isAdminUser, SOSMessage } from '../context/AuthContext';
import { useCommunity, checkContentSensitivity } from '../context/CommunityContext';
import { useToast } from '../context/ToastContext';
import { useJourneys } from '../context/JourneysContext';
import { supabase } from '../lib/supabase';
import { AdminContentManager } from '../components/admin/AdminContentManager';
import { AdminDestaquesManager } from '../components/admin/AdminDestaquesManager';

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
  status: 'pendente' | 'em_atendimento' | 'atendido' | 'arquivado' | 'deletado';
  adminReply?: string;
  repliedAt?: string;
  messages?: SOSMessage[];
}

interface ModerationItem {
  id: string;
  type?: 'post' | 'comment';
  postId?: string;
  authorName: string;
  authorAvatar: string;
  roomName: string;
  content: string;
  flagReason: string;
  createdAt: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  reportCount?: number;
}

interface LearnedExample {
  id: string;
  original_text: string;
  category: string;
  reason: string;
  admin_notes?: string;
  is_active: boolean;
  created_at: string;
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
  bio?: string;
}

interface EmotionStatBreakdown {
  id: string;
  label: string;
  emoji: string;
  count: number;
  percentage: number;
  barColor: string;
  textColor: string;
}

interface EmotionalStats {
  totalActiveUsers: number;
  totalXpDistributed: number;
  totalAcolhimentos: number;
  totalCheckins: number;
  totalPosts: number;
  averageAcolhimentosPerPost: number;
  postsWithoutRepliesCount: number;
  supportHealthStatus: 'ativa' | 'atencao' | 'alerta';
  supportHealthLabel: string;
  supportHealthMessage: string;
  breakdown: EmotionStatBreakdown[];
}

export interface AdminPageProps {
  onBackToHome?: () => void;
  onOpenLogin?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome, onOpenLogin }) => {
  const { user, isAuthenticated, replySosTicket, archiveSosTicket } = useAuth();
  const { showToast } = useToast();
  const isAdmin = isAdminUser(user);

  const [activeAdminTab, setActiveAdminTab] = useState<'sos' | 'moderation' | 'analytics' | 'content' | 'users' | 'polls' | 'destaques' | null>(null);

  // Grupos expansíveis (drop-downs) do menu lateral - iniciam todos recolhidos
  const [openMenuGroups, setOpenMenuGroups] = useState<Record<string, boolean>>({
    content: false,
    community: false,
    support: false,
    users: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenuGroup = (groupKey: string) => {
    setOpenMenuGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // 📚 Trilhas & Módulos State (Sincronizado com a barra lateral)
  const { journeys } = useJourneys();
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [openTrilhas, setOpenTrilhas] = useState<Record<string, boolean>>({});
  const [isCreateJourneyModalOpen, setIsCreateJourneyModalOpen] = useState(false);

  const toggleTrilha = (trilhaId: string) => {
    setOpenTrilhas(prev => ({
      ...prev,
      [trilhaId]: !prev[trilhaId]
    }));
  };

  // 🗳️ Enquetes State
  const { polls, createPoll, togglePollStatus, deletePost, deleteComment, refreshPosts, posts } = useCommunity();
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>(['', '']);
  const [selectedPollJourneys, setSelectedPollJourneys] = useState<string[]>([]);
  const [isPollMultiSelect, setIsPollMultiSelect] = useState(false);
  const [isPublishingPoll, setIsPublishingPoll] = useState(false);
  const [pollSuccessMessage, setPollSuccessMessage] = useState(false);
  const [expandedPollIds, setExpandedPollIds] = useState<Record<string, boolean>>({});
  const [visiblePollsCount, setVisiblePollsCount] = useState(5);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);

  const toggleJourneyInPoll = (journeyTitle: string) => {
    if (selectedPollJourneys.includes(journeyTitle)) {
      setSelectedPollJourneys(prev => prev.filter(t => t !== journeyTitle));
    } else {
      setSelectedPollJourneys(prev => [...prev, journeyTitle]);
    }
  };

  const handleAddPollOption = () => {
    setNewPollOptions(prev => [...prev, '']);
  };

  const handleUpdatePollOption = (index: number, value: string) => {
    setNewPollOptions(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemovePollOption = (index: number) => {
    if (newPollOptions.length <= 2) return;
    setNewPollOptions(prev => prev.filter((_, i) => i !== index));
  };

  const togglePollExpansion = (pollId: string) => {
    setExpandedPollIds(prev => ({
      ...prev,
      [pollId]: !prev[pollId]
    }));
  };

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
  const [moderationFilter, setModerationFilter] = useState<'pendentes' | 'aprovados' | 'todos' | 'aprendizado'>('pendentes');

  // 🧠 Base de Auto-Aprendizado da IA (Human-in-the-Loop)
  const [learnedExamples, setLearnedExamples] = useState<LearnedExample[]>([]);
  const [isLoadingLearned, setIsLoadingLearned] = useState(false);
  const [learnedSearchQuery, setLearnedSearchQuery] = useState('');

  // 🚫 Modal de Remoção e Calibração da IA
  const [rejectModalItem, setRejectModalItem] = useState<ModerationItem | null>(null);
  const [rejectCategory, setRejectCategory] = useState<'antijulgamento' | 'vulnerabilidade' | 'sexual' | 'outro'>('antijulgamento');
  const [rejectReason, setRejectReason] = useState('');
  const [trainFilterActive, setTrainFilterActive] = useState(true);
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Helpers para persistência de aprovações locais e remotas
  const getApprovedPostIds = (): Set<string> => {
    try {
      const raw = localStorage.getItem('elana_approved_post_ids');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  };

  const saveApprovedPostId = (id: string) => {
    try {
      const set = getApprovedPostIds();
      set.add(id);
      localStorage.setItem('elana_approved_post_ids', JSON.stringify(Array.from(set)));
    } catch {}
  };

  const removeApprovedPostId = (id: string) => {
    try {
      const set = getApprovedPostIds();
      set.delete(id);
      localStorage.setItem('elana_approved_post_ids', JSON.stringify(Array.from(set)));
    } catch {}
  };

  // 👥 Members State
  const [members, setMembers] = useState<MemberUser[]>([]);

  // 📊 Termômetro Emocional Real State
  const [emotionalStats, setEmotionalStats] = useState<EmotionalStats | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // 🛡️ Moderation Loader - estritamente posts de usuários reais registrados
  const loadModeration = async () => {
    try {
      const approvedIds = getApprovedPostIds();

      // 1. Carregar posts que possuem autor vinculado
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .not('author_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Erro ao carregar moderação do Supabase:', error);
        return;
      }

      // 2. Carregar denúncias de usuários
      const { data: reportsData } = await supabase
        .from('community_reports')
        .select('content_id, reason, content_type');

      // Mapear content_id → { count, reasons }
      const reportMap: Record<string, { count: number; reasons: string[] }> = {};
      if (reportsData) {
        for (const r of reportsData) {
          if (!reportMap[r.content_id]) reportMap[r.content_id] = { count: 0, reasons: [] };
          reportMap[r.content_id].count++;
          if (!reportMap[r.content_id].reasons.includes(r.reason)) {
            reportMap[r.content_id].reasons.push(r.reason);
          }
        }
      }

      // 3. Carregar comentários de usuários reais ou sob moderação
      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('*')
        .not('author_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      // Filtrar estritamente apenas posts criados por usuários com IDs válidos (ignora dummies 'u-1', etc.)
      const validPosts = (data || []).filter(p => 
        p.author_id && 
        p.author_id.length > 20 && 
        !p.author_id.startsWith('u-') && 
        p.status !== 'removido_usuario'
      );

      const postItems: ModerationItem[] = validPosts.map(p => {
        const isPersistedApproved = p.category === 'aprovado' || approvedIds.has(p.id);
        const sensitivityCheck = checkContentSensitivity(`${p.title || ''} ${p.content || ''}`);
        const isExplicitlyFlagged = p.status === 'sob_moderacao' || p.category === 'sob_moderacao';
        const isSensitive = sensitivityCheck.isFlagged || isExplicitlyFlagged;
        const postReports = reportMap[p.id];

        let flagReason = 'Conteúdo livre';
        if (postReports && postReports.count > 0) {
          flagReason = `🚩 ${postReports.count} denúncia${postReports.count > 1 ? 's' : ''} de usuários: ${postReports.reasons.join(', ')}`;
        } else if (sensitivityCheck.isFlagged) {
          flagReason = sensitivityCheck.flagReason || `Termo sensível: "${sensitivityCheck.matchedWord}"`;
        } else if (isExplicitlyFlagged) {
          flagReason = 'Retido para moderação preventiva';
        }

        let status: 'pendente' | 'aprovado' | 'rejeitado' = 'aprovado';
        if (isPersistedApproved) {
          status = 'aprovado';
        } else if (isSensitive || (postReports && postReports.count >= 3)) {
          status = 'pendente';
        } else {
          status = 'aprovado';
        }

        return {
          id: p.id,
          type: 'post',
          authorName: p.author_name || 'Anônimo',
          authorAvatar: p.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          roomName: p.transversal_room_id || p.journey_id || 'Comunidade Geral',
          content: p.title ? `[${p.title}] ${p.content}` : p.content,
          flagReason,
          createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
          status,
          reportCount: postReports?.count || p.report_count || 0
        };
      });

      const validComments = (commentsData || []).filter(c => 
        c.author_id && 
        c.author_id.length > 20 && 
        !c.author_id.startsWith('u-') && 
        c.status !== 'removido_usuario'
      );

      const commentItems: ModerationItem[] = validComments.map(c => {
        const isPersistedApproved = c.status === 'aprovado' || approvedIds.has(c.id);
        const sensitivityCheck = checkContentSensitivity(c.content || '');
        const isExplicitlyFlagged = c.status === 'sob_moderacao';
        const isSensitive = sensitivityCheck.isFlagged || isExplicitlyFlagged;
        const commentReports = reportMap[c.id];

        let flagReason = 'Conteúdo livre';
        if (commentReports && commentReports.count > 0) {
          flagReason = `🚩 ${commentReports.count} denúncia${commentReports.count > 1 ? 's' : ''} de usuários: ${commentReports.reasons.join(', ')}`;
        } else if (sensitivityCheck.isFlagged) {
          flagReason = sensitivityCheck.flagReason || `Termo sensível: "${sensitivityCheck.matchedWord}"`;
        } else if (isExplicitlyFlagged) {
          flagReason = 'Retido para moderação preventiva';
        }

        let status: 'pendente' | 'aprovado' | 'rejeitado' = 'aprovado';
        if (isPersistedApproved) {
          status = 'aprovado';
        } else if (isSensitive || (commentReports && commentReports.count >= 3)) {
          status = 'pendente';
        } else {
          status = 'aprovado';
        }

        return {
          id: c.id,
          type: 'comment',
          postId: c.post_id,
          authorName: c.author_name || 'Anônimo',
          authorAvatar: c.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          roomName: 'Comentário em resposta',
          content: c.content || '',
          flagReason,
          createdAt: new Date(c.created_at).toLocaleString('pt-BR'),
          status,
          reportCount: commentReports?.count || c.report_count || 0
        };
      });

      const allItems = [...postItems, ...commentItems].sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (b.status === 'pendente' && a.status !== 'pendente') return 1;
        return 0;
      });

      setModItems(allItems);
    } catch (err) {
      console.warn('Falha ao processar fila de moderação:', err);
    }
  };

  // 📊 Analytics Loader - cálculo 100% dinâmico derivado de perfis cadastrados e check-ins reais
  const loadEmotionalAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      // 1. Obter membros registrados
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, xp');
      const registered = profilesData || [];
      const registeredIds = new Set(registered.map(p => p.id));
      const totalActiveUsers = registered.length;
      const totalXpDistributed = registered.reduce((acc, p) => acc + (p.xp || 0), 0);

      // 2. Obter contagem de reações e comentários reais (Acolhimentos na Comunidade)
      let currentPosts = posts;
      if (!currentPosts || currentPosts.length === 0) {
        try {
          const cached = localStorage.getItem('elana_community_posts_cache');
          if (cached) currentPosts = JSON.parse(cached);
        } catch {}
      }

      // a) Contabilizar comentários únicos (Supabase + Contexto local)
      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('id, author_id, post_id');

      const commentIds = new Set<string>();
      (commentsData || []).forEach(c => {
        if (c.id) commentIds.add(c.id);
      });
      (currentPosts || []).forEach(p => {
        (p.comments || []).forEach(c => {
          if (c.id) commentIds.add(c.id);
        });
      });
      const totalComments = commentIds.size;

      // b) Contabilizar reações (Supabase + Contexto local + Armazenamento persistente)
      let remoteReactionsCount = 0;
      try {
        const { data: reactionsData } = await supabase
          .from('community_reactions')
          .select('id');
        if (reactionsData) remoteReactionsCount = reactionsData.length;
      } catch {}

      let localReactionsCount = 0;
      (currentPosts || []).forEach(p => {
        if (p.reactions && typeof p.reactions === 'object') {
          Object.values(p.reactions).forEach(count => {
            if (typeof count === 'number') localReactionsCount += count;
          });
        }
      });

      try {
        const rawStore = localStorage.getItem('elana_community_reactions_v2');
        if (rawStore) {
          const parsedStore = JSON.parse(rawStore);
          let storeCount = 0;
          if (parsedStore.posts) {
            Object.values(parsedStore.posts).forEach((pReactions: any) => {
              if (pReactions && typeof pReactions === 'object') {
                Object.values(pReactions).forEach((c: any) => {
                  if (typeof c === 'number') storeCount += c;
                });
              }
            });
          }
          localReactionsCount = Math.max(localReactionsCount, storeCount);
        }
      } catch {}

      const totalReactions = Math.max(remoteReactionsCount, localReactionsCount);
      const totalAcolhimentos = totalComments + totalReactions;

      // c) Postagens reais e saúde da rede de apoio (relação entre postagens e acolhimentos)
      const validPosts = (currentPosts || []).filter(p => 
        p.authorId && 
        p.authorId.length > 20 && 
        !p.authorId.startsWith('u-') && 
        p.status !== 'removido_usuario'
      );
      const totalPosts = validPosts.length;
      const postsWithoutRepliesCount = validPosts.filter(p => !p.comments || p.comments.length === 0).length;
      const averageAcolhimentosPerPost = totalPosts > 0 ? Number((totalAcolhimentos / totalPosts).toFixed(1)) : 0;

      let supportHealthStatus: 'ativa' | 'atencao' | 'alerta' = 'ativa';
      let supportHealthLabel = 'Rede Viva & Ativa 💚';
      let supportHealthMessage = 'Ninguém fica sem amparo: a comunidade está atenta e respondendo às publicações.';

      if (totalPosts === 0) {
        supportHealthStatus = 'ativa';
        supportHealthLabel = 'Comunidade em Aberto 🌱';
        supportHealthMessage = 'Ainda não há postagens ativas de usuários cadastrados no feed.';
      } else if (postsWithoutRepliesCount > 0 && (postsWithoutRepliesCount / totalPosts) >= 0.5) {
        supportHealthStatus = 'alerta';
        supportHealthLabel = 'Alerta de Isolamento 🚨';
        supportHealthMessage = `Atenção: ${postsWithoutRepliesCount} de ${totalPosts} postagens estão sem resposta. Mães e pais podem estar desabafando sem retorno suficiente.`;
      } else if (averageAcolhimentosPerPost < 1.0 || postsWithoutRepliesCount > 0) {
        supportHealthStatus = 'atencao';
        supportHealthLabel = 'Atenção ao Amparo ⚠️';
        supportHealthMessage = `Média de ${averageAcolhimentosPerPost} acolhimentos por post. Há ${postsWithoutRepliesCount} publicação(ões) ainda aguardando o primeiro abraço ou resposta.`;
      } else if (averageAcolhimentosPerPost >= 3.0) {
        supportHealthStatus = 'ativa';
        supportHealthLabel = 'Rede Viva & Ativa 💚';
        supportHealthMessage = `Média alta de ${averageAcolhimentosPerPost} acolhimentos por postagem. Todos os tópicos têm apoio — a rede cumpre plenamente sua missão!`;
      } else {
        supportHealthStatus = 'ativa';
        supportHealthLabel = 'Rede Acolhedora 🌿';
        supportHealthMessage = `Média de ${averageAcolhimentosPerPost} acolhimentos por postagem. Bom ritmo de interações e apoio mútuo.`;
      }

      // 3. Obter check-ins emocionais de usuários registrados
      const { data: checkinsData } = await supabase
        .from('emotional_checkins')
        .select('id, profile_id, emotion_id, emotion_label, created_at')
        .not('profile_id', 'is', null);

      const realCheckins = (checkinsData || []).filter(c => c.profile_id && registeredIds.has(c.profile_id));
      const totalCheckins = realCheckins.length;

      let exaustoCount = 0;
      let esperancaCount = 0;
      let luzCount = 0;
      let celebrandoCount = 0;

      for (const c of realCheckins) {
        const eid = (c.emotion_id || '').toLowerCase();
        if (eid === 'exausto' || eid === 'sem_energia' || eid === 'cansaco') {
          exaustoCount++;
        } else if (eid === 'esperanca' || eid === 'leveza') {
          esperancaCount++;
        } else if (eid === 'preciso_luz' || eid === 'precisando_luz' || eid === 'ajuda' || eid === 'sobrecarga') {
          luzCount++;
        } else if (eid === 'celebrando' || eid === 'gratidao' || eid === 'vitoria') {
          celebrandoCount++;
        } else {
          exaustoCount++;
        }
      }

      const breakdown: EmotionStatBreakdown[] = [
        {
          id: 'exausto',
          label: 'Cansaço & Exaustão',
          emoji: '🪫',
          count: exaustoCount,
          percentage: totalCheckins > 0 ? Math.round((exaustoCount / totalCheckins) * 100) : 0,
          barColor: 'bg-amber-400',
          textColor: 'text-amber-300'
        },
        {
          id: 'esperanca',
          label: 'Esperança & Leveza',
          emoji: '☀️',
          count: esperancaCount,
          percentage: totalCheckins > 0 ? Math.round((esperancaCount / totalCheckins) * 100) : 0,
          barColor: 'bg-emerald-400',
          textColor: 'text-emerald-300'
        },
        {
          id: 'preciso_luz',
          label: 'Precisando de Luz / Colo',
          emoji: '🆘',
          count: luzCount,
          percentage: totalCheckins > 0 ? Math.round((luzCount / totalCheckins) * 100) : 0,
          barColor: 'bg-rose-400',
          textColor: 'text-rose-300'
        },
        {
          id: 'celebrando',
          label: 'Gratidão & Celebração',
          emoji: '🎉',
          count: celebrandoCount,
          percentage: totalCheckins > 0 ? Math.round((celebrandoCount / totalCheckins) * 100) : 0,
          barColor: 'bg-[#FFD166]',
          textColor: 'text-[#FFD166]'
        }
      ];

      setEmotionalStats({
        totalActiveUsers,
        totalXpDistributed,
        totalAcolhimentos,
        totalCheckins,
        totalPosts,
        averageAcolhimentosPerPost,
        postsWithoutRepliesCount,
        supportHealthStatus,
        supportHealthLabel,
        supportHealthMessage,
        breakdown
      });
    } catch (err) {
      console.warn('Erro ao carregar métricas emocionais:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const parseTicketFromRow = (t: any): SOSTicket => {
    let parsedMessages: SOSMessage[] = [];
    if (Array.isArray(t.messages) && t.messages.length > 0) {
      parsedMessages = t.messages;
    } else {
      if (t.user_message || t.message) {
        parsedMessages.push({
          id: `legacy-${t.id}`,
          sender: 'user',
          senderName: t.user_name || 'Membro',
          senderAvatar: t.user_avatar,
          text: t.user_message || t.message,
          createdAt: new Date(t.created_at).toLocaleString('pt-BR')
        });
      }
      if (t.admin_reply) {
        parsedMessages.push({
          id: `legacy-reply-${t.id}`,
          sender: 'admin',
          senderName: 'Equipe Elana',
          text: t.admin_reply,
          createdAt: t.replied_at ? new Date(t.replied_at).toLocaleString('pt-BR') : 'Anterior'
        });
      }
    }

    return {
      id: t.id,
      userName: t.user_name || 'Anônimo',
      userEmail: t.user_email || '',
      userAvatar: t.user_avatar || '',
      urgency: t.urgency || 'media',
      subject: t.subject || ((t.user_message || t.message || '').slice(0, 40) || 'Pedido de Acolhimento SOS'),
      message: t.user_message || t.message || '',
      createdAt: new Date(t.created_at).toLocaleString('pt-BR'),
      status: t.status || 'pendente',
      adminReply: t.admin_reply,
      repliedAt: t.replied_at ? new Date(t.replied_at).toLocaleString('pt-BR') : undefined,
      messages: parsedMessages
    };
  };

  const loadTickets = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('sos_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = data.map(parseTicketFromRow);
        setSosTickets(mapped);

        setSelectedSosTicket(prev => {
          if (!prev) return null;
          const fresh = mapped.find(t => t.id === prev.id);
          return fresh || prev;
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar tickets SOS:', err);
    }
  }, []);

  const handleSelectSosTicket = async (ticket: SOSTicket) => {
    setSelectedSosTicket(ticket);
    try {
      const { data } = await supabase
        .from('sos_tickets')
        .select('*')
        .eq('id', ticket.id)
        .maybeSingle();
      if (data) {
        const fresh = parseTicketFromRow(data);
        setSelectedSosTicket(fresh);
        setSosTickets(prev => prev.map(t => t.id === ticket.id ? fresh : t));
      }
    } catch (err) {
      console.warn('Erro ao carregar detalhes do ticket selecionado:', err);
    }
  };

  useEffect(() => {
    loadTickets();
    loadModeration();
    loadLearnedExamples();

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
          joinedDays: Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000),
          bio: p.bio || undefined
        })));
      }
    };
    loadMembers();
    loadEmotionalAnalytics();
  }, [loadTickets]);

  // Polling e Realtime para aba SOS
  useEffect(() => {
    if (activeAdminTab !== 'sos') return;

    loadTickets();
    const interval = setInterval(loadTickets, 4000);

    const channel = supabase
      .channel('admin_sos_realtime_sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sos_tickets'
      }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeAdminTab, loadTickets]);

  // Recalcula métricas do termômetro sempre que a aba for selecionada ou houver novas reações/comentários
  useEffect(() => {
    if (activeAdminTab === 'analytics') {
      loadEmotionalAnalytics();
    }
  }, [activeAdminTab, posts]);

  // 🛟 SOS Ticket Handlers
  const handleSendSosReply = async () => {
    if (!selectedSosTicket || !sosReplyText.trim()) return;
    const replyText = sosReplyText.trim();
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const adminMsg: SOSMessage = {
      id: `admin-${Date.now()}`,
      sender: 'admin',
      senderName: user?.name || 'Equipe Elana',
      senderAvatar: user?.avatar,
      text: replyText,
      createdAt: formattedTime
    };

    let latestMessages = selectedSosTicket.messages || [];
    try {
      const { data: latestRow } = await supabase
        .from('sos_tickets')
        .select('messages')
        .eq('id', selectedSosTicket.id)
        .maybeSingle();
      if (latestRow && Array.isArray(latestRow.messages) && latestRow.messages.length > 0) {
        latestMessages = latestRow.messages;
      }
    } catch (err) {
      console.warn('Erro ao ler mensagens mais recentes:', err);
    }

    const nextMessages = [...latestMessages, adminMsg];

    await supabase
      .from('sos_tickets')
      .update({
        status: 'em_atendimento',
        admin_reply: replyText,
        replied_at: new Date().toISOString(),
        messages: nextMessages,
        is_read: false
      })
      .eq('id', selectedSosTicket.id);

    await replySosTicket(selectedSosTicket.id, replyText);

    setSosTickets(prev => prev.map(t => t.id === selectedSosTicket.id ? {
      ...t,
      status: 'em_atendimento',
      adminReply: replyText,
      repliedAt: new Date().toLocaleString('pt-BR'),
      messages: nextMessages
    } : t));

    setSelectedSosTicket(prev => prev ? {
      ...prev,
      status: 'em_atendimento',
      adminReply: replyText,
      repliedAt: new Date().toLocaleString('pt-BR'),
      messages: nextMessages
    } : null);

    setSosReplyText('');
    showToast('success', 'Resposta enviada! O atendimento segue aberto para diálogo.');
  };

  const handleArchiveTicket = async (ticketId: string) => {
    await supabase
      .from('sos_tickets')
      .update({ status: 'arquivado' })
      .eq('id', ticketId);

    await archiveSosTicket(ticketId);

    setSosTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'arquivado' } : t));
    if (selectedSosTicket?.id === ticketId) {
      setSelectedSosTicket(prev => prev ? { ...prev, status: 'arquivado' } : null);
    }
    showToast('success', 'Atendimento concluído e arquivado com carinho! 🌸');
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
    showToast('info', 'Chamado reaberto para a Caixa de Entrada.');
  };

  const handlePermanentDelete = (ticketId: string) => {
    setSosTickets(prev => prev.filter(t => t.id !== ticketId));
    if (selectedSosTicket?.id === ticketId) {
      setSelectedSosTicket(null);
    }
  };

  const loadLearnedExamples = async () => {
    setIsLoadingLearned(true);
    try {
      const { data, error } = await supabase
        .from('moderation_rejected_examples')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setLearnedExamples(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar base de aprendizado:', err);
    } finally {
      setIsLoadingLearned(false);
    }
  };

  // Moderation Handlers
  const handleModerateItem = async (id: string, newStatus: 'aprovado' | 'rejeitado') => {
    const targetItem = modItems.find(item => item.id === id);
    if (newStatus === 'aprovado') {
      setModItems(prev => prev.map(item => item.id === id ? { ...item, status: 'aprovado' } : item));
      saveApprovedPostId(id);
      try {
        if (targetItem?.type === 'comment') {
          await supabase
            .from('community_comments')
            .update({ status: 'aprovado' })
            .eq('id', id);
        } else {
          await supabase
            .from('community_posts')
            .update({ category: 'aprovado', status: 'aprovado' })
            .eq('id', id);
        }
        await refreshPosts();
      } catch (err) {
        console.warn('Erro ao salvar aprovação no Supabase:', err);
      }
      showToast('success', targetItem?.type === 'comment' ? 'Comentário aprovado na comunidade!' : 'Publicação aprovada e mantida na comunidade!');
    } else if (newStatus === 'rejeitado') {
      if (targetItem) {
        setRejectModalItem(targetItem);
        const cleanReason = targetItem.flagReason.replace(/^🚩 \d+ denúncias? de usuários: /, '');
        setRejectReason(cleanReason !== 'Conteúdo livre' ? cleanReason : '');
        setRejectCategory(targetItem.flagReason.includes('Acolhimento') || targetItem.flagReason.includes('vulnerabilidade') ? 'vulnerabilidade' : 'antijulgamento');
        setTrainFilterActive(true);
      }
    }
  };

  // Confirmar Rejeição & Ensinar Filtro (Human-in-the-Loop)
  const handleConfirmRejection = async () => {
    if (!rejectModalItem) return;
    setIsSubmittingRejection(true);
    const item = rejectModalItem;

    try {
      if (trainFilterActive) {
        // Enviar para a Edge Function treinar o exemplo com embedding e persistir no banco
        await supabase.functions.invoke('moderate-content', {
          body: {
            action: 'train_example',
            text: item.content,
            category: rejectCategory,
            reason: rejectReason.trim() || 'Conteúdo rejeitado na moderação',
            adminNotes: `${item.type === 'comment' ? 'Comentário' : 'Post'} de ${item.authorName} na sala ${item.roomName}`
          }
        });
      }

      removeApprovedPostId(item.id);

      if (item.type === 'comment') {
        if (item.postId) {
          await deleteComment(item.postId, item.id);
        } else {
          await supabase.from('community_comments').delete().eq('id', item.id);
        }
      } else {
        deletePost(item.id);
        await supabase.from('community_posts').delete().eq('id', item.id);
      }

      await refreshPosts();

      // Atualizar estado local
      setModItems(prev => prev.map(m => m.id === item.id ? { ...m, status: 'rejeitado' } : m));
      await loadLearnedExamples();

      showToast('success', trainFilterActive 
        ? `${item.type === 'comment' ? 'Comentário removido' : 'Publicação removida'} e padrão ensinado ao filtro com sucesso!`
        : `${item.type === 'comment' ? 'Comentário removido' : 'Publicação removida'} com sucesso.`);
      
      setRejectModalItem(null);
    } catch (err) {
      console.warn('Erro ao processar rejeição:', err);
      showToast('error', `Erro ao remover ${item.type === 'comment' ? 'comentário' : 'publicação'}. Tente novamente.`);
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  // Alternar ativação de regra de aprendizado
  const handleToggleLearnedActive = async (id: string, currentActive: boolean) => {
    const nextState = !currentActive;
    setLearnedExamples(prev => prev.map(ex => ex.id === id ? { ...ex, is_active: nextState } : ex));
    try {
      await supabase.from('moderation_rejected_examples').update({ is_active: nextState }).eq('id', id);
      showToast('info', nextState ? 'Regra ativada no filtro!' : 'Regra pausada temporariamente.');
    } catch (err) {
      console.warn('Erro ao alternar regra:', err);
    }
  };

  // Excluir regra da base de aprendizado
  const handleDeleteLearnedExample = async (id: string) => {
    setLearnedExamples(prev => prev.filter(ex => ex.id !== id));
    try {
      await supabase.from('moderation_rejected_examples').delete().eq('id', id);
      showToast('success', 'Exemplo removido da base de aprendizado.');
    } catch (err) {
      console.warn('Erro ao excluir regra:', err);
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

  // Limpar Bio de Membro (caso tenha herdado dados indevidamente)
  const handleClearMemberBio = async (userId: string) => {
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, bio: undefined } : m));
    try {
      await supabase.from('profiles').update({ bio: null }).eq('id', userId);
      showToast('success', 'Bio do membro limpa com sucesso!');
    } catch (err) {
      console.warn('Error clearing member bio in Supabase:', err);
    }
  };

  // Filtered SOS Tickets for Email Inbox
  const filteredSosTickets = sosTickets.filter(t => {
    // Filter by Folder Status
    if (sosFolder === 'inbox' && t.status !== 'pendente' && t.status !== 'em_atendimento') return false;
    if (sosFolder === 'completed' && t.status !== 'atendido' && t.status !== 'arquivado') return false;
    if (sosFolder === 'trash' && t.status !== 'deletado') return false;

    // Filter by Urgency
    if (sosUrgencyFilter !== 'todos' && t.urgency !== sosUrgencyFilter) return false;

    // Filter by Search Query
    if (sosSearchQuery.trim()) {
      const q = sosSearchQuery.toLowerCase();
      return (
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        (t.messages && t.messages.some(m => m.text.toLowerCase().includes(q)))
      );
    }

    return true;
  }).sort((a, b) => {
    // AI Urgency Priority Sorting for Inbox
    const urgencyOrder = { alta: 1, media: 2, baixa: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const pendingCount = sosTickets.filter(t => t.status === 'pendente' || t.status === 'em_atendimento').length;
  const completedCount = sosTickets.filter(t => t.status === 'atendido' || t.status === 'arquivado').length;
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
      
      {/* Admin Header */}
      <section className="bg-[#101B1E] px-6 py-5 sm:px-8 sm:py-6 rounded-3xl border border-white/10 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Painel Administrativo
        </h1>
      </section>

      {/* Botão Mobile para abrir/fechar menu lateral */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full py-3 px-4 bg-[#101B1E] border border-white/10 rounded-2xl flex items-center justify-between text-xs font-bold text-white shadow-md cursor-pointer active:scale-98 transition-all"
        >
          <span className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-[#FF7F5B]" />
            <span>Navegação do Painel (Menu Lateral)</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Grid Principal: Menu Lateral à Esquerda + Conteúdo Principal à Direita */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* SIDEBAR LATERAL ESQUERDA COM DROP-DOWNS */}
        <aside className={`w-full lg:w-72 shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#101B1E] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 lg:sticky lg:top-24">
            {/* GRUPO 1: JORNADAS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2.5 py-1">
                <button
                  type="button"
                  onClick={() => toggleMenuGroup('content')}
                  className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#FF7F5B] hover:text-[#ff9b7d] transition-colors cursor-pointer select-none"
                >
                  <span>Jornadas</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenuGroups.content ? 'rotate-0' : '-rotate-90'}`} />
                </button>
              </div>

              {openMenuGroups.content && (
                <div className="space-y-1 pl-1 max-h-[46vh] overflow-y-auto pr-1 scrollbar-thin">
                  {journeys.length === 0 ? (
                    <p className="text-[11px] text-slate-500 p-2">Nenhuma jornada cadastrada.</p>
                  ) : (
                    journeys.map(journey => {
                      const isTrilhaSelected = activeAdminTab === 'content' && selectedJourneyId === journey.id;
                      const hasMultipleModules = (journey.modules?.length || 0) > 1;
                      const isTrilhaExpanded = hasMultipleModules && (openTrilhas[journey.id] ?? isTrilhaSelected);

                      return (
                        <div key={journey.id} className="space-y-0.5">
                          {/* Linha da Jornada com barrinha lateral indicadora */}
                          <div
                            className={`w-full px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                              isTrilhaSelected && !selectedModuleId
                                ? 'text-[#FF7F5B] bg-[#FF7F5B]/10 border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                                : isTrilhaSelected
                                ? 'text-white bg-white/[0.04] border-l-[3px] border-white/30 rounded-r-xl rounded-l-none pl-2.5'
                                : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                            }`}
                            onClick={() => {
                              setActiveAdminTab('content');
                              setSelectedJourneyId(journey.id);
                              setSelectedModuleId(null);
                              if (hasMultipleModules) {
                                toggleTrilha(journey.id);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* Farol lateral indicador de status: Cinza se Desabilitada, Amarelo se Em Breve, Verde se Ativa */}
                              <span 
                                className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                                  journey.isEnabled === false
                                    ? 'bg-slate-400 ring-2 ring-slate-400/25'
                                    : journey.isComingSoon 
                                    ? 'bg-amber-400 ring-2 ring-amber-400/25' 
                                    : 'bg-emerald-400 ring-2 ring-emerald-400/25'
                                }`}
                                title={
                                  journey.isEnabled === false
                                    ? 'Status: Desabilitada'
                                    : journey.isComingSoon ? 'Status: Em Breve' : 'Status: Ativa'
                                }
                              />
                              <span className={`truncate ${journey.isEnabled === false ? 'text-slate-400' : ''}`}>{journey.title}</span>
                            </div>

                            {/* Se tem múltiplos módulos, exibe seta do dropdown temática */}
                            {hasMultipleModules && (
                              <div className="flex items-center shrink-0 ml-1.5">
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    isTrilhaExpanded ? 'rotate-0' : '-rotate-90'
                                  } ${
                                    isTrilhaSelected && !selectedModuleId
                                      ? 'text-[#FF7F5B]'
                                      : 'text-slate-400 group-hover:text-white'
                                  }`}
                                />
                              </div>
                            )}
                          </div>

                          {/* Módulos aninhados da Jornada (apenas se tiver mais de 1 módulo) */}
                          {hasMultipleModules && isTrilhaExpanded && (
                            <div className="pl-3.5 space-y-0.5 border-l border-white/10 ml-3 my-1">
                              {(journey.modules || []).map((mod, modIdx) => {
                                const isModSelected = isTrilhaSelected && selectedModuleId === mod.id;

                                return (
                                  <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => {
                                      setActiveAdminTab('content');
                                      setSelectedJourneyId(journey.id);
                                      setSelectedModuleId(mod.id);
                                      setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full px-2 py-1.5 text-[11px] transition-all flex items-center justify-between text-left cursor-pointer ${
                                      isModSelected
                                        ? 'text-[#FF7F5B] font-bold bg-[#FF7F5B]/10 border-l-2 border-[#FF7F5B] pl-2 rounded-r-lg rounded-l-none'
                                        : 'text-white/90 hover:text-white hover:bg-white/5 border-l-2 border-transparent pl-2 rounded-r-lg rounded-l-none'
                                    }`}
                                  >
                                    <span className="truncate pr-1 flex items-center gap-1.5">
                                      <span className="text-[10px] opacity-70 font-mono text-white/70">{modIdx + 1}.</span>
                                      <span className="truncate">{mod.title}</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Botão Criar Jornada abaixo da última jornada com espaçamento equilibrado */}
                  <div className="pt-2.5 mt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAdminTab('content');
                        setIsCreateJourneyModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-[#FF7F5B] text-white hover:text-[#FF7F5B] hover:bg-[#FF7F5B]/10 text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
                    >
                      <span>+ Criar Jornada</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO DESTAQUES */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setActiveAdminTab('destaques');
                  setSelectedJourneyId('');
                  setSelectedModuleId(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer select-none ${
                  activeAdminTab === 'destaques'
                    ? 'text-white bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                    : 'text-[#FF7F5B] hover:text-[#ff9b7d]'
                }`}
              >
                <span>Destaques</span>
              </button>
            </div>

            {/* GRUPO 2: COMUNIDADE & MODERAÇÃO */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => toggleMenuGroup('community')}
                className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#FF7F5B] hover:text-[#ff9b7d] transition-colors cursor-pointer select-none"
              >
                <span>Comunidade & Moderação</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenuGroups.community ? 'rotate-0' : '-rotate-90'}`} />
              </button>

              {openMenuGroups.community && (
                <div className="space-y-1 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('moderation');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeAdminTab === 'moderation'
                        ? 'text-[#FF7F5B] font-bold bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                        : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                    }`}
                  >
                    <span>Moderação de Posts</span>
                    {modItems.filter(m => m.status === 'pendente').length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                        activeAdminTab === 'moderation' ? 'bg-[#FF7F5B]/20 text-[#FF7F5B]' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {modItems.filter(m => m.status === 'pendente').length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('polls');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeAdminTab === 'polls'
                        ? 'text-[#FF7F5B] font-bold bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                        : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                    }`}
                  >
                    <span>Enquetes</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                      activeAdminTab === 'polls' ? 'bg-[#FF7F5B]/20 text-[#FF7F5B]' : 'bg-white/10 text-slate-400'
                    }`}>
                      {polls.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* GRUPO 3: ACOLHIMENTO & ATENDIMENTO */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => toggleMenuGroup('support')}
                className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#FF7F5B] hover:text-[#ff9b7d] transition-colors cursor-pointer select-none"
              >
                <span>Acolhimento & SOS</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenuGroups.support ? 'rotate-0' : '-rotate-90'}`} />
              </button>

              {openMenuGroups.support && (
                <div className="space-y-1 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('sos');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeAdminTab === 'sos'
                        ? 'text-[#FF7F5B] font-bold bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                        : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                    }`}
                  >
                    <span>Atendimento SOS</span>
                    {pendingCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                        activeAdminTab === 'sos' ? 'bg-[#FF7F5B]/20 text-[#FF7F5B]' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('analytics');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeAdminTab === 'analytics'
                        ? 'text-[#FF7F5B] font-bold bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                        : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                    }`}
                  >
                    <span>Termômetro Emocional</span>
                  </button>
                </div>
              )}
            </div>

            {/* GRUPO 4: MEMBROS */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => toggleMenuGroup('users')}
                className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#FF7F5B] hover:text-[#ff9b7d] transition-colors cursor-pointer select-none"
              >
                <span>Membros</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenuGroups.users ? 'rotate-0' : '-rotate-90'}`} />
              </button>

              {openMenuGroups.users && (
                <div className="space-y-1 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAdminTab('users');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      activeAdminTab === 'users'
                        ? 'text-[#FF7F5B] font-bold bg-white/[0.06] border-l-[3px] border-[#FF7F5B] rounded-r-xl rounded-l-none pl-2.5'
                        : 'text-white hover:text-[#FF7F5B] hover:bg-white/5 border-l-[3px] border-transparent rounded-r-xl rounded-l-none pl-2.5'
                    }`}
                  >
                    <span>Gestão de Membros</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                      activeAdminTab === 'users' ? 'bg-[#FF7F5B]/20 text-[#FF7F5B]' : 'bg-white/10 text-slate-400'
                    }`}>
                      {members.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL À DIREITA */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* ESTADO INICIAL: NENHUM ITEM SELECIONADO NO MENU LATERAL */}
          {!activeAdminTab && (
            <section className="bg-[#101B1E] p-8 sm:p-12 rounded-3xl border border-white/10 shadow-xl text-center space-y-4 max-w-xl mx-auto my-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#FF7F5B]/15 border border-[#FF7F5B]/30 text-[#FF7F5B] flex items-center justify-center mx-auto text-2xl shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Painel Administrativo
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Selecione uma categoria no menu lateral para gerenciar as Jornadas de Conhecimento, Moderação de Posts, Atendimento SOS, Membros ou Enquetes.
                </p>
              </div>
            </section>
          )}

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

            {/* Urgency Filter Pills and Refresh Button */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => loadTickets()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070D0F] hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl border border-white/10 text-xs font-bold transition-all cursor-pointer"
                title="Atualizar chamados"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FF7F5B]" />
                <span>Atualizar</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#070D0F] p-1.5 rounded-2xl border border-white/10">
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
                    onClick={() => handleSelectSosTicket(ticket)}
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

                      {/* Colored Urgency Dot Indicator */}
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

                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <h5 className="text-xs font-medium text-slate-300 truncate leading-snug flex-1">{ticket.subject}</h5>
                      {ticket.status === 'em_atendimento' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">
                          Em Atendimento
                        </span>
                      )}
                      {ticket.status === 'pendente' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                          Pendente
                        </span>
                      )}
                      {(ticket.status === 'arquivado' || ticket.status === 'atendido') && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                          Finalizado
                        </span>
                      )}
                    </div>
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

                  {/* Subject & Status Banner */}
                  <div className="flex items-center justify-between bg-[#101B1E] p-3 rounded-xl border border-white/10">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-black text-[#FF7F5B] truncate">{selectedSosTicket.subject}</h4>
                      <span className="text-[10px] text-slate-400">Aberto em {selectedSosTicket.createdAt}</span>
                    </div>
                    <div className="shrink-0">
                      {selectedSosTicket.status === 'em_atendimento' ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Em Atendimento
                        </span>
                      ) : selectedSosTicket.status === 'pendente' ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Aguardando
                        </span>
                      ) : (selectedSosTicket.status === 'arquivado' || selectedSosTicket.status === 'atendido') ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Concluído
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Lixeira
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conversation Messages Thread */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto p-1 pr-2">
                    {selectedSosTicket.messages && selectedSosTicket.messages.length > 0 ? (
                      selectedSosTicket.messages.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                            m.sender === 'admin'
                              ? 'bg-[#162327] border-[#FF7F5B]/30 ml-4'
                              : 'bg-[#101B1E] border-white/10 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px]">
                            <span className={`font-bold flex items-center gap-1.5 ${
                              m.sender === 'admin' ? 'text-[#FF7F5B]' : 'text-slate-300'
                            }`}>
                              {m.sender === 'admin' ? '🌸 Equipe Elana' : (m.senderName || selectedSosTicket.userName)}
                            </span>
                            <span className="text-slate-500">{m.createdAt}</span>
                          </div>
                          <p className="text-slate-100 whitespace-pre-wrap">{m.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#101B1E] p-4 rounded-xl border border-white/10 space-y-2">
                        <p className="text-xs text-slate-100 italic leading-relaxed">
                          "{selectedSosTicket.message}"
                        </p>
                        {selectedSosTicket.adminReply && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1 text-xs text-emerald-200 mt-2">
                            <span className="font-bold text-[10px] text-emerald-400 block">Resposta Anterior:</span>
                            <p className="italic">"{selectedSosTicket.adminReply}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reply Form & Action Buttons (If not deleted) */}
                  {selectedSosTicket.status !== 'deletado' && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      {(selectedSosTicket.status === 'arquivado' || selectedSosTicket.status === 'atendido') ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Atendimento concluído e arquivado.</span>
                          </div>
                          <button
                            onClick={() => handleRestoreTicket(selectedSosTicket.id)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                          >
                            Reabrir Chamado
                          </button>
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={sosReplyText}
                            onChange={(e) => setSosReplyText(e.target.value)}
                            placeholder="Escreva uma resposta acolhedora para o membro da comunidade..."
                            rows={3}
                            className="w-full p-3 bg-[#101B1E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7F5B] resize-none"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={handleSendSosReply}
                              disabled={!sosReplyText.trim()}
                              className="py-2.5 px-3 bg-[#FF7F5B] hover:bg-[#e06847] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              title="Envia a resposta e mantém o atendimento aberto para continuar conversando"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar Resposta</span>
                            </button>

                            <button
                              onClick={async () => {
                                if (sosReplyText.trim()) {
                                  await handleSendSosReply();
                                }
                                await handleArchiveTicket(selectedSosTicket.id);
                              }}
                              className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Conclui o atendimento e arquiva o chamado"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Concluir & Arquivar</span>
                            </button>
                          </div>
                        </>
                      )}
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
      {activeAdminTab === 'moderation' && (() => {
        const displayedModItems = modItems.filter(item => {
          if (moderationFilter === 'pendentes') return item.status === 'pendente';
          if (moderationFilter === 'aprovados') return item.status === 'aprovado';
          return true;
        });

        const pendingCount = modItems.filter(m => m.status === 'pendente').length;
        const approvedCount = modItems.filter(m => m.status === 'aprovado').length;

        return (
          <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ShieldCheck className="w-5 h-5 text-[#8A9A5B]" />
                  Fila de Moderação Antijulgamento
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Avalie os alertas da IA Antijulgamento para manter a comunidade livre de julgamentos e cobranças.
                </p>
              </div>

              {/* Filtros da Moderação */}
              <div className="flex items-center gap-1.5 bg-[#070D0F] p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setModerationFilter('pendentes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    moderationFilter === 'pendentes'
                      ? 'bg-[#FF7F5B] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Pendentes</span>
                  {pendingCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      moderationFilter === 'pendentes' ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModerationFilter('aprovados')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    moderationFilter === 'aprovados'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Aprovados</span>
                  {approvedCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      moderationFilter === 'aprovados' ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'
                    }`}>
                      {approvedCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModerationFilter('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    moderationFilter === 'todos'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Todos ({modItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModerationFilter('aprendizado');
                    loadLearnedExamples();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    moderationFilter === 'aprendizado'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-purple-300" />
                  <span>Base IA ({learnedExamples.length})</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {moderationFilter === 'aprendizado' ? (
                <div className="space-y-4">
                  {/* Header informativo da Base de Aprendizado */}
                  <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-purple-200">Auto-Aprendizado Ativo (Human-in-the-Loop)</h4>
                        <p className="text-purple-300/80 text-[11px] leading-relaxed mt-0.5">
                          Toda vez que você remove uma publicação, ela alimenta o banco vetorial e as diretrizes do Gemini. Novos posts com semântica ou intenção semelhante são barrados automaticamente.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                        {learnedExamples.filter(e => e.is_active).length} ativas / {learnedExamples.length} regras
                      </span>
                    </div>
                  </div>

                  {/* Campo de Busca nos Padrões Banidos */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={learnedSearchQuery}
                      onChange={e => setLearnedSearchQuery(e.target.value)}
                      placeholder="Pesquisar nos padrões banidos ou motivos..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#070D0F] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  {/* Lista de Exemplos Aprendidos */}
                  {isLoadingLearned ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Carregando base de aprendizado...</div>
                  ) : learnedExamples.length === 0 ? (
                    <div className="bg-[#070D0F] p-8 rounded-2xl border border-white/5 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <Brain className="w-8 h-8 text-purple-400/40" />
                      <span className="font-bold text-slate-300">Nenhum padrão cadastrado ainda</span>
                      <span className="text-[11px] text-slate-500 max-w-md">
                        Quando você clicar em "Remover Post" na fila de moderação, o padrão da publicação será salvo aqui automaticamente.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {learnedExamples
                        .filter(ex => {
                          if (!learnedSearchQuery.trim()) return true;
                          const q = learnedSearchQuery.toLowerCase();
                          return ex.original_text.toLowerCase().includes(q) || ex.reason.toLowerCase().includes(q);
                        })
                        .map(ex => (
                          <div
                            key={ex.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              ex.is_active
                                ? 'bg-[#070D0F] border-purple-500/20 shadow-sm'
                                : 'bg-[#070D0F]/50 border-white/5 opacity-60'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                  ex.category === 'vulnerabilidade'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                }`}>
                                  {ex.category === 'vulnerabilidade' ? '💔 Vulnerabilidade' : '🛡️ Antijulgamento / Violação'}
                                </span>
                                <span className="text-[11px] text-slate-300 font-bold">
                                  {ex.reason}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-[10px] text-slate-500">
                                  {new Date(ex.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleLearnedActive(ex.id, ex.is_active)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                                    ex.is_active
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                                  }`}
                                  title={ex.is_active ? 'Clique para pausar esta regra' : 'Clique para reativar esta regra'}
                                >
                                  <Power className="w-3 h-3" />
                                  <span>{ex.is_active ? 'Ativo no Filtro' : 'Pausado'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLearnedExample(ex.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir da base de aprendizado"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 italic bg-[#101B1E] p-3 rounded-xl border border-white/5">
                              "{ex.original_text}"
                            </p>
                            {ex.admin_notes && (
                              <span className="text-[10px] text-slate-500 block mt-1.5 pl-1">
                                Nota: {ex.admin_notes}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : displayedModItems.length === 0 ? (
                <div className="bg-[#070D0F] p-8 rounded-2xl border border-white/5 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-[#8A9A5B] opacity-60" />
                  <span className="font-bold text-slate-300">
                    {moderationFilter === 'pendentes' 
                      ? 'Fila de moderação limpa!' 
                      : moderationFilter === 'aprovados' 
                        ? 'Nenhuma publicação aprovada encontrada' 
                        : 'Nenhuma publicação registrada'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {moderationFilter === 'pendentes'
                      ? 'Nenhuma publicação pendente de revisão no momento. Todas as postagens respeitam as diretrizes de acolhimento.'
                      : 'Todas as publicações aprovadas permanecem visíveis para a comunidade.'}
                  </span>
                </div>
              ) : (
                displayedModItems.map(item => (
                  <div key={item.id} className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <img src={item.authorAvatar} alt={item.authorName} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.authorName}</h4>
                          <span className="text-[10px] text-[#FF7F5B] font-bold">
                            {item.type === 'comment' ? '💬 Comentário' : `Sala: ${item.roomName}`} • {item.createdAt}
                          </span>
                        </div>
                        {(item.reportCount ?? 0) > 0 && (
                          <span className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            🚩 {item.reportCount} denúncia{(item.reportCount ?? 0) > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit ${
                        item.status === 'pendente'
                          ? item.flagReason.includes('Acolhimento')
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.status === 'pendente' ? (
                          <>
                            {item.flagReason.includes('Acolhimento') ? (
                              <Heart className="w-3 h-3 text-rose-400 fill-rose-400/20" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                            {item.flagReason}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Aprovado
                          </>
                        )}
                      </span>
                    </div>

                    <div className="bg-[#101B1E] p-3.5 rounded-xl border border-white/5 text-xs text-slate-200 italic leading-relaxed">
                      "{item.content}"
                    </div>

                    {item.status === 'pendente' ? (
                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleModerateItem(item.id, 'rejeitado')}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{item.type === 'comment' ? 'Remover Comentário' : 'Remover Post'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModerateItem(item.id, 'aprovado')}
                          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.type === 'comment' ? 'Aprovar Comentário' : 'Aprovar Publicação'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-xs font-bold flex items-center gap-1 ${item.status === 'aprovado' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.status === 'aprovado' ? '✓ Aprovado e Mantido na Comunidade' : '✕ Removido por infringir diretrizes de acolhimento'}
                        </span>
                        {item.status === 'aprovado' && (
                          <button
                            type="button"
                            onClick={() => handleModerateItem(item.id, 'rejeitado')}
                            className="text-xs text-red-400/80 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover da Comunidade</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })()}

      {/* TAB 3: 📊 TERMÔMETRO EMOCIONAL DA COMUNIDADE */}
      {activeAdminTab === 'analytics' && (
        <section className="bg-[#101B1E] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <TrendingUp className="w-5 h-5 text-[#FFD166]" />
                Termômetro Emocional (Saúde da Comunidade)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Métricas reais calculadas exclusivamente a partir de check-ins e interações de usuários cadastrados.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadEmotionalAnalytics}
                disabled={isLoadingAnalytics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Recarregar dados reais do termômetro"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin text-[#FF7F5B]' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* CARDS DE VISÃO GERAL */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuários Cadastrados</span>
              <span className="text-xl sm:text-2xl font-black text-[#FF7F5B]">
                {isLoadingAnalytics ? '...' : (emotionalStats?.totalActiveUsers ?? members.length).toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-emerald-400 block">Perfis registrados reais</span>
            </div>

            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tópicos Publicados</span>
              <span className="text-xl sm:text-2xl font-black text-[#38BDF8]">
                {isLoadingAnalytics ? '...' : (emotionalStats?.totalPosts ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-slate-400 block">Publicações ativas no feed</span>
            </div>

            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acolhimentos Totais</span>
              <span className="text-xl sm:text-2xl font-black text-[#8A9A5B]">
                {isLoadingAnalytics ? '...' : (emotionalStats?.totalAcolhimentos ?? 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-emerald-400 block">Reações e comentários</span>
            </div>

            <div className="bg-[#070D0F] p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Média por Publicação</span>
              <span className="text-xl sm:text-2xl font-black text-[#FFD166]">
                {isLoadingAnalytics ? '...' : `${emotionalStats?.averageAcolhimentosPerPost ?? 0}`}
              </span>
              <span className="text-[10px] text-slate-400 block">Acolhimentos / post</span>
            </div>
          </div>

          {/* 🌡️ TERMÔMETRO DE SAÚDE DA REDE & ALERTA DE ESCUTA */}
          <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            emotionalStats?.supportHealthStatus === 'alerta'
              ? 'bg-rose-950/20 border-rose-500/30'
              : emotionalStats?.supportHealthStatus === 'atencao'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-emerald-950/20 border-emerald-500/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full shrink-0 ${
                  emotionalStats?.supportHealthStatus === 'alerta'
                    ? 'bg-rose-500 animate-ping'
                    : emotionalStats?.supportHealthStatus === 'atencao'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`} />
                <h3 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                  <span>Termômetro da Rede de Apoio:</span>
                  <span className={
                    emotionalStats?.supportHealthStatus === 'alerta'
                      ? 'text-rose-400'
                      : emotionalStats?.supportHealthStatus === 'atencao'
                      ? 'text-amber-300'
                      : 'text-emerald-400'
                  }>
                    {emotionalStats?.supportHealthLabel || 'Rede Viva & Ativa 💚'}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-300">
                  <strong className="text-white">{emotionalStats?.averageAcolhimentosPerPost ?? 0}</strong> acolhimentos/post
                </span>
                <span className="text-slate-600">•</span>
                <span className={emotionalStats && emotionalStats.postsWithoutRepliesCount > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                  {emotionalStats?.postsWithoutRepliesCount ?? 0} post(s) sem resposta
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <p className="leading-relaxed text-slate-300">
                {emotionalStats?.supportHealthMessage}
              </p>
              {emotionalStats && emotionalStats.postsWithoutRepliesCount > 0 && (
                <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Priorizar acolhimento da equipe
                </span>
              )}
            </div>
          </div>

          {/* Emotional Breakdown Progress */}
          <div className="bg-[#070D0F] p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#E66795]" />
                Sentimentos Registrados nos Check-ins
              </h3>
              <span className="text-xs text-slate-400">
                {emotionalStats ? `${emotionalStats.totalCheckins} check-in${emotionalStats.totalCheckins === 1 ? '' : 's'} registrado${emotionalStats.totalCheckins === 1 ? '' : 's'}` : 'Carregando...'}
              </span>
            </div>

            {(!emotionalStats || emotionalStats.totalCheckins === 0) ? (
              <div className="py-8 text-center space-y-2 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ainda não há check-ins emocionais registrados por usuários cadastrados. Assim que os membros registrarem seus sentimentos diários na Comunidade, as porcentagens aparecerão aqui automaticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {emotionalStats.breakdown.map(item => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span className={`flex items-center gap-1.5 ${item.textColor}`}>
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-slate-300">
                        {item.percentage}% ({item.count} {item.count === 1 ? 'registro' : 'registros'})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.barColor} rounded-full transition-all duration-500`} 
                        style={{ width: `${Math.max(item.percentage, item.count > 0 ? 3 : 0)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: 🎬 GESTÃO DE CONTEÚDOS & JORNADAS */}
      {activeAdminTab === 'content' && (
        <AdminContentManager 
          showToast={showToast}
          selectedJourneyId={selectedJourneyId || undefined}
          onSelectJourneyId={setSelectedJourneyId}
          selectedModuleId={selectedModuleId}
          onSelectModuleId={setSelectedModuleId}
          isCreateJourneyModalOpen={isCreateJourneyModalOpen}
          onCloseCreateJourneyModal={() => setIsCreateJourneyModalOpen(false)}
        />
      )}

      {/* TAB: 🌟 GESTÃO DE DESTAQUES */}
      {activeAdminTab === 'destaques' && (
        <AdminDestaquesManager />
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
                    {member.bio && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-slate-300 italic bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10 truncate max-w-xs">
                          "{member.bio}"
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClearMemberBio(member.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline font-bold cursor-pointer shrink-0"
                          title="Zerar bio deste membro"
                        >
                          Zerar Bio
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === 'guia' ? (
                    <span className="text-[10px] font-extrabold bg-[#8A9A5B]/20 text-[#8A9A5B] border border-[#8A9A5B]/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Guia & Mentora Oficial
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-full">
                      Membro da Comunidade
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
          {/* Card 1: Criar Nova Enquete (Expansível / Retrátil) */}
          <section className="bg-[#101B1E] rounded-3xl border border-white/10 shadow-xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsCreatePollOpen(!isCreatePollOpen)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer select-none"
            >
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span>Criar Nova Enquete</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isCreatePollOpen
                    ? 'Preencha os campos abaixo para publicar uma nova enquete na comunidade.'
                    : 'Clique para expandir e lançar uma nova enquete para os membros.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  isCreatePollOpen
                    ? 'bg-white/5 text-slate-300 border-white/10'
                    : 'bg-[#FF7F5B]/15 text-[#FF7F5B] border-[#FF7F5B]/30'
                }`}>
                  <span>{isCreatePollOpen ? 'Recolher' : '+ Nova Enquete'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCreatePollOpen ? 'rotate-180' : 'rotate-0'}`} />
                </span>
              </div>
            </button>

            {isCreatePollOpen && (
              <div className="p-6 sm:p-8 pt-0 border-t border-white/5 space-y-4 animate-fade-in">
                {pollSuccessMessage && (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in mt-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enquete publicada com sucesso na Comunidade! 🎉</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newPollTitle.trim()) return;
                    const validOptions = newPollOptions.map(opt => opt.trim()).filter(Boolean);
                    if (validOptions.length < 2) {
                      alert('Por favor, preencha pelo menos 2 alternativas de voto para a enquete.');
                      return;
                    }

                    setIsPublishingPoll(true);
                    try {
                      await createPoll({
                        title: newPollTitle.trim(),
                        description: newPollDesc.trim() || undefined,
                        category: selectedPollJourneys.length > 0 ? selectedPollJourneys.join(', ') : undefined,
                        isMultiSelect: isPollMultiSelect,
                        options: validOptions
                      });
                      setNewPollTitle('');
                      setNewPollDesc('');
                      setNewPollOptions(['', '']);
                      setSelectedPollJourneys([]);
                      setIsPollMultiSelect(false);
                      setPollSuccessMessage(true);
                      setTimeout(() => {
                        setPollSuccessMessage(false);
                        setIsCreatePollOpen(false);
                      }, 2000);
                    } finally {
                      setIsPublishingPoll(false);
                    }
                  }}
                  className="space-y-5 pt-4"
                >
                  {/* 1. Pergunta da Enquete */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Pergunta da Enquete *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPollTitle}
                      onChange={(e) => setNewPollTitle(e.target.value)}
                      placeholder="Ex: Qual o maior desafio na rotina com o seu filho atualmente?"
                      className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* 2. Descrição ou Contexto */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Descrição ou Contexto (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newPollDesc}
                      onChange={(e) => setNewPollDesc(e.target.value)}
                      placeholder="Ex: Sua resposta ajuda nossa curadoria a priorizar os próximos conteúdos e encontros."
                      className="w-full bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                    />
                  </div>

                  {/* 3. Alternativas de Voto da Enquete */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Alternativas de Voto *
                      </label>
                      <span className="text-xs font-mono font-bold text-[#FF7F5B]">
                        {newPollOptions.filter(o => o.trim().length > 0).length} preenchida(s)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {newPollOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#FF7F5B] w-6 shrink-0 text-right">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                            placeholder={`Alternativa ${idx + 1} (ex: Dificuldades com o sono noturno)`}
                            className="flex-1 bg-[#070D0F] border border-white/10 focus:border-[#FF7F5B] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all"
                          />
                          {newPollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePollOption(idx)}
                              className="p-2.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-all cursor-pointer shrink-0"
                              title="Remover esta alternativa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleAddPollOption}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FF7F5B]" />
                        <span>Adicionar Outra Alternativa</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Jornadas de Conhecimento */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Jornadas de Conhecimento
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {selectedPollJourneys.length} vinculada(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {journeys.map((j) => {
                        const isSelected = selectedPollJourneys.includes(j.title);
                        return (
                          <button
                            key={j.id}
                            type="button"
                            onClick={() => toggleJourneyInPoll(j.title)}
                            className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#FF7F5B]/15 border-[#FF7F5B] text-white shadow-sm'
                                : 'bg-[#070D0F] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate flex-1">{j.title}</span>
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected ? 'bg-[#FF7F5B] text-slate-950 font-black' : 'border border-white/20'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedPollJourneys.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Jornadas vinculadas:</span>
                        {selectedPollJourneys.map((tag, i) => (
                          <span key={i} className="text-[11px] bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                            <span className="text-[#FF7F5B] font-mono font-bold">#</span>
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => toggleJourneyInPoll(tag)}
                              className="hover:text-rose-400 text-xs ml-1 cursor-pointer"
                              title="Desvincular jornada"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 5. Switch de Múltipla Escolha */}
                  <div className="flex items-center justify-between p-4 bg-[#070D0F] border border-white/10 rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-white block">Possibilidade de Múltipla Escolha?</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Quando ativo, os membros da comunidade poderão selecionar mais de uma alternativa ao votar.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPollMultiSelect(!isPollMultiSelect)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        isPollMultiSelect ? 'bg-[#FF7F5B]' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-md ${
                          isPollMultiSelect ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
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
              </div>
            )}
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
              {polls.slice(0, visiblePollsCount).map((poll) => {
                const total = Math.max(1, poll.totalVotes);
                const isOpen = poll.status === 'open';
                const isExpanded = !!expandedPollIds[poll.id];

                return (
                  <div
                    key={poll.id}
                    className="bg-[#070D0F] p-5 rounded-2xl border border-white/10 space-y-3 shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isOpen
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}>
                            {isOpen ? '🟢 Aberta para Votação' : '⚪ Encerrada'}
                          </span>
                          {poll.isMultiSelect && (
                            <span className="text-[10px] font-bold bg-[#FF7F5B]/15 text-[#FF7F5B] border border-[#FF7F5B]/30 px-2 py-0.5 rounded-full">
                              ☑️ Múltipla Escolha
                            </span>
                          )}
                          {poll.category && (
                            <span className="text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10 px-2 py-0.5 rounded-full truncate max-w-xs">
                              📂 {poll.category}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            • {poll.totalVotes} votos
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                          {poll.title}
                        </h4>
                        {poll.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {poll.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Botão de Expandir / Ocultar alternativas e resultados */}
                        <button
                          type="button"
                          onClick={() => togglePollExpansion(poll.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isExpanded
                              ? 'bg-[#FF7F5B]/15 text-[#FF7F5B] border-[#FF7F5B]/30'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                          }`}
                          title={isExpanded ? 'Ocultar alternativas e resultados' : 'Expandir alternativas e resultados'}
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Ver Resultados'}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                        </button>

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

                    {/* Progress bars per option (apenas visível quando expandido) */}
                    {isExpanded && (
                      <div className="space-y-2 pt-3 border-t border-white/10 animate-fade-in">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Alternativas & Resultados:
                        </span>
                        {(poll.options || []).map((opt) => {
                          const pct = Math.round(((opt?.votesCount || 0) / total) * 100);
                          return (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-300">
                                <span>{opt.text}</span>
                                <span className="font-mono font-bold text-[#FFD166]">
                                  {opt.votesCount || 0} ({pct}%)
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
                    )}
                  </div>
                );
              })}

              {/* Botão Carregar Mais Enquetes */}
              {polls.length > visiblePollsCount && (
                <div className="pt-4 flex justify-center border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setVisiblePollsCount(prev => prev + 5)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm"
                  >
                    <span>Carregar Mais ({polls.length - visiblePollsCount} restantes)</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

        </main>
      </div>

      {/* 🚫 Modal de Remoção e Calibração da IA */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setRejectModalItem(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[#0E1A1E] border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-white">Remover & Ensinar Filtro da IA</h3>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#070D0F] p-3.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">
                  Publicação de {rejectModalItem.authorName} ({rejectModalItem.roomName}):
                </span>
                <p className="text-xs text-slate-200 italic line-clamp-3">"{rejectModalItem.content}"</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Classificação da Violação:
                </label>
                <select
                  value={rejectCategory}
                  onChange={e => setRejectCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#070D0F] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="antijulgamento">🛡️ Antijulgamento / Agressão / Mom-shaming</option>
                  <option value="antijulgamento">🚫 Violação de consentimento / Abuso sexual / Coerção</option>
                  <option value="antijulgamento">🔞 Conteúdo sexualmente explícito / Pornográfico</option>
                  <option value="vulnerabilidade">💔 Risco à vida / Sofrimento extremo / Ideação</option>
                  <option value="outro">🗑️ Outro / Spam / Desrespeito às regras</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Motivo da Remoção (diretriz para a IA):
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Ex: Coerção sexual velada / Desrespeito à recusa do parceiro"
                  className="w-full px-3.5 py-2.5 bg-[#070D0F] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <label className="flex items-start gap-3 bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-2xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trainFilterActive}
                  onChange={e => setTrainFilterActive(e.target.checked)}
                  className="accent-purple-500 w-4 h-4 mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-purple-200 block">
                    Salvar na Base de Auto-Aprendizado da IA
                  </span>
                  <p className="text-[11px] text-purple-300/80 leading-relaxed">
                    Gera embedding vetorial e adiciona este texto como exemplo no filtro nativo, barrando automaticamente posts futuros parecidos.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                disabled={isSubmittingRejection}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={isSubmittingRejection}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                {isSubmittingRejection ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirmar Remoção</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

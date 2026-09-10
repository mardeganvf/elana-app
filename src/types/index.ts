export type PillarType = 'luz' | 'raizes' | 'movimento';
export type JourneyCategory = 'comecam' | 'transformam';

export interface LessonResource {
  title: string;
  type: 'pdf' | 'audio' | 'link';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  subgroup?: string;
  duration: string;
  videoUrl: string;
  description: string;
  xpPoints: number;
  thumbnailUrl?: string;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Journey {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  pillar: PillarType;
  pillarAttribute: string;
  category: JourneyCategory;
  targetAudience: string;
  themeColor: string;
  bgLight: string;
  iconName: string;
  price: number;
  modules: CourseModule[];
  isComingSoon?: boolean;
  coverImageUrl?: string;
  isEnabled?: boolean;
}

export interface UserLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: string;
  description: string;
}

export interface Badge {
  id: string;
  title: string;
  name?: string;
  description: string;
  icon: string;
  color?: string;
  category: string;
  rewardXp: number;
  targetCount?: number;
  unitLabel?: string;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: string;
  familyTag?: string; // e.g. "Mãe de 2 (0-2 anos)" or "Pai de Primeira Viagem"
  purchasedJourneyIds: string[];
  completedLessonIds: string[];
  lessonNotes: Record<string, string>; // lessonId -> note
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  daysWithUs?: number;
  lastActiveDate: string;
  badges: Badge[];
  bio?: string;
  notificationsEnabled?: boolean;
  onboardingCompleted?: boolean;
  respiroCycles?: number;
  children?: {
    id: string;
    emoji: string;
    name: string;
    age: string;
    birthdate?: string;
    isPregnancy?: boolean;
  }[];
}

export type EmotionalIntention = 'ajuda' | 'desabafar' | 'celebrar';
export type SensitivityLevel = 'padrao' | 'elevado' | 'critico';
export type UserRoleType = 'membro' | 'guia' | 'curadoria' | 'admin';

export interface BrandReaction {
  id: string;
  label: string;
  useCase: string;
  iconName: string;
  color: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: UserRoleType;
  authorTag?: string; // e.g. "Mãe de 2 (0-2 anos)"
  content: string;
  createdAt: string;
  isAnonymous?: boolean;
  reactions?: Record<string, number>;
  userReactions?: Record<string, boolean>;
  status?: 'aprovado' | 'sob_moderacao';
  reportCount?: number;
}

export interface CommunityPost {
  id: string;
  journeyId?: string;
  transversalRoomId?: string;
  ageBracketId?: string;
  emotionalIntention?: EmotionalIntention;
  moduleTopic?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: UserRoleType;
  authorTag?: string; // e.g. "Mãe de 2 (0-2 anos)"
  isAnonymous?: boolean;
  sensitivityLevel: SensitivityLevel;
  status?: 'aprovado' | 'sob_moderacao' | 'removido_usuario';
  flagReason?: string;
  flagType?: 'vulnerabilidade' | 'antijulgamento';
  title: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>; // e.g. { estou_aqui: 5, vai_dar_certo: 3 }
  userReactions?: Record<string, boolean>; // e.g. { estou_aqui: true }
  comments: CommunityComment[];
  reportCount?: number;
}

export interface ContentReport {
  contentType: 'post' | 'comment';
  contentId: string;
  reason: string;
}

export interface StoryItem {
  id: string;
  title: string;
  category: string;
  journeyIds?: string[];
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  date: string;
  likes: number;
  displayOrder?: number;
  isArchived?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface CommunityPoll {
  id: string;
  title: string;
  description?: string;
  category?: string;
  isMultiSelect?: boolean;
  options: PollOption[];
  totalVotes: number;
  status: 'open' | 'closed';
  createdAt: string;
  expiresAt?: string;
  userVotedOptionId?: string;
  userVotedOptionIds?: string[];
}

export interface NewPollPayload {
  title: string;
  description?: string;
  category?: string;
  isMultiSelect?: boolean;
  options: string[];
}

export type PermissionKey =
  // Painel Admin & Gestão
  | 'admin_access'
  | 'admin_sos_reply'
  | 'admin_moderation'
  | 'admin_analytics'
  | 'admin_content_mgmt'
  | 'admin_destaques_mgmt'
  | 'admin_polls_mgmt'
  | 'admin_members_mgmt'
  | 'admin_permissions_mgmt'
  // Comunidade
  | 'community_create_posts'
  | 'community_comments'
  | 'community_guide_badge'
  | 'community_polls_vote'
  // Conteúdos
  | 'content_view_journeys'
  | 'emotional_checkin'
  | 'mentorship_access'
  // SOS
  | 'sos_create_ticket';

export type RolePermissionsRecord = Record<PermissionKey, boolean>;

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'admin' | 'community' | 'content' | 'support';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Painel Administrativo
  {
    key: 'admin_access',
    label: 'Acesso ao Painel Admin',
    description: 'Permite entrar e navegar na área de administração da plataforma.',
    category: 'admin'
  },
  {
    key: 'admin_sos_reply',
    label: 'Responder Central SOS',
    description: 'Atender chamados, responder pedidos de ajuda e alterar status de tickets SOS.',
    category: 'admin'
  },
  {
    key: 'admin_moderation',
    label: 'Moderação da Comunidade',
    description: 'Aprovar, rejeitar ou liberar posts e comentários flageados pela IA antijulgamento.',
    category: 'admin'
  },
  {
    key: 'admin_analytics',
    label: 'Termômetro Emocional & Métricas',
    description: 'Visualizar relatórios de humor, sentimentos e tendências de engajamento.',
    category: 'admin'
  },
  {
    key: 'admin_content_mgmt',
    label: 'Gestão de Conteúdos & Aulas',
    description: 'Criar, editar e organizar jornadas, módulos, aulas e uploads de vídeo.',
    category: 'admin'
  },
  {
    key: 'admin_destaques_mgmt',
    label: 'Gestão de Destaques',
    description: 'Adicionar, ordenar e configurar vídeos verticais em destaque na Home.',
    category: 'admin'
  },
  {
    key: 'admin_polls_mgmt',
    label: 'Gestão de Enquetes',
    description: 'Criar, publicar e encerrar enquetes da comunidade ("Sua Voz Importa").',
    category: 'admin'
  },
  {
    key: 'admin_members_mgmt',
    label: 'Gestão de Membros',
    description: 'Visualizar membros e alterar suas categorias de acesso (Usuário, Guia, Admin).',
    category: 'admin'
  },
  {
    key: 'admin_permissions_mgmt',
    label: 'Configuração de Permissões',
    description: 'Definir e customizar a matriz de autorizações e acessos da plataforma.',
    category: 'admin'
  },

  // Comunidade & Interação
  {
    key: 'community_create_posts',
    label: 'Publicar na Comunidade',
    description: 'Criar novas postagens, desabafos e pedidos de apoio na Aldeia.',
    category: 'community'
  },
  {
    key: 'community_comments',
    label: 'Comentar e Acolher',
    description: 'Enviar respostas, comentários de apoio e acolhimento aos outros membros.',
    category: 'community'
  },
  {
    key: 'community_guide_badge',
    label: 'Selo Guia',
    description: 'Exibir distintivo de Guia da comunidade no perfil e nas publicações.',
    category: 'community'
  },
  {
    key: 'community_polls_vote',
    label: 'Votar em Enquetes',
    description: 'Participar ativamente das enquetes abertas na comunidade.',
    category: 'community'
  },

  // Conteúdos & Bem-Estar
  {
    key: 'content_view_journeys',
    label: 'Acesso a Jornadas & Aulas',
    description: 'Assistir a todas as trilhas, aulas e materiais em vídeo liberados.',
    category: 'content'
  },
  {
    key: 'emotional_checkin',
    label: 'Check-in Emocional Diário',
    description: 'Registrar humor diário e acompanhar evolução no Termômetro Emocional.',
    category: 'content'
  },
  {
    key: 'mentorship_access',
    label: 'Materiais & Fóruns de Mentoria',
    description: 'Acesso a materiais complementares e círculos exclusivos de guias.',
    category: 'content'
  },

  // Suporte
  {
    key: 'sos_create_ticket',
    label: 'Abrir Chamados SOS',
    description: 'Enviar chamados confidenciais de acolhimento na Central SOS.',
    category: 'support'
  }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<'membro' | 'guia' | 'admin', RolePermissionsRecord> = {
  membro: {
    admin_access: false,
    admin_sos_reply: false,
    admin_moderation: false,
    admin_analytics: false,
    admin_content_mgmt: false,
    admin_destaques_mgmt: false,
    admin_polls_mgmt: false,
    admin_members_mgmt: false,
    admin_permissions_mgmt: false,
    community_create_posts: true,
    community_comments: true,
    community_guide_badge: false,
    community_polls_vote: true,
    content_view_journeys: true,
    emotional_checkin: true,
    mentorship_access: false,
    sos_create_ticket: true
  },
  guia: {
    admin_access: true,
    admin_sos_reply: true,
    admin_moderation: true,
    admin_analytics: false,
    admin_content_mgmt: false,
    admin_destaques_mgmt: false,
    admin_polls_mgmt: false,
    admin_members_mgmt: false,
    admin_permissions_mgmt: false,
    community_create_posts: true,
    community_comments: true,
    community_guide_badge: true,
    community_polls_vote: true,
    content_view_journeys: true,
    emotional_checkin: true,
    mentorship_access: true,
    sos_create_ticket: true
  },
  admin: {
    admin_access: true,
    admin_sos_reply: true,
    admin_moderation: true,
    admin_analytics: true,
    admin_content_mgmt: true,
    admin_destaques_mgmt: true,
    admin_polls_mgmt: true,
    admin_members_mgmt: true,
    admin_permissions_mgmt: true,
    community_create_posts: true,
    community_comments: true,
    community_guide_badge: true,
    community_polls_vote: true,
    content_view_journeys: true,
    emotional_checkin: true,
    mentorship_access: true,
    sos_create_ticket: true
  }
};


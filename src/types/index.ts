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
  duration: string;
  videoUrl: string;
  description: string;
  xpPoints: number;
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
  lastActiveDate: string;
  badges: Badge[];
}

export type EmotionalIntention = 'ajuda' | 'desabafar' | 'celebrar';
export type SensitivityLevel = 'padrao' | 'elevado' | 'critico';
export type UserRoleType = 'membro' | 'guia' | 'curadoria';

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
  status?: 'aprovado' | 'sob_moderacao';
  title: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>; // e.g. { estou_aqui: 5, vai_dar_certo: 3 }
  userReactions?: Record<string, boolean>; // e.g. { estou_aqui: true }
  comments: CommunityComment[];
}

export interface StoryItem {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  date: string;
  likes: number;
}

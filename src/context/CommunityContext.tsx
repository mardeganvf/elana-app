import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommunityPost, CommunityComment, EmotionalIntention, SensitivityLevel } from '../types';

import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CreatePostPayload {
  journeyId?: string;
  transversalRoomId?: string;
  ageBracketId?: string;
  emotionalIntention?: EmotionalIntention;
  moduleTopic?: string;
  title: string;
  content: string;
  isAnonymous?: boolean;
}

export const SHAMING_KEYWORDS = [
  'irresponsavel', 'irresponsável',
  'relaxada', 'preguicosa', 'preguiçosa',
  'pessima mae', 'péssima mãe',
  'pessimo pai', 'péssimo pai',
  'mae ruim', 'mãe ruim',
  'culpa sua', 'deveria ter vergonha',
  'sem nocao', 'sem noção',
  'coitado do bebe', 'coitado do bebê',
  'absurdo fazer isso', 'mae louca', 'mãe louca',
  'negligente', 'egoista', 'egoísta'
];

export const checkAntiShaming = (text: string): { isFlagged: boolean; matchedWord?: string } => {
  const lower = text.toLowerCase();
  for (const word of SHAMING_KEYWORDS) {
    if (lower.includes(word)) {
      return { isFlagged: true, matchedWord: word };
    }
  }
  return { isFlagged: false };
};

const ANON_PREFIXES = [
  'Coração', 'Alma', 'Respiro', 'Farol', 'Brisa', 'Semente', 'Horizonte', 'Abraço',
  'Luz', 'Gota', 'Vento', 'Sol', 'Refúgio', 'Estrela', 'Flor', 'Ninho', 'Porto',
  'Caminho', 'Sorriso', 'Sonho', 'Garoa', 'Jardim', 'Faísca', 'Oásis', 'Sombra',
  'Paz', 'Orvalho', 'Aconchego', 'Aurora', 'Espaço'
];

const ANON_DESCRIPTORS = [
  'Leve', 'Curioso', 'Sereno', 'Genuíno', 'Atento', 'Acolhedor', 'Corajoso',
  'Esperançoso', 'Tranquilo', 'Poético', 'Sincero', 'Profundo', 'Sensível',
  'Radiante', 'Luminoso', 'Resiliente', 'Inspirado', 'Espontâneo', 'Cativante',
  'Gentil', 'Vibrante', 'Constante', 'Presente', 'Verdadeiro', 'Paciente',
  'Humilde', 'Discreto', 'Afetivo', 'Iluminado', 'Singular'
];

export const getRandomAnonymousName = () => {
  const p = ANON_PREFIXES[Math.floor(Math.random() * ANON_PREFIXES.length)];
  const d = ANON_DESCRIPTORS[Math.floor(Math.random() * ANON_DESCRIPTORS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${p} ${d} #${num}`;
};

interface CommunityContextType {
  posts: CommunityPost[];
  isLoading: boolean;
  createPost: (payload: CreatePostPayload) => void;
  toggleReaction: (postId: string, reactionKey: string) => void;
  toggleCommentReaction: (postId: string, commentId: string, reactionKey: string) => void;
  addComment: (postId: string, content: string, isAnonymous?: boolean) => { isFlagged: boolean; matchedWord?: string };
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const sanitizePost = (post: CommunityPost): CommunityPost => {
  const isConfession = post.transversalRoomId === 'confessionario';
  if (!isConfession && post.isAnonymous) {
    const isAnonName = post.authorName.startsWith('Luz em Aprendizado');
    return {
      ...post,
      isAnonymous: false,
      authorName: isAnonName ? 'Mariana Santos' : post.authorName,
      authorAvatar: post.authorAvatar.includes('photo-1518020382113') 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
        : post.authorAvatar,
      comments: post.comments.map(c => ({
        ...c,
        isAnonymous: false,
        authorName: c.authorName.startsWith('Luz em Aprendizado') ? 'Camila Rodrigues' : c.authorName,
        authorAvatar: c.authorAvatar.includes('photo-1518020382113')
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
          : c.authorAvatar
      }))
    };
  }
  return post;
};

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addXP } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch posts from Supabase on mount
  useEffect(() => {
    const fetchSupabasePosts = async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch notice:', error.message);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const remotePosts: CommunityPost[] = data.map((item: any) => ({
            id: item.id,
            journeyId: item.journey_id,
            transversalRoomId: item.transversal_room_id,
            ageBracketId: item.age_bracket_id,
            emotionalIntention: item.emotional_intention,
            authorId: item.author_id || 'demo-user',
            authorName: item.author_name,
            authorAvatar: item.author_avatar,
            authorRole: 'membro',
            isAnonymous: item.is_anonymous,
            sensitivityLevel: item.journey_id === 'depois-do-silencio' || item.transversal_room_id === 'confessionario' ? 'critico' : 'padrao',
            title: item.title,
            content: item.content,
            createdAt: new Date(item.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
            userReactions: {},
            comments: []
          }));

          setPosts(prev => {
            const combined = [...remotePosts];
            // Add local posts that aren't in remote
            prev.forEach(p => {
              if (!combined.some(r => r.id === p.id)) {
                combined.push(p);
              }
            });
            return combined.map(sanitizePost);
          });
        }
      } catch (err) {
        console.warn('Supabase connection fallback to local state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabasePosts();
  }, []);

  // Supabase Realtime: live posts and comments via WebSockets
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const item = payload.new;
          if (!item) return;
          const newPost: CommunityPost = {
            id: item.id,
            journeyId: item.journey_id,
            transversalRoomId: item.transversal_room_id,
            ageBracketId: item.age_bracket_id,
            emotionalIntention: item.emotional_intention,
            authorId: item.author_id || 'unknown',
            authorName: item.author_name,
            authorAvatar: item.author_avatar,
            authorRole: 'membro',
            isAnonymous: item.is_anonymous,
            sensitivityLevel: item.journey_id === 'depois-do-silencio' || item.transversal_room_id === 'confessionario' ? 'critico' : 'padrao',
            title: item.title,
            content: item.content,
            createdAt: new Date(item.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            reactions: {},
            userReactions: {},
            comments: []
          };
          setPosts(prev => {
            // Avoid duplicates (we may have added it optimistically)
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [sanitizePost(newPost), ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_comments' },
        (payload: any) => {
          const item = payload.new;
          if (!item || !item.post_id) return;
          const newComment: CommunityComment = {
            id: item.id || `rt-comment-${Date.now()}`,
            authorId: item.author_id || 'unknown',
            authorName: item.author_name || 'Membro',
            authorAvatar: item.author_avatar || '',
            authorRole: 'membro',
            content: item.content,
            createdAt: new Date(item.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isAnonymous: item.is_anonymous || false,
            status: 'aprovado',
            reactions: {},
            userReactions: {}
          };
          setPosts(prev => prev.map(post => {
            if (post.id === item.post_id) {
              // Avoid duplicate comments
              if (post.comments.some(c => c.id === newComment.id)) return post;
              return { ...post, comments: [...post.comments, newComment] };
            }
            return post;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);



  const createPost = (payload: CreatePostPayload) => {
    if (!user) return;

    let sensitivity: SensitivityLevel = 'padrao';
    if (payload.journeyId === 'singular' || payload.journeyId === 'amor-escolhido' || payload.transversalRoomId === 'espaco-dois') {
      sensitivity = 'elevado';
    } else if (payload.journeyId === 'depois-do-silencio' || payload.transversalRoomId === 'confessionario') {
      sensitivity = 'critico';
    }

    const isConfessionRoom = payload.transversalRoomId === 'confessionario';
    const isAnonymous = isConfessionRoom;

    const authorName = isAnonymous ? getRandomAnonymousName() : user.name;
    const authorAvatar = isAnonymous 
      ? 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80' 
      : user.avatar;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      journeyId: payload.journeyId,
      transversalRoomId: payload.transversalRoomId,
      ageBracketId: payload.ageBracketId,
      emotionalIntention: payload.emotionalIntention,
      moduleTopic: payload.moduleTopic,
      authorId: user.id,
      authorName,
      authorAvatar,
      authorRole: 'membro',
      isAnonymous,
      sensitivityLevel: sensitivity,
      title: payload.title,
      content: payload.content,
      createdAt: 'Agora mesmo',
      reactions: {},
      userReactions: {},
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);

    // Persist asynchronously into Supabase database
    supabase
      .from('community_posts')
      .insert([{
        author_id: user?.id || null,
        title: payload.title,
        content: payload.content,
        author_name: authorName,
        author_avatar: authorAvatar,
        journey_id: payload.journeyId || null,
        transversal_room_id: payload.transversalRoomId || null,
        age_bracket_id: payload.ageBracketId || null,
        emotional_intention: payload.emotionalIntention || null,
        is_anonymous: isAnonymous
      }])
      .then(({ error }) => {
        if (error) {
          console.warn('Supabase post insert notice:', error.message);
        } else {
          console.log('✅ Post salvo com sucesso no Supabase!');
        }
      });

    // Reward XP for community participation (+20 XP)
    addXP(20);
  };

  const toggleReaction = (postId: string, reactionKey: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentUserReactions = post.userReactions || {};
        const isAlreadyReacted = !!currentUserReactions[reactionKey];

        const updatedReactions = { ...post.reactions };
        const updatedUserReactions: Record<string, boolean> = {};

        // Remove any previous reaction the user had on this post
        Object.keys(currentUserReactions).forEach(key => {
          if (currentUserReactions[key]) {
            updatedReactions[key] = Math.max(0, (updatedReactions[key] || 0) - 1);
          }
        });

        // If clicking a new reaction, set it active (if clicking existing reaction, it was removed above)
        if (!isAlreadyReacted) {
          updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
          updatedUserReactions[reactionKey] = true;
        }

        return {
          ...post,
          reactions: updatedReactions,
          userReactions: updatedUserReactions
        };
      }
      return post;
    }));
  };

  const toggleCommentReaction = (postId: string, commentId: string, reactionKey: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.comments) {
        const updatedComments = post.comments.map(c => {
          if (c.id === commentId) {
            const currentUserReactions = c.userReactions || {};
            const isAlreadyReacted = !!currentUserReactions[reactionKey];

            const updatedReactions = { ...(c.reactions || {}) };
            const updatedUserReactions: Record<string, boolean> = {};

            // Remove any previous reaction the user had on this comment
            Object.keys(currentUserReactions).forEach(key => {
              if (currentUserReactions[key]) {
                updatedReactions[key] = Math.max(0, (updatedReactions[key] || 0) - 1);
              }
            });

            // If clicking a new reaction, set it active
            if (!isAlreadyReacted) {
              updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
              updatedUserReactions[reactionKey] = true;
            }

            return {
              ...c,
              reactions: updatedReactions,
              userReactions: updatedUserReactions
            };
          }
          return c;
        });

        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    }));
  };

  const addComment = (postId: string, content: string, isAnonymousInput?: boolean): { isFlagged: boolean; matchedWord?: string } => {
    if (!user) return { isFlagged: false };

    const { isFlagged, matchedWord } = checkAntiShaming(content);
    const commentStatus = isFlagged ? ('sob_moderacao' as const) : ('aprovado' as const);

    const isConfession = posts.find(p => p.id === postId)?.transversalRoomId === 'confessionario';
    const isAnon = isConfession ? !!isAnonymousInput : false;

    const randomAnonNumber = Math.floor(Math.random() * 900) + 100;
    const authorName = isAnon ? `Luz em Aprendizado #${randomAnonNumber}` : user.name;
    const authorAvatar = isAnon 
      ? 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=150&auto=format&fit=crop&q=80' 
      : user.avatar;

    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName,
      authorAvatar,
      authorRole: 'membro' as const,
      content,
      createdAt: 'Agora mesmo',
      isAnonymous: isAnon,
      status: commentStatus,
      reactions: {},
      userReactions: {}
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    if (!isFlagged) {
      // Persist comment asynchronously into Supabase
      supabase
        .from('community_comments')
        .insert([{
          post_id: (postId.includes('-') && postId.length > 20) ? postId : null,
          author_id: user?.id || null,
          author_name: authorName,
          author_avatar: authorAvatar,
          content: content,
          is_anonymous: isAnon
        }])
        .then(({ error }) => {
          if (error) console.warn('Supabase comment notice:', error.message);
          else console.log('✅ Comentário salvo com sucesso no Supabase!');
        });

      addXP(10);
    }

    return { isFlagged, matchedWord };
  };

  return (
    <CommunityContext.Provider value={{
      posts,
      isLoading,
      createPost,
      toggleReaction,
      toggleCommentReaction,
      addComment
    }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommunityPost, CommunityComment, EmotionalIntention, SensitivityLevel, CommunityPoll, NewPollPayload } from '../types';

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
  hasMorePosts: boolean;
  isLoadingMore: boolean;
  loadMorePosts: () => Promise<void>;
  createPost: (payload: CreatePostPayload) => void;
  toggleReaction: (postId: string, reactionKey: string) => void;
  toggleCommentReaction: (postId: string, commentId: string, reactionKey: string) => void;
  addComment: (postId: string, content: string, isAnonymous?: boolean) => { isFlagged: boolean; matchedWord?: string };
  refreshPosts: () => Promise<void>;
  // 🗳️ Enquetes da Comunidade ("Sua Voz Importa")
  polls: CommunityPoll[];
  activePoll: CommunityPoll | null;
  userVotedPollsMap: Record<string, string>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  createPoll: (payload: NewPollPayload) => Promise<void>;
  togglePollStatus: (pollId: string) => Promise<void>;
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

const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'poll-rotina-sono',
    title: 'Qual é o seu maior desafio na rotina noturna com os pequenos?',
    description: 'Sua resposta ajuda nossa curadoria a criar os próximos conteúdos e acolhimentos.',
    category: 'Sono & Rotina',
    options: [
      { id: 'opt-1', text: 'Resistência para ir para a cama e desacelerar', votesCount: 142 },
      { id: 'opt-2', text: 'Despertares noturnos múltiplos ou madrugada longa', votesCount: 98 },
      { id: 'opt-3', text: 'Minha própria exaustão e falta de paciência ao final do dia', votesCount: 184 },
      { id: 'opt-4', text: 'Dificuldade de manter consistência nos horários', votesCount: 65 }
    ],
    totalVotes: 489,
    status: 'open',
    createdAt: 'Hoje'
  }
];

const PAGE_SIZE = 15;

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addXP, awardBadge } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // 🗳️ Enquetes da Comunidade ("Sua Voz Importa")
  const [polls, setPolls] = useState<CommunityPoll[]>(INITIAL_POLLS);
  const [activePoll, setActivePoll] = useState<CommunityPoll | null>(INITIAL_POLLS[0]);
  const [userVotedPollsMap, setUserVotedPollsMap] = useState<Record<string, string>>({});

  const mapPostFromDb = (item: any): CommunityPost => ({
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
  });

  const fetchSupabasePosts = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) {
        console.warn('Supabase fetch notice:', error.message);
        return;
      }

      if (data) {
        const remotePosts: CommunityPost[] = data.map(mapPostFromDb);
        setPosts(remotePosts.map(sanitizePost));
        setHasMorePosts(data.length >= PAGE_SIZE);
      }
    } catch (err) {
      console.warn('Supabase connection fallback to local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts) return;
    setIsLoadingMore(true);
    try {
      const from = posts.length;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.warn('Supabase load more notice:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const newPosts: CommunityPost[] = data.map(mapPostFromDb);
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filtered].map(sanitizePost);
        });
        if (data.length < PAGE_SIZE) {
          setHasMorePosts(false);
        }
      } else {
        setHasMorePosts(false);
      }
    } catch (err) {
      console.warn('Error loading more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Carregar enquetes e votos locais/remotos
  useEffect(() => {
    const userKey = user?.id || 'anon';
    try {
      const stored = localStorage.getItem(`elana_poll_votes_${userKey}`);
      if (stored) {
        setUserVotedPollsMap(JSON.parse(stored));
      }
    } catch {}

    supabase
      .from('community_polls')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const remotePolls: CommunityPoll[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            options: item.options || [],
            totalVotes: item.total_votes || 0,
            status: item.status || 'open',
            createdAt: new Date(item.created_at).toLocaleDateString('pt-BR')
          }));
          setPolls(remotePolls);
          const openPoll = remotePolls.find(p => p.status === 'open');
          if (openPoll) setActivePoll(openPoll);
        }
      });
  }, [user?.id]);

  // Fetch posts from Supabase on mount
  useEffect(() => {
    fetchSupabasePosts(true);
  }, []);

  const refreshPosts = async () => {
    await fetchSupabasePosts(false);
  };

  // Supabase Realtime: live posts, reactions, comments and polls via WebSockets
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const item = payload.new;
          if (!item) return;
          const newPost = mapPostFromDb(item);
          setPosts(prev => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [sanitizePost(newPost), ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload: any) => {
          const updated = payload.new;
          if (!updated) return;
          setPosts(prev => prev.map(p => {
            if (p.id === updated.id) {
              return {
                ...p,
                reactions: updated.reactions || p.reactions,
                title: updated.title,
                content: updated.content
              };
            }
            return p;
          }));
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_polls' },
        (payload: any) => {
          if (payload.new) {
            const remotePoll: CommunityPoll = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description,
              category: payload.new.category,
              options: payload.new.options || [],
              totalVotes: payload.new.total_votes || 0,
              status: payload.new.status || 'open',
              createdAt: new Date(payload.new.created_at).toLocaleDateString('pt-BR')
            };
            setPolls(prev => {
              const existingIdx = prev.findIndex(p => p.id === remotePoll.id);
              if (existingIdx >= 0) {
                const copy = [...prev];
                copy[existingIdx] = remotePoll;
                return copy;
              }
              return [remotePoll, ...prev];
            });
            if (remotePoll.status === 'open') {
              setActivePoll(remotePoll);
            }
          }
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

    // 🏆 Conquistas de Postagem na Comunidade:
    awardBadge('b29'); // Voz de Coragem (1º post)
    if (isAnonymous || payload.transversalRoomId === 'confessionario') {
      awardBadge('b30'); // Confissão Liberta
    }
    if (payload.transversalRoomId === 'cantinho-da-mel' || payload.transversalRoomId === 'trocas-livres') {
      awardBadge('b31'); // Roda de Conversa
    }
    if (payload.transversalRoomId === 'espaco-dois') {
      awardBadge('b32'); // Ponte a Dois
    }
    if (payload.transversalRoomId === 'cuidando-de-quem-cuida') {
      awardBadge('b33'); // Máscara de Oxigênio
    }

    // Reward XP for community participation (+20 XP)
    addXP(20);
  };

  const toggleReaction = (postId: string, reactionKey: string) => {
    // 🏆 Conquista: Acolhimento Pleno (usou reações)
    awardBadge('b35');

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

      // 🏆 Conquistas de Comentários / Rede de Apoio:
      awardBadge('b36'); // Primeiro Acolhimento
      supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .then(({ count }) => {
          const total = (count || 0) + 1;
          if (total >= 500) awardBadge('b41');
          else if (total >= 250) awardBadge('b40');
          else if (total >= 100) awardBadge('b39');
          else if (total >= 25) awardBadge('b38');
          else if (total >= 5) awardBadge('b37');
        });
    }

    return { isFlagged, matchedWord };
  };

  const votePoll = async (pollId: string, optionId: string) => {
    const userKey = user?.id || 'anon';
    if (userVotedPollsMap[pollId]) return;

    const nextVotedMap = { ...userVotedPollsMap, [pollId]: optionId };
    setUserVotedPollsMap(nextVotedMap);
    try {
      localStorage.setItem(`elana_poll_votes_${userKey}`, JSON.stringify(nextVotedMap));
    } catch {}

    let updatedPollObj: CommunityPoll | null = null;
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votesCount: opt.votesCount + 1 };
          }
          return opt;
        });
        const total = poll.totalVotes + 1;
        const updated = {
          ...poll,
          options: updatedOptions,
          totalVotes: total,
          userVotedOptionId: optionId
        };
        updatedPollObj = updated;
        return updated;
      }
      return poll;
    }));

    if (activePoll && activePoll.id === pollId && updatedPollObj) {
      setActivePoll(updatedPollObj);
    }

    if (updatedPollObj && pollId.length > 20) {
      try {
        await supabase
          .from('community_polls')
          .update({
            options: (updatedPollObj as CommunityPoll).options,
            total_votes: (updatedPollObj as CommunityPoll).totalVotes
          })
          .eq('id', pollId);
      } catch (err) {
        console.warn('Supabase poll vote notice:', err);
      }
    }

    // 🏆 Conquistas da categoria "Sua Voz Importa" (sem pontos diretos, apenas desbloqueio de badges):
    awardBadge('b42'); // Primeiro Palpite (1º voto em enquete)
    const votedCount = Object.keys(nextVotedMap).length;
    if (votedCount >= 100) awardBadge('b47');
    else if (votedCount >= 50) awardBadge('b46');
    else if (votedCount >= 25) awardBadge('b45');
    else if (votedCount >= 10) awardBadge('b44');
    else if (votedCount >= 5) awardBadge('b43');
  };

  const createPoll = async (payload: NewPollPayload) => {
    const newPoll: CommunityPoll = {
      id: `poll-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category || 'Geral',
      options: payload.options.map((text, i) => ({
        id: `opt-${i + 1}`,
        text: text.trim(),
        votesCount: 0
      })),
      totalVotes: 0,
      status: 'open',
      createdAt: 'Agora mesmo'
    };

    setPolls(prev => [newPoll, ...prev]);
    setActivePoll(newPoll);

    try {
      const { data } = await supabase
        .from('community_polls')
        .insert([{
          title: newPoll.title,
          description: newPoll.description,
          category: newPoll.category,
          options: newPoll.options,
          total_votes: 0,
          status: 'open'
        }])
        .select();

      if (data && data[0]) {
        newPoll.id = data[0].id;
      }
    } catch (err) {
      console.warn('Supabase create poll notice:', err);
    }
  };

  const togglePollStatus = async (pollId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        const nextStatus = poll.status === 'open' ? 'closed' : 'open';
        return { ...poll, status: nextStatus };
      }
      return poll;
    }));

    if (activePoll && activePoll.id === pollId) {
      setActivePoll(prev => prev ? { ...prev, status: prev.status === 'open' ? 'closed' : 'open' } : null);
    }

    if (pollId.length > 20) {
      try {
        const current = polls.find(p => p.id === pollId);
        const nextStatus = current?.status === 'open' ? 'closed' : 'open';
        await supabase
          .from('community_polls')
          .update({ status: nextStatus })
          .eq('id', pollId);
      } catch {}
    }
  };

  return (
    <CommunityContext.Provider value={{
      posts,
      isLoading,
      hasMorePosts,
      isLoadingMore,
      loadMorePosts,
      createPost,
      toggleReaction,
      toggleCommentReaction,
      addComment,
      refreshPosts,
      polls,
      activePoll,
      userVotedPollsMap,
      votePoll,
      createPoll,
      togglePollStatus
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

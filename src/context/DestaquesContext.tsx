import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StoryItem } from '../types';
import { STORIES_DATA } from '../data/storiesData';
import { supabase } from '../lib/supabase';

interface DestaquesContextType {
  destaques: StoryItem[];
  isLoading: boolean;
  addDestaque: (destaque: Omit<StoryItem, 'id'>) => Promise<boolean>;
  updateDestaque: (id: string, updates: Partial<StoryItem>) => Promise<boolean>;
  deleteDestaque: (id: string) => Promise<boolean>;
  reorderDestaques: (newOrderedList: StoryItem[]) => Promise<boolean>;
  refreshDestaques: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'elana_destaques_cache_v1';

const DestaquesContext = createContext<DestaquesContextType | undefined>(undefined);

export const DestaquesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destaques, setDestaques] = useState<StoryItem[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar cache local de destaques:', e);
    }
    return STORIES_DATA;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar destaques do Supabase
  const fetchDestaquesFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('destaques')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Aviso ao carregar destaques do Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped: StoryItem[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category || 'Geral',
          journeyIds: Array.isArray(d.journey_ids) ? d.journey_ids : (d.journey_ids ? [d.journey_ids] : []),
          authorName: d.author_name || 'Especialista Elana',
          authorHandle: d.author_handle || '@elana.academy',
          authorAvatar: d.author_avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
          videoUrl: d.video_url,
          posterUrl: d.poster_url || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600',
          duration: d.duration || '0:45',
          date: d.date || 'Hoje',
          likes: Number(d.likes) || 0,
          displayOrder: Number(d.display_order) || 0
        }));

        mapped.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        setDestaques(mapped);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
      } else {
        // Se a tabela estiver vazia, tenta fazer o seed inicial dos dados
        try {
          const toInsert = destaques.map((d, index) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            journey_ids: d.journeyIds || [],
            author_name: d.authorName,
            author_handle: d.authorHandle,
            author_avatar: d.authorAvatar,
            video_url: d.videoUrl,
            poster_url: d.posterUrl,
            duration: d.duration,
            date: d.date,
            likes: d.likes,
            display_order: d.displayOrder ?? (index + 1)
          }));

          await supabase.from('destaques').upsert(toInsert, { onConflict: 'id' });
        } catch (seedErr) {
          console.warn('Erro ao inicializar destaques no Supabase:', seedErr);
        }
      }
    } catch (e) {
      console.error('Erro na sincronização de destaques com Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  }, [destaques]);

  useEffect(() => {
    fetchDestaquesFromSupabase();
  }, [fetchDestaquesFromSupabase]);

  // Adicionar novo destaque
  const addDestaque = async (destaqueData: Omit<StoryItem, 'id'>): Promise<boolean> => {
    const newId = `destaque-${Date.now()}`;
    const newStory: StoryItem = {
      ...destaqueData,
      id: newId,
      likes: destaqueData.likes || 0,
      displayOrder: destaqueData.displayOrder || destaques.length + 1
    };

    const updatedList = [newStory, ...destaques];
    setDestaques(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    try {
      const { error } = await supabase.from('destaques').upsert({
        id: newStory.id,
        title: newStory.title,
        category: newStory.category,
        journey_ids: newStory.journeyIds || [],
        author_name: newStory.authorName,
        author_handle: newStory.authorHandle,
        author_avatar: newStory.authorAvatar,
        video_url: newStory.videoUrl,
        poster_url: newStory.posterUrl,
        duration: newStory.duration,
        date: newStory.date || 'Hoje',
        likes: newStory.likes,
        display_order: newStory.displayOrder
      }, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao salvar destaque no Supabase:', error.message);
      }
      return true;
    } catch (e) {
      console.error('Erro de conexão ao salvar destaque no Supabase:', e);
      return true;
    }
  };

  // Atualizar destaque existente
  const updateDestaque = async (id: string, updates: Partial<StoryItem>): Promise<boolean> => {
    const updatedList = destaques.map(d => (d.id === id ? { ...d, ...updates } : d));
    setDestaques(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    try {
      const target = updatedList.find(d => d.id === id);
      if (!target) return false;

      const { error } = await supabase.from('destaques').upsert({
        id: target.id,
        title: target.title,
        category: target.category,
        journey_ids: target.journeyIds || [],
        author_name: target.authorName,
        author_handle: target.authorHandle,
        author_avatar: target.authorAvatar,
        video_url: target.videoUrl,
        poster_url: target.posterUrl,
        duration: target.duration,
        date: target.date,
        likes: target.likes,
        display_order: target.displayOrder
      }, { onConflict: 'id' });

      if (error) {
        console.warn('Erro ao atualizar destaque no Supabase:', error.message);
      }
      return true;
    } catch (e) {
      console.error('Erro ao atualizar destaque no Supabase:', e);
      return true;
    }
  };

  // Excluir destaque
  const deleteDestaque = async (id: string): Promise<boolean> => {
    const updatedList = destaques.filter(d => d.id !== id);
    setDestaques(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    try {
      const { error } = await supabase.from('destaques').delete().eq('id', id);
      if (error) {
        console.warn('Erro ao excluir destaque no Supabase:', error.message);
      }
      return true;
    } catch (e) {
      console.error('Erro ao excluir destaque no Supabase:', e);
      return true;
    }
  };

  // Reordenar destaques
  const reorderDestaques = async (newOrderedList: StoryItem[]): Promise<boolean> => {
    const normalized = newOrderedList.map((item, index) => ({
      ...item,
      displayOrder: index + 1
    }));

    setDestaques(normalized);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    } catch (e) {}

    try {
      const updates = normalized.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        journey_ids: d.journeyIds || [],
        author_name: d.authorName,
        author_handle: d.authorHandle,
        author_avatar: d.authorAvatar,
        video_url: d.videoUrl,
        poster_url: d.posterUrl,
        duration: d.duration,
        date: d.date,
        likes: d.likes,
        display_order: d.displayOrder
      }));

      const { error } = await supabase.from('destaques').upsert(updates, { onConflict: 'id' });
      if (error) {
        console.warn('Erro ao salvar nova ordem de destaques no Supabase:', error.message);
      }
      return true;
    } catch (e) {
      console.error('Erro de conexão ao reordenar destaques no Supabase:', e);
      return true;
    }
  };

  return (
    <DestaquesContext.Provider
      value={{
        destaques,
        isLoading,
        addDestaque,
        updateDestaque,
        deleteDestaque,
        reorderDestaques,
        refreshDestaques: fetchDestaquesFromSupabase
      }}
    >
      {children}
    </DestaquesContext.Provider>
  );
};

export const useDestaques = (): DestaquesContextType => {
  const context = useContext(DestaquesContext);
  if (!context) {
    throw new Error('useDestaques deve ser utilizado dentro de um DestaquesProvider');
  }
  return context;
};

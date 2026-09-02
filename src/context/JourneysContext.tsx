import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Journey, CourseModule, Lesson, LessonResource } from '../types';
import { JOURNEYS_DATA } from '../data/journeysData';
import { supabase } from '../lib/supabase';

interface JourneysContextType {
  journeys: Journey[];
  isLoading: boolean;
  saveJourney: (journey: Journey) => Promise<boolean>;
  deleteJourney: (journeyId: string) => Promise<boolean>;
  addModule: (journeyId: string, title: string, description?: string) => Promise<boolean>;
  updateModule: (journeyId: string, moduleId: string, updates: Partial<CourseModule>) => Promise<boolean>;
  deleteModule: (journeyId: string, moduleId: string) => Promise<boolean>;
  addContent: (
    journeyId: string,
    moduleId: string,
    content: {
      title: string;
      description: string;
      duration: string;
      videoUrl: string;
      thumbnailUrl?: string;
      resources?: LessonResource[];
    }
  ) => Promise<boolean>;
  updateContent: (
    journeyId: string,
    moduleId: string,
    contentId: string,
    updates: Partial<Lesson>
  ) => Promise<boolean>;
  deleteContent: (journeyId: string, moduleId: string, contentId: string) => Promise<boolean>;
  refreshJourneys: () => Promise<void>;
  syncJourneysToSupabase: () => Promise<boolean>;
  importJourneys: (imported: Journey[]) => Promise<boolean>;
}

const LOCAL_STORAGE_KEY = 'elana_journeys_cache_v4';

const JourneysContext = createContext<JourneysContextType | undefined>(undefined);

export const JourneysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journeys, setJourneys] = useState<Journey[]>(() => {
    try {
      // Limpa chaves de cache anteriores para garantir sincronização com os novos vídeos e thumbnails
      localStorage.removeItem('elana_journeys_cache');
      localStorage.removeItem('elana_journeys_cache_v2');
      localStorage.removeItem('elana_journeys_cache_v3');

      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const prn = parsed.find((j: any) => j.id === 'pais-recem-nascidos');
          const firstLesson = prn?.modules?.[0]?.lessons?.[0];
          // Se o cache local estiver com o link mock antigo, descarta e usa o código atualizado
          if (firstLesson && firstLesson.videoUrl && firstLesson.videoUrl.includes('pandavideo')) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read cached journeys:', e);
    }
    return JOURNEYS_DATA;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar jornadas do Supabase
  const fetchJourneysFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Notice loading journeys from Supabase:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mapped: Journey[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle || '',
          tagline: row.tagline || '',
          description: row.description || '',
          pillar: row.pillar || 'movimento',
          pillarAttribute: row.pillar_attribute || '',
          category: row.category || 'comecam',
          targetAudience: row.target_audience || '',
          themeColor: row.theme_color || '#FF7F5B',
          bgLight: row.bg_light || '#fff0eb',
          iconName: row.icon_name || 'Sun',
          price: Number(row.price) || 197,
          modules: Array.isArray(row.modules) ? row.modules : [],
          isComingSoon: Boolean(row.is_coming_soon)
        }));

        setJourneys(mapped);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
        } catch (e) {}
      } else {
        // Se a tabela estiver vazia, sincroniza as jornadas do cache local (com os 15 conteúdos) ou padrão
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let listToSeed = JOURNEYS_DATA;
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              listToSeed = parsed;
              setJourneys(parsed);
            }
          } catch (e) {}
        }
        for (let i = 0; i < listToSeed.length; i++) {
          const j = listToSeed[i];
          await supabase.from('journeys').upsert({
            id: j.id,
            title: j.title,
            subtitle: j.subtitle || '',
            tagline: j.tagline || '',
            description: j.description || '',
            pillar: j.pillar || 'movimento',
            pillar_attribute: j.pillarAttribute || '',
            category: j.category || 'comecam',
            target_audience: j.targetAudience || '',
            theme_color: j.themeColor || '#FF7F5B',
            bg_light: j.bgLight || '#fff0eb',
            icon_name: j.iconName || 'Sun',
            price: Number(j.price) || 197,
            modules: j.modules || [],
            is_coming_soon: Boolean(j.isComingSoon ?? false),
            display_order: i,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' }).then();
        }
      }
    } catch (err) {
      console.warn('Error fetching journeys:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourneysFromSupabase();
  }, [fetchJourneysFromSupabase]);

  // Salvar uma jornada completa (criar ou editar)
  const saveJourney = async (journey: Journey): Promise<boolean> => {
    try {
      const existingIdx = journeys.findIndex(j => j.id === journey.id);
      let updatedList: Journey[];
      if (existingIdx >= 0) {
        updatedList = [...journeys];
        updatedList[existingIdx] = journey;
      } else {
        updatedList = [...journeys, journey];
      }

      setJourneys(updatedList);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {}

      // Persistir no Supabase
      const { error } = await supabase.from('journeys').upsert({
        id: journey.id,
        title: journey.title,
        subtitle: journey.subtitle || '',
        tagline: journey.tagline || '',
        description: journey.description || '',
        pillar: journey.pillar || 'movimento',
        pillar_attribute: journey.pillarAttribute || '',
        category: journey.category || 'comecam',
        target_audience: journey.targetAudience || '',
        theme_color: journey.themeColor || '#FF7F5B',
        bg_light: journey.bgLight || '#fff0eb',
        icon_name: journey.iconName || 'Sun',
        price: journey.price || 197,
        modules: journey.modules || [],
        is_coming_soon: Boolean(journey.isComingSoon ?? false),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error('Error saving journey to Supabase:', error.message);
      }
      return true;
    } catch (err) {
      console.error('Exception saving journey:', err);
      return false;
    }
  };

  // Excluir uma jornada
  const deleteJourney = async (journeyId: string): Promise<boolean> => {
    try {
      const updatedList = journeys.filter(j => j.id !== journeyId);
      setJourneys(updatedList);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {}

      await supabase.from('journeys').delete().eq('id', journeyId);
      return true;
    } catch (err) {
      console.error('Error deleting journey:', err);
      return false;
    }
  };

  // Adicionar um subtema (módulo) a uma jornada
  const addModule = async (journeyId: string, title: string, description?: string): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const newModule: CourseModule = {
      id: `${journeyId}-mod-${Date.now()}`,
      number: (journey.modules?.length || 0) + 1,
      title: title.trim(),
      description: description?.trim() || '',
      lessons: []
    };

    const updatedJourney: Journey = {
      ...journey,
      modules: [...(journey.modules || []), newModule]
    };

    return await saveJourney(updatedJourney);
  };

  // Atualizar um subtema (módulo)
  const updateModule = async (
    journeyId: string,
    moduleId: string,
    updates: Partial<CourseModule>
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || []).map(m => {
      if (m.id === moduleId) {
        return { ...m, ...updates };
      }
      return m;
    });

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  // Excluir um subtema (módulo)
  const deleteModule = async (journeyId: string, moduleId: string): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || [])
      .filter(m => m.id !== moduleId)
      .map((m, idx) => ({ ...m, number: idx + 1 }));

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  // Adicionar um Conteúdo a um subtema
  const addContent = async (
    journeyId: string,
    moduleId: string,
    content: {
      title: string;
      description: string;
      duration: string;
      videoUrl: string;
      thumbnailUrl?: string;
      resources?: LessonResource[];
    }
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const newContent: Lesson = {
      id: `content-${Date.now()}-${crypto.randomUUID().slice(0, 4)}`,
      title: content.title.trim(),
      description: content.description.trim(),
      duration: content.duration.trim() || '15 min',
      videoUrl: content.videoUrl.trim(),
      thumbnailUrl: content.thumbnailUrl?.trim() || undefined,
      xpPoints: 0, // Sem gamificação de XP por assistir
      resources: content.resources || []
    };

    const updatedModules = (journey.modules || []).map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...(m.lessons || []), newContent]
        };
      }
      return m;
    });

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  // Atualizar um Conteúdo existente
  const updateContent = async (
    journeyId: string,
    moduleId: string,
    contentId: string,
    updates: Partial<Lesson>
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || []).map(m => {
      if (m.id === moduleId) {
        const updatedLessons = (m.lessons || []).map(l => {
          if (l.id === contentId) {
            return {
              ...l,
              ...updates,
              xpPoints: 0 // Garantir sem XP por assistir
            };
          }
          return l;
        });
        return { ...m, lessons: updatedLessons };
      }
      return m;
    });

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  // Excluir um Conteúdo
  const deleteContent = async (
    journeyId: string,
    moduleId: string,
    contentId: string
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || []).map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: (m.lessons || []).filter(l => l.id !== contentId)
        };
      }
      return m;
    });

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  // Sincronizar explicitamente todas as jornadas atuais para o Supabase
  const syncJourneysToSupabase = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const listToSync = journeys.length > 0 ? journeys : JOURNEYS_DATA;
      for (let i = 0; i < listToSync.length; i++) {
        const j = listToSync[i];
        const { error } = await supabase.from('journeys').upsert({
          id: j.id,
          title: j.title,
          subtitle: j.subtitle || '',
          tagline: j.tagline || '',
          description: j.description || '',
          pillar: j.pillar || 'movimento',
          pillar_attribute: j.pillarAttribute || '',
          category: j.category || 'comecam',
          target_audience: j.targetAudience || '',
          theme_color: j.themeColor || '#FF7F5B',
          bg_light: j.bgLight || '#fff0eb',
          icon_name: j.iconName || 'Sun',
          price: Number(j.price) || 197,
          modules: j.modules || [],
          display_order: i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing journey to Supabase:', error);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Exception syncing journeys:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Importar jornadas de um arquivo JSON de backup
  const importJourneys = async (imported: Journey[]): Promise<boolean> => {
    if (!Array.isArray(imported) || imported.length === 0) return false;
    try {
      setJourneys(imported);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(imported));
      await syncJourneysToSupabase();
      return true;
    } catch (e) {
      console.error('Error importing journeys:', e);
      return false;
    }
  };

  return (
    <JourneysContext.Provider
      value={{
        journeys,
        isLoading,
        saveJourney,
        deleteJourney,
        addModule,
        updateModule,
        deleteModule,
        addContent,
        updateContent,
        deleteContent,
        refreshJourneys: fetchJourneysFromSupabase,
        syncJourneysToSupabase,
        importJourneys
      }}
    >
      {children}
    </JourneysContext.Provider>
  );
};

export const useJourneys = () => {
  const context = useContext(JourneysContext);
  if (!context) {
    throw new Error('useJourneys must be used within a JourneysProvider');
  }
  return context;
};

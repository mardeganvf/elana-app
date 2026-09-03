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
          isComingSoon: Boolean(row.is_coming_soon),
          coverImageUrl: row.cover_image_url || ''
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
            cover_image_url: j.coverImageUrl || '',
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

  const saveJourney = async (journey: Journey): Promise<boolean> => {
    try {
      setJourneys(prev => {
        const existingIdx = prev.findIndex(j => j.id === journey.id);
        const nextList = [...prev];
        if (existingIdx >= 0) {
          nextList[existingIdx] = journey;
        } else {
          nextList.push(journey);
        }
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
        } catch (e) {}
        return nextList;
      });

      const payload: Record<string, any> = {
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
      };

      if (journey.coverImageUrl) {
        payload.cover_image_url = journey.coverImageUrl;
      }

      let { error } = await supabase.from('journeys').upsert(payload, { onConflict: 'id' });

      if (error && (error.code === '42703' || error.message?.includes('cover_image_url'))) {
        console.warn('Coluna cover_image_url não encontrada na tabela journeys. Salvando sem ela...');
        delete payload.cover_image_url;
        const retry1 = await supabase.from('journeys').upsert(payload, { onConflict: 'id' });
        error = retry1.error;
      }

      if (error && (error.code === '42703' || error.message?.includes('is_coming_soon'))) {
        console.warn('Coluna is_coming_soon não encontrada na tabela journeys. Salvando sem ela...');
        delete payload.is_coming_soon;
        const retry2 = await supabase.from('journeys').upsert(payload, { onConflict: 'id' });
        error = retry2.error;
      }

      if (error) {
        const retryUpdate = await supabase.from('journeys').update(payload).eq('id', journey.id);
        if (!retryUpdate.error) {
          error = null;
        }
      }

      if (error) {
        console.error('Erro ao persistir jornada no Supabase:', error.message);
      }
      return true;
    } catch (err) {
      console.error('Exceção ao salvar jornada:', err);
      return false;
    }
  };

  const deleteJourney = async (journeyId: string): Promise<boolean> => {
    try {
      setJourneys(prev => {
        const nextList = prev.filter(j => j.id !== journeyId);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
        } catch (e) {}
        return nextList;
      });

      await supabase.from('journeys').delete().eq('id', journeyId);
      return true;
    } catch (err) {
      console.error('Error deleting journey:', err);
      return false;
    }
  };

  const addModule = async (journeyId: string, title: string, description: string = ''): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const newModule: CourseModule = {
      id: `mod-${journeyId}-${Date.now()}`,
      number: (journey.modules?.length || 0) + 1,
      title: title.trim() || `Módulo ${(journey.modules?.length || 0) + 1}`,
      description: description.trim(),
      lessons: []
    };

    const updatedJourney: Journey = {
      ...journey,
      modules: [...(journey.modules || []), newModule]
    };

    return await saveJourney(updatedJourney);
  };

  const updateModule = async (
    journeyId: string,
    moduleId: string,
    updates: { title?: string; description?: string }
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || []).map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
          ...(updates.description !== undefined ? { description: updates.description.trim() } : {})
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
      xpPoints: 0,
      resources: content.resources || []
    };

    let added = false;
    const updatedModules = (journey.modules || []).map(m => {
      const isTargetMod = (moduleId && m.id === moduleId) || (!moduleId && journey.modules.length === 1);
      if (isTargetMod) {
        added = true;
        return {
          ...m,
          lessons: [...(m.lessons || []), newContent]
        };
      }
      return m;
    });

    let finalModules = updatedModules;
    if (!added) {
      if (finalModules.length > 0) {
        finalModules[0].lessons = [...(finalModules[0].lessons || []), newContent];
      } else {
        finalModules = [{
          id: `mod-${journeyId}-1`,
          number: 1,
          title: 'Conteúdos da Jornada',
          description: '',
          lessons: [newContent]
        }];
      }
    }

    const updatedJourney: Journey = {
      ...journey,
      modules: finalModules
    };

    return await saveJourney(updatedJourney);
  };

  const updateContent = async (
    journeyId: string,
    moduleId: string,
    contentId: string,
    updates: Partial<Lesson>
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) {
      console.error(`Jornada ${journeyId} não encontrada.`);
      return false;
    }

    let lessonFound = false;
    const updatedModules = (journey.modules || []).map(m => {
      const isTargetModule = (moduleId && m.id === moduleId) || (m.lessons || []).some(l => l.id === contentId);
      if (isTargetModule) {
        const updatedLessons = (m.lessons || []).map(l => {
          if (l.id === contentId) {
            lessonFound = true;
            return {
              ...l,
              ...updates,
              xpPoints: 0
            };
          }
          return l;
        });
        return { ...m, lessons: updatedLessons };
      }
      return m;
    });

    if (!lessonFound) {
      console.warn(`Aula ${contentId} não encontrada nos módulos da jornada ${journeyId}.`);
    }

    const updatedJourney: Journey = {
      ...journey,
      modules: updatedModules
    };

    return await saveJourney(updatedJourney);
  };

  const deleteContent = async (
    journeyId: string,
    moduleId: string,
    contentId: string
  ): Promise<boolean> => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) return false;

    const updatedModules = (journey.modules || []).map(m => {
      const isTargetModule = (moduleId && m.id === moduleId) || (m.lessons || []).some(l => l.id === contentId);
      if (isTargetModule) {
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

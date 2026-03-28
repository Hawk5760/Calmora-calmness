import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'mood' | 'journal' | 'meditation' | 'puzzle' | 'social';
  xpReward: number;
  completed: boolean;
}

interface DailyQuestsState {
  date: string;
  quests: DailyQuest[];
  allCompleteBonus: boolean;
}

const QUEST_TEMPLATES: Omit<DailyQuest, 'id' | 'completed'>[] = [
  { title: 'Check Your Mood', description: 'Log how you\'re feeling today', icon: '💖', type: 'mood', xpReward: 15 },
  { title: 'Express Yourself', description: 'Write a journal entry about your day', icon: '📖', type: 'journal', xpReward: 25 },
  { title: 'Breathe Deep', description: 'Complete a mindfulness session', icon: '🧘', type: 'meditation', xpReward: 20 },
  { title: 'Sharpen Your Mind', description: 'Play a memory puzzle game', icon: '🧩', type: 'puzzle', xpReward: 30 },
  { title: 'Gratitude Moment', description: 'Write 3 things you\'re grateful for', icon: '🙏', type: 'journal', xpReward: 20 },
  { title: 'Calm Down', description: 'Do a 5-minute breathing exercise', icon: '🌬️', type: 'meditation', xpReward: 15 },
  { title: 'Mood Reflection', description: 'Share what\'s on your mind', icon: '✨', type: 'mood', xpReward: 20 },
  { title: 'Brain Workout', description: 'Complete a puzzle in under 2 minutes', icon: '⚡', type: 'puzzle', xpReward: 35 },
  { title: 'Morning Check-in', description: 'Start your day with a mood log', icon: '🌅', type: 'mood', xpReward: 15 },
  { title: 'Peaceful Mind', description: 'Meditate for at least 3 minutes', icon: '🕊️', type: 'meditation', xpReward: 20 },
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateDailyQuests = (dateStr: string): DailyQuest[] => {
  const seed = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...QUEST_TEMPLATES].sort((a, b) => seededRandom(seed + a.title.length) - seededRandom(seed + b.title.length));
  const selected: typeof shuffled = [];
  const usedTypes = new Set<string>();
  for (const quest of shuffled) {
    if (selected.length >= 3) break;
    if (!usedTypes.has(quest.type) || selected.length >= 2) {
      selected.push(quest);
      usedTypes.add(quest.type);
    }
  }
  return selected.map((q, i) => ({ ...q, id: `quest_${dateStr}_${i}`, completed: false }));
};

export const useDailyQuests = () => {
  const { user } = useAuth();
  const [state, setState] = useState<DailyQuestsState>({ date: '', quests: [], allCompleteBonus: false });
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for DB compatibility

  const storageKey = user ? `daily_quests_${user.id}` : 'daily_quests_guest';
  const todayDisplay = new Date().toDateString();

  useEffect(() => {
    if (!user) {
      // Guest: use localStorage
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: DailyQuestsState = JSON.parse(saved);
        if (parsed.date === todayDisplay) { setState(parsed); return; }
      }
      const newState: DailyQuestsState = { date: todayDisplay, quests: generateDailyQuests(todayDisplay), allCompleteBonus: false };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      setState(newState);
      return;
    }

    // Authenticated: use Supabase
    const load = async () => {
      const { data, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('quest_date', today)
        .maybeSingle();

      if (!error && data) {
        const quests = (data.quests as any as DailyQuest[]) || [];
        setState({ date: todayDisplay, quests, allCompleteBonus: data.all_complete_bonus });
      } else {
        // Check localStorage for migration
        const saved = localStorage.getItem(storageKey);
        let migrateQuests: DailyQuest[] | null = null;
        if (saved) {
          const parsed: DailyQuestsState = JSON.parse(saved);
          if (parsed.date === todayDisplay) migrateQuests = parsed.quests;
          localStorage.removeItem(storageKey);
        }
        const quests = migrateQuests || generateDailyQuests(todayDisplay);
        const newState: DailyQuestsState = { date: todayDisplay, quests, allCompleteBonus: false };
        setState(newState);
        await supabase.from('daily_quests').upsert({
          user_id: user.id,
          quest_date: today,
          quests: quests as any,
          all_complete_bonus: false,
        });
      }
    };
    load();
  }, [user, storageKey, today, todayDisplay]);

  const saveState = useCallback((updated: DailyQuestsState) => {
    setState(updated);
    if (!user) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } else {
      supabase.from('daily_quests').upsert({
        user_id: user.id,
        quest_date: today,
        quests: updated.quests as any,
        all_complete_bonus: updated.allCompleteBonus,
      });
    }
  }, [user, storageKey, today]);

  const completeQuest = useCallback((questType: DailyQuest['type']): DailyQuest | null => {
    let completedQuest: DailyQuest | null = null;
    setState(prev => {
      const quest = prev.quests.find(q => q.type === questType && !q.completed);
      if (!quest) return prev;
      completedQuest = { ...quest, completed: true };
      const updated: DailyQuestsState = {
        ...prev,
        quests: prev.quests.map(q => q.id === quest.id ? { ...q, completed: true } : q),
      };
      if (!prev.allCompleteBonus && updated.quests.every(q => q.completed)) {
        updated.allCompleteBonus = true;
      }
      saveState(updated);
      return updated;
    });
    return completedQuest;
  }, [saveState]);

  const completedCount = state.quests.filter(q => q.completed).length;
  const allComplete = state.quests.length > 0 && state.quests.every(q => q.completed);

  return {
    quests: state.quests,
    completeQuest,
    completedCount,
    totalQuests: state.quests.length,
    allComplete,
    allCompleteBonusClaimed: state.allCompleteBonus,
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerProgress {
  xp: number;
  level: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activitiesCompleted: {
    moods: number;
    journals: number;
    meditations: number;
    puzzles: number;
    quests: number;
  };
  streakShields: number;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Seedling', 2: 'Sprout', 3: 'Sprout', 4: 'Bloom', 5: 'Bloom',
  6: 'Bloom', 7: 'Tree', 8: 'Tree', 9: 'Tree', 10: 'Tree',
  11: 'Grove', 12: 'Grove', 13: 'Grove', 14: 'Grove', 15: 'Grove',
  16: 'Forest', 17: 'Forest', 18: 'Forest', 19: 'Forest', 20: 'Forest',
};

export const getLevelTitle = (level: number): string => {
  if (level >= 21) return 'Sage';
  return LEVEL_TITLES[level] || 'Seedling';
};

export const getLevelEmoji = (level: number): string => {
  if (level >= 21) return '🧙';
  if (level >= 16) return '🌲';
  if (level >= 11) return '🌳';
  if (level >= 7) return '🌴';
  if (level >= 4) return '🌸';
  if (level >= 2) return '🌱';
  return '🫒';
};

export const getXpForLevel = (level: number): number => 80 + level * 40;

export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2.5;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
};

const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 0, level: 1, totalXpEarned: 0, currentStreak: 0, longestStreak: 0,
  lastActiveDate: null, streakShields: 0,
  activitiesCompleted: { moods: 0, journals: 0, meditations: 0, puzzles: 0, quests: 0 },
};

export type XPSource = 'mood' | 'journal' | 'meditation' | 'puzzle' | 'quest' | 'daily_bonus';

const XP_AMOUNTS: Record<XPSource, number> = {
  mood: 15, journal: 25, meditation: 20, puzzle: 30, quest: 20, daily_bonus: 25,
};

// Convert DB row to PlayerProgress
const fromDbRow = (row: any): PlayerProgress => ({
  xp: row.xp ?? 0,
  level: row.level ?? 1,
  totalXpEarned: row.total_xp_earned ?? 0,
  currentStreak: row.current_streak ?? 0,
  longestStreak: row.longest_streak ?? 0,
  lastActiveDate: row.last_active_date ?? null,
  streakShields: row.streak_shields ?? 0,
  activitiesCompleted: {
    moods: row.moods_completed ?? 0,
    journals: row.journals_completed ?? 0,
    meditations: row.meditations_completed ?? 0,
    puzzles: row.puzzles_completed ?? 0,
    quests: row.quests_completed ?? 0,
  },
});

export const usePlayerProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  const storageKey = user ? `player_progress_${user.id}` : 'player_progress_guest';

  // Load from Supabase (authenticated) or localStorage (guest)
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProgress(JSON.parse(saved));
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from('player_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProgress(fromDbRow(data));
      } else {
        // Check localStorage for migration
        const localKey = `player_progress_${user.id}`;
        const saved = localStorage.getItem(localKey);
        if (saved) {
          const local: PlayerProgress = JSON.parse(saved);
          setProgress(local);
          // Migrate to Supabase
          await supabase.from('player_progress').upsert({
            user_id: user.id,
            xp: local.xp, level: local.level, total_xp_earned: local.totalXpEarned,
            current_streak: local.currentStreak, longest_streak: local.longestStreak,
            last_active_date: local.lastActiveDate,
            moods_completed: local.activitiesCompleted.moods,
            journals_completed: local.activitiesCompleted.journals,
            meditations_completed: local.activitiesCompleted.meditations,
            puzzles_completed: local.activitiesCompleted.puzzles,
            quests_completed: local.activitiesCompleted.quests,
            streak_shields: local.streakShields ?? 0,
          });
          localStorage.removeItem(localKey);
        }
      }
    };
    load();
  }, [user, storageKey]);

  // Debounced save to Supabase or localStorage
  const save = useCallback((p: PlayerProgress) => {
    setProgress(p);

    if (!user) {
      localStorage.setItem(storageKey, JSON.stringify(p));
      return;
    }

    // Debounce Supabase writes
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase.from('player_progress').upsert({
        user_id: user.id,
        xp: p.xp, level: p.level, total_xp_earned: p.totalXpEarned,
        current_streak: p.currentStreak, longest_streak: p.longestStreak,
        last_active_date: p.lastActiveDate,
        moods_completed: p.activitiesCompleted.moods,
        journals_completed: p.activitiesCompleted.journals,
        meditations_completed: p.activitiesCompleted.meditations,
        puzzles_completed: p.activitiesCompleted.puzzles,
        quests_completed: p.activitiesCompleted.quests,
        streak_shields: p.streakShields ?? 0,
      });
    }, 500);
  }, [user, storageKey]);

  const updateStreak = useCallback((current: PlayerProgress): PlayerProgress => {
    const today = new Date().toDateString();
    if (current.lastActiveDate === today) return current;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const wasYesterday = current.lastActiveDate === yesterday;
    const newStreak = wasYesterday ? current.currentStreak + 1 : 1;
    return {
      ...current,
      currentStreak: newStreak,
      longestStreak: Math.max(current.longestStreak, newStreak),
      lastActiveDate: today,
    };
  }, []);

  const addXP = useCallback((source: XPSource, bonusXP?: number) => {
    setProgress(prev => {
      let updated = updateStreak(prev);
      const multiplier = getStreakMultiplier(updated.currentStreak);
      const baseXP = bonusXP ?? XP_AMOUNTS[source];
      const earnedXP = Math.round(baseXP * multiplier);
      let newXP = updated.xp + earnedXP;
      let newLevel = updated.level;
      const oldLevel = updated.level;

      while (newXP >= getXpForLevel(newLevel)) {
        newXP -= getXpForLevel(newLevel);
        newLevel++;
      }

      if (newLevel > oldLevel) {
        setLevelUpData({ oldLevel, newLevel });
      }

      const activityKey = source === 'meditation' ? 'meditations'
        : source === 'mood' ? 'moods'
        : source === 'journal' ? 'journals'
        : source === 'puzzle' ? 'puzzles'
        : 'quests';

      const newProgress: PlayerProgress = {
        ...updated,
        xp: newXP,
        level: newLevel,
        totalXpEarned: updated.totalXpEarned + earnedXP,
        activitiesCompleted: {
          ...updated.activitiesCompleted,
          [activityKey]: updated.activitiesCompleted[activityKey] + 1,
        },
      };

      save(newProgress);
      return newProgress;
    });
  }, [updateStreak, save]);

  const clearLevelUp = useCallback(() => setLevelUpData(null), []);

  const xpToNextLevel = getXpForLevel(progress.level);
  const xpProgress = (progress.xp / xpToNextLevel) * 100;

  return {
    progress,
    addXP,
    levelUpData,
    clearLevelUp,
    xpToNextLevel,
    xpProgress,
    levelTitle: getLevelTitle(progress.level),
    levelEmoji: getLevelEmoji(progress.level),
    streakMultiplier: getStreakMultiplier(progress.currentStreak),
  };
};

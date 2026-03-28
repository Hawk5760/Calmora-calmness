import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * User-scoped localStorage hook.
 * All keys are prefixed with user ID to prevent data leakage between accounts.
 */
export const useUserStorage = () => {
  const { user } = useAuth();

  // Prefix: user-scoped or guest
  const prefix = useMemo(() => (user ? `user_${user.id}_` : 'guest_'), [user]);

  const getItem = useCallback(<T = unknown>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(`${prefix}${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }, [prefix]);

  const setItem = useCallback(<T = unknown>(key: string, value: T): void => {
    try {
      localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
    } catch {
      // localStorage full or unavailable
    }
  }, [prefix]);

  const removeItem = useCallback((key: string): void => {
    localStorage.removeItem(`${prefix}${key}`);
  }, [prefix]);

  return { getItem, setItem, removeItem, prefix, userId: user?.id ?? null };
};

// Storage keys used across the app
export const STORAGE_KEYS = {
  MOOD_ENTRIES: 'moodEntries',
  JOURNAL_ENTRIES: 'journalEntries',
  GARDEN_STATS: 'gardenStats',
  MINDFUL_MINUTES: 'mindfulMinutes',
  BREATHING_SESSIONS: 'breathingSessions',
  PUZZLE_STATS: 'puzzleStats',
  LOOT_INVENTORY: 'lootInventory',
  LOOT_LAST_OPENED: 'lootLastOpened',
} as const;

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'puzzle' | 'wellness' | 'streak' | 'milestone';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
}

export interface UserStats {
  totalGamesPlayed: number;
  totalMoves: number;
  bestMoves: number;
  avgMoves: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  totalTimePlayed: number;
  perfectGames: number;
  fastGames: number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Puzzle achievements
  { id: 'first_game', name: 'First Steps', description: 'Complete your first puzzle game', icon: '🎮', category: 'puzzle', requirement: 1, unlocked: false, progress: 0 },
  { id: 'puzzle_master', name: 'Puzzle Master', description: 'Complete 10 puzzle games', icon: '🧩', category: 'puzzle', requirement: 10, unlocked: false, progress: 0 },
  { id: 'perfect_memory', name: 'Perfect Memory', description: 'Complete a game in 8 moves (minimum possible)', icon: '🧠', category: 'puzzle', requirement: 8, unlocked: false, progress: 0 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a game under 60 seconds', icon: '⚡', category: 'puzzle', requirement: 60, unlocked: false, progress: 0 },
  { id: 'efficient_mind', name: 'Efficient Mind', description: 'Complete a game in 12 moves or less', icon: '✨', category: 'puzzle', requirement: 12, unlocked: false, progress: 0 },
  
  // Streak achievements
  { id: 'streak_3', name: 'Getting Started', description: 'Play 3 days in a row', icon: '🔥', category: 'streak', requirement: 3, unlocked: false, progress: 0 },
  { id: 'streak_7', name: 'Weekly Warrior', description: 'Play 7 days in a row', icon: '💪', category: 'streak', requirement: 7, unlocked: false, progress: 0 },
  { id: 'streak_30', name: 'Mind Champion', description: 'Play 30 days in a row', icon: '👑', category: 'streak', requirement: 30, unlocked: false, progress: 0 },
  
  // Milestone achievements
  { id: 'games_25', name: 'Dedicated Player', description: 'Complete 25 games', icon: '🌟', category: 'milestone', requirement: 25, unlocked: false, progress: 0 },
  { id: 'games_50', name: 'Mind Enthusiast', description: 'Complete 50 games', icon: '💎', category: 'milestone', requirement: 50, unlocked: false, progress: 0 },
  { id: 'games_100', name: 'Wellness Champion', description: 'Complete 100 games', icon: '🏆', category: 'milestone', requirement: 100, unlocked: false, progress: 0 },
  
  // Wellness achievements
  { id: 'calm_player', name: 'Calm Player', description: 'Complete 5 games with steady performance', icon: '🧘', category: 'wellness', requirement: 5, unlocked: false, progress: 0 },
  { id: 'improving', name: 'Improving Mind', description: 'Beat your personal best 3 times', icon: '📈', category: 'wellness', requirement: 3, unlocked: false, progress: 0 },
];

const DEFAULT_STATS: UserStats = {
  totalGamesPlayed: 0,
  totalMoves: 0,
  bestMoves: 999,
  avgMoves: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  totalTimePlayed: 0,
  perfectGames: 0,
  fastGames: 0,
};

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load from localStorage
  useEffect(() => {
    const storageKey = user ? `achievements_${user.id}` : 'achievements_guest';
    const statsKey = user ? `puzzle_stats_${user.id}` : 'puzzle_stats_guest';
    
    const savedAchievements = localStorage.getItem(storageKey);
    const savedStats = localStorage.getItem(statsKey);
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user]);

  // Save to localStorage
  const saveData = useCallback((newAchievements: Achievement[], newStats: UserStats) => {
    const storageKey = user ? `achievements_${user.id}` : 'achievements_guest';
    const statsKey = user ? `puzzle_stats_${user.id}` : 'puzzle_stats_guest';
    
    localStorage.setItem(storageKey, JSON.stringify(newAchievements));
    localStorage.setItem(statsKey, JSON.stringify(newStats));
  }, [user]);

  const checkAndUnlockAchievements = useCallback((updatedStats: UserStats, gameTime: number, moves: number) => {
    const unlocked: Achievement[] = [];
    
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      let newProgress = achievement.progress;
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_game':
          newProgress = updatedStats.totalGamesPlayed;
          shouldUnlock = updatedStats.totalGamesPlayed >= 1;
          break;
        case 'puzzle_master':
          newProgress = updatedStats.totalGamesPlayed;
          shouldUnlock = updatedStats.totalGamesPlayed >= 10;
          break;
        case 'perfect_memory':
          newProgress = moves;
          shouldUnlock = moves === 8;
          break;
        case 'speed_demon':
          newProgress = gameTime;
          shouldUnlock = gameTime <= 60;
          break;
        case 'efficient_mind':
          newProgress = moves;
          shouldUnlock = moves <= 12;
          break;
        case 'streak_3':
          newProgress = updatedStats.currentStreak;
          shouldUnlock = updatedStats.currentStreak >= 3;
          break;
        case 'streak_7':
          newProgress = updatedStats.currentStreak;
          shouldUnlock = updatedStats.currentStreak >= 7;
          break;
        case 'streak_30':
          newProgress = updatedStats.currentStreak;
          shouldUnlock = updatedStats.currentStreak >= 30;
          break;
        case 'games_25':
          newProgress = updatedStats.totalGamesPlayed;
          shouldUnlock = updatedStats.totalGamesPlayed >= 25;
          break;
        case 'games_50':
          newProgress = updatedStats.totalGamesPlayed;
          shouldUnlock = updatedStats.totalGamesPlayed >= 50;
          break;
        case 'games_100':
          newProgress = updatedStats.totalGamesPlayed;
          shouldUnlock = updatedStats.totalGamesPlayed >= 100;
          break;
        case 'calm_player':
          // Steady performance = games with moves between 10-15
          if (moves >= 10 && moves <= 15) {
            newProgress = achievement.progress + 1;
          }
          shouldUnlock = newProgress >= 5;
          break;
        case 'improving':
          // Beat personal best
          if (moves < updatedStats.bestMoves || updatedStats.bestMoves === 999) {
            newProgress = achievement.progress + 1;
          }
          shouldUnlock = newProgress >= 3;
          break;
      }
      
      if (shouldUnlock && !achievement.unlocked) {
        unlocked.push({ ...achievement, unlocked: true, unlockedAt: new Date(), progress: newProgress });
        return { ...achievement, unlocked: true, unlockedAt: new Date(), progress: newProgress };
      }
      
      return { ...achievement, progress: newProgress };
    });
    
    if (unlocked.length > 0) {
      setNewlyUnlocked(unlocked);
      unlocked.forEach(a => {
        toast.success(`🏆 Achievement Unlocked!`, {
          description: `${a.icon} ${a.name}: ${a.description}`,
          duration: 5000,
        });
      });
    }
    
    setAchievements(updatedAchievements);
    return updatedAchievements;
  }, [achievements]);

  const recordGameCompletion = useCallback((moves: number, timeSeconds: number) => {
    const today = new Date().toDateString();
    const isNewDay = stats.lastPlayedDate !== today;
    const wasYesterday = stats.lastPlayedDate === new Date(Date.now() - 86400000).toDateString();
    
    const newStreak = isNewDay 
      ? (wasYesterday ? stats.currentStreak + 1 : 1)
      : stats.currentStreak;
    
    const updatedStats: UserStats = {
      totalGamesPlayed: stats.totalGamesPlayed + 1,
      totalMoves: stats.totalMoves + moves,
      bestMoves: Math.min(stats.bestMoves, moves),
      avgMoves: Math.round((stats.totalMoves + moves) / (stats.totalGamesPlayed + 1)),
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastPlayedDate: today,
      totalTimePlayed: stats.totalTimePlayed + timeSeconds,
      perfectGames: moves === 8 ? stats.perfectGames + 1 : stats.perfectGames,
      fastGames: timeSeconds <= 60 ? stats.fastGames + 1 : stats.fastGames,
    };
    
    setStats(updatedStats);
    const updatedAchievements = checkAndUnlockAchievements(updatedStats, timeSeconds, moves);
    saveData(updatedAchievements, updatedStats);
    
    return updatedStats;
  }, [stats, checkAndUnlockAchievements, saveData]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const getUnlockedCount = useCallback(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  return {
    achievements,
    stats,
    newlyUnlocked,
    recordGameCompletion,
    clearNewlyUnlocked,
    getUnlockedCount,
  };
};

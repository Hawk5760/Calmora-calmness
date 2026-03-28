import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Lock, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface StreakMilestone {
  days: number;
  title: string;
  emoji: string;
  reward: string;
  description: string;
}

const MILESTONES: StreakMilestone[] = [
  { days: 3, title: 'First Spark', emoji: '✨', reward: '+25 XP Bonus', description: '3 days of consistency — you\'re building a habit!' },
  { days: 7, title: 'Week Warrior', emoji: '⚔️', reward: 'Streak Shield + 50 XP', description: 'A full week! You earned a streak shield.' },
  { days: 14, title: 'Fortnight Hero', emoji: '🛡️', reward: '2× XP for 24h + 75 XP', description: '14 days strong. Double XP unlocked!' },
  { days: 30, title: 'Monthly Master', emoji: '👑', reward: 'Exclusive Badge + 150 XP', description: '30 days! You\'re a wellness champion.' },
  { days: 60, title: 'Iron Will', emoji: '💎', reward: 'Premium Trial (3 days) + 200 XP', description: '60 days of dedication. Incredible!' },
  { days: 100, title: 'Zen Legend', emoji: '🧘', reward: 'Legendary Badge + 500 XP', description: '100 days. You\'ve transformed your life.' },
];

const getUnlockedMilestones = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('calmora_unlocked_milestones') || '[]');
  } catch { return []; }
};

const saveMilestoneUnlock = (day: number) => {
  const unlocked = getUnlockedMilestones();
  if (!unlocked.includes(String(day))) {
    unlocked.push(String(day));
    localStorage.setItem('calmora_unlocked_milestones', JSON.stringify(unlocked));
  }
};

export const useStreakMilestones = (currentStreak: number) => {
  const [newMilestone, setNewMilestone] = useState<StreakMilestone | null>(null);

  useEffect(() => {
    const unlocked = getUnlockedMilestones();
    const milestone = MILESTONES.find(m => currentStreak >= m.days && !unlocked.includes(String(m.days)));
    if (milestone) {
      setNewMilestone(milestone);
      saveMilestoneUnlock(milestone.days);
    }
  }, [currentStreak]);

  const clearMilestone = () => setNewMilestone(null);

  return { newMilestone, clearMilestone, milestones: MILESTONES, unlockedMilestones: getUnlockedMilestones() };
};

// ─── Milestone Unlock Modal ───
export const MilestoneUnlockModal = ({ milestone, onClose }: { milestone: StreakMilestone; onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-card border border-primary/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {milestone.emoji}
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-1">Milestone Unlocked!</h2>
        <h3 className="text-lg font-semibold text-primary mb-2">{milestone.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{milestone.description}</p>
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{milestone.reward}</span>
          </div>
        </div>
        <Button onClick={onClose} className="rounded-full px-8">
          <Sparkles className="w-4 h-4 mr-2" /> Claim Reward
        </Button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Milestones Progress Panel ───
export const MilestonesPanel = ({ currentStreak }: { currentStreak: number }) => {
  const unlocked = getUnlockedMilestones();

  return (
    <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
          <Flame className="w-4 h-4 text-status-warning" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Streak Milestones</h3>
          <p className="text-[10px] text-muted-foreground">{currentStreak} day streak</p>
        </div>
      </div>
      <div className="space-y-2">
        {MILESTONES.map((m) => {
          const isUnlocked = unlocked.includes(String(m.days)) || currentStreak >= m.days;
          const progress = Math.min(100, (currentStreak / m.days) * 100);
          return (
            <div key={m.days} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isUnlocked ? 'bg-primary/5' : 'bg-muted/20'}`}>
              <span className="text-xl w-8 text-center">{isUnlocked ? m.emoji : '🔒'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{m.title}</span>
                  <span className="text-[10px] text-muted-foreground">{m.days}d</span>
                </div>
                <div className="w-full h-1 rounded-full bg-muted/30 mt-1">
                  <div className={`h-full rounded-full transition-all ${isUnlocked ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              {isUnlocked && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

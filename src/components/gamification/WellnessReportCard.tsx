import { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Download, Share2, Heart, BookOpen, Wind, Brain, Flame, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStorage, STORAGE_KEYS } from '@/hooks/useUserStorage';

interface ReportData {
  moodEntries: number;
  journalEntries: number;
  meditations: number;
  puzzles: number;
  topMood: string;
  currentStreak: number;
  longestStreak: number;
  level: number;
  totalXP: number;
  activeDays: number;
}

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', amazing: '🤩', good: '😃', calm: '😌', okay: '😐',
  sad: '😢', anxious: '😰', angry: '😡', motivated: '💪',
};

export const WellnessReportCard = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { getItem } = useUserStorage();
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const data = useMemo((): ReportData => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const moods = getItem<any[]>(STORAGE_KEYS.MOOD_ENTRIES, [])
      .filter((e: any) => new Date(e.timestamp) >= monthStart);
    const journals = getItem<any[]>(STORAGE_KEYS.JOURNAL_ENTRIES, [])
      .filter((e: any) => new Date(e.timestamp) >= monthStart);
    const sessions = getItem<any[]>(STORAGE_KEYS.BREATHING_SESSIONS, [])
      .filter((s: any) => new Date(s.timestamp) >= monthStart);
    const puzzleStats = getItem<any>(STORAGE_KEYS.PUZZLE_STATS, {});

    // Top mood
    const moodCounts: Record<string, number> = {};
    moods.forEach((e: any) => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';

    // Active days
    const activeDaysSet = new Set<string>();
    moods.forEach((e: any) => activeDaysSet.add(new Date(e.timestamp).toDateString()));
    journals.forEach((e: any) => activeDaysSet.add(new Date(e.timestamp).toDateString()));
    sessions.forEach((s: any) => activeDaysSet.add(new Date(s.timestamp).toDateString()));

    const progress = JSON.parse(localStorage.getItem('player_progress_local') || '{}');

    return {
      moodEntries: moods.length,
      journalEntries: journals.length,
      meditations: sessions.length,
      puzzles: puzzleStats?.total || 0,
      topMood,
      currentStreak: progress.currentStreak || 0,
      longestStreak: progress.longestStreak || 0,
      level: progress.level || 1,
      totalXP: progress.totalXpEarned || 0,
      activeDays: activeDaysSet.size,
    };
  }, [getItem]);

  const handleShare = async () => {
    const text = `🌿 My Calmora Wellness Report - ${monthName}\n\n` +
      `💚 ${data.moodEntries} mood check-ins\n` +
      `📖 ${data.journalEntries} journal entries\n` +
      `🧘 ${data.meditations} mindful sessions\n` +
      `🔥 ${data.currentStreak} day streak\n` +
      `⭐ Level ${data.level} · ${data.totalXP} XP\n\n` +
      `Track your mental wellness with Calmora! 🌸`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Calmora Wellness Report', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Report copied to clipboard! 📋', { description: 'Share it on your socials.' });
    }
  };

  const stats = [
    { icon: Heart, label: 'Mood Check-ins', value: data.moodEntries, color: 'text-rose-500' },
    { icon: BookOpen, label: 'Journal Entries', value: data.journalEntries, color: 'text-amber-500' },
    { icon: Wind, label: 'Mindful Sessions', value: data.meditations, color: 'text-sky-500' },
    { icon: Brain, label: 'Puzzles Solved', value: data.puzzles, color: 'text-violet-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-border/50">
        {/* Report Card */}
        <div ref={reportRef} className="bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-[10px] rounded-full mb-2 border-primary/30 text-primary">
              <Calendar className="w-2.5 h-2.5 mr-1" /> {monthName}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              🌿 Wellness Report
            </h2>
            <p className="text-xs text-muted-foreground">Your mental wellness journey this month</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">{MOOD_EMOJI[data.topMood] || '😌'}</span>
                <div>
                  <div className="text-xs font-medium text-foreground">Top Mood</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{data.topMood}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/30">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-status-warning" />
                <div>
                  <div className="text-xs font-medium text-foreground">Current Streak</div>
                  <div className="text-[10px] text-muted-foreground">{data.currentStreak} days (best: {data.longestStreak})</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs font-medium text-foreground">Active Days</div>
                  <div className="text-[10px] text-muted-foreground">{data.activeDays} out of {new Date().getDate()} days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Badge */}
          <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm font-bold text-primary">Level {data.level} · {data.totalXP} XP</div>
            <div className="text-[10px] text-muted-foreground">Keep growing your wellness garden 🌱</div>
          </div>

          {/* Watermark */}
          <p className="text-center text-[9px] text-muted-foreground/50 mt-4">
            Generated by Calmora · calmora.app
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border/50 flex gap-3">
          <Button onClick={handleShare} variant="default" className="flex-1 rounded-xl gap-2">
            <Share2 className="w-4 h-4" /> Share Report
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
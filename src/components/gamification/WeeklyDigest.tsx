import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Minus, Brain, Heart, BookOpen, 
  Wind, Flame, Award, ChevronDown, ChevronUp, Sparkles, Zap,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerProgress, getStreakMultiplier } from "@/hooks/usePlayerProgress";

interface WeeklyStats {
  moods: string[];
  moodTrend: 'improving' | 'stable' | 'declining';
  dominantMood: string;
  journalCount: number;
  meditationMinutes: number;
  puzzlesSolved: number;
  streakDays: number;
  totalXpEarned: number;
  avgMoodScore: number;
  suggestions: string[];
}

const moodValues: Record<string, number> = {
  amazing: 5, happy: 5, good: 4, excited: 4, motivated: 4,
  calm: 3, okay: 3, peaceful: 3,
  sad: 2, anxious: 1, angry: 1, stressed: 1, overwhelmed: 1
};

const moodEmojis: Record<string, string> = {
  amazing: '🤩', happy: '😊', good: '😌', excited: '🎉', motivated: '💪',
  calm: '🧘', okay: '😐', peaceful: '☮️',
  sad: '😢', anxious: '😰', angry: '😤', stressed: '😫', overwhelmed: '🥺'
};

const generateSuggestions = (stats: WeeklyStats): string[] => {
  const suggestions: string[] = [];
  
  if (stats.moodTrend === 'declining') {
    suggestions.push("Your mood has been dipping — try a 5-minute breathing exercise each morning this week 🌬️");
  }
  if (stats.journalCount < 2) {
    suggestions.push("Writing helps process emotions — aim for 3 journal entries this week 📖");
  }
  if (stats.meditationMinutes < 15) {
    suggestions.push("Mindfulness boosts resilience — try adding 5 extra minutes of meditation 🧘");
  }
  if (stats.puzzlesSolved < 3) {
    suggestions.push("Brain games reduce stress — challenge yourself with 3 puzzles this week 🧩");
  }
  if (stats.streakDays >= 7) {
    suggestions.push("Amazing streak! Keep going — you're building a powerful habit 🔥");
  }
  if (stats.dominantMood === 'anxious' || stats.dominantMood === 'stressed') {
    suggestions.push("High stress detected — consider using the Sleep Zone or talking to Mindo 💙");
  }
  if (stats.avgMoodScore >= 4) {
    suggestions.push("You're thriving! Share your positivity in the community forum 🌟");
  }
  
  return suggestions.slice(0, 3);
};

const analyzeWeek = (): WeeklyStats => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]")
    .filter((e: any) => new Date(e.timestamp) >= weekAgo);
  const journalEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]")
    .filter((e: any) => new Date(e.timestamp) >= weekAgo);
  const sessions = JSON.parse(localStorage.getItem("breathingSessions") || "[]")
    .filter((s: any) => new Date(s.timestamp) >= weekAgo);
  
  const moods = moodEntries.map((e: any) => e.mood?.toLowerCase() || 'okay');
  const moodScores = moods.map((m: string) => moodValues[m] || 3);
  const avgMoodScore = moodScores.length > 0 ? moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length : 3;
  
  // Trend
  let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (moodScores.length >= 4) {
    const half = Math.floor(moodScores.length / 2);
    const firstHalf = moodScores.slice(0, half).reduce((a: number, b: number) => a + b, 0) / half;
    const secondHalf = moodScores.slice(half).reduce((a: number, b: number) => a + b, 0) / (moodScores.length - half);
    if (secondHalf > firstHalf + 0.3) moodTrend = 'improving';
    else if (secondHalf < firstHalf - 0.3) moodTrend = 'declining';
  }
  
  // Dominant mood
  const moodCounts: Record<string, number> = {};
  moods.forEach((m: string) => { moodCounts[m] = (moodCounts[m] || 0) + 1; });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';
  
  const meditationMinutes = sessions.reduce((t: number, s: any) => t + (s.duration || 5), 0);
  
  const stats: WeeklyStats = {
    moods,
    moodTrend,
    dominantMood,
    journalCount: journalEntries.length,
    meditationMinutes,
    puzzlesSolved: 0,
    streakDays: 0,
    totalXpEarned: 0,
    avgMoodScore,
    suggestions: [],
  };
  
  stats.suggestions = generateSuggestions(stats);
  return stats;
};

export const WeeklyDigest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const { progress } = usePlayerProgress();

  useEffect(() => {
    const data = analyzeWeek();
    data.streakDays = progress.currentStreak;
    data.totalXpEarned = progress.totalXpEarned;
    data.puzzlesSolved = progress.activitiesCompleted.puzzles;
    setStats(data);
  }, [progress]);

  if (!stats) return null;

  const TrendIcon = stats.moodTrend === 'improving' ? TrendingUp : stats.moodTrend === 'declining' ? TrendingDown : Minus;
  const trendColor = stats.moodTrend === 'improving' ? 'text-status-success' : stats.moodTrend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm text-foreground">Weekly Wellness Digest</h3>
            <p className="text-[10px] text-muted-foreground">AI-powered insights from your week</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] rounded-full gap-1 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {stats.moodTrend}
          </Badge>
          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="px-4 pb-5 sm:px-5 space-y-4">
              {/* Mood Overview */}
              <div className="p-3 rounded-xl bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Mood Overview</span>
                  <span className="text-lg">{moodEmojis[stats.dominantMood] || '😌'}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Dominant mood: <span className="capitalize font-medium text-foreground">{stats.dominantMood}</span> · 
                  Avg score: {stats.avgMoodScore.toFixed(1)}/5
                </p>
                <Progress value={(stats.avgMoodScore / 5) * 100} className="h-1.5" />
              </div>

              {/* Activity Summary */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Heart, label: "Mood Logs", value: stats.moods.length, color: "text-feature-mood" },
                  { icon: BookOpen, label: "Journals", value: stats.journalCount, color: "text-feature-journal" },
                  { icon: Wind, label: "Mindful Min", value: stats.meditationMinutes, color: "text-feature-mindfulness" },
                  { icon: Zap, label: "XP Earned", value: stats.totalXpEarned, color: "text-primary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/10">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <div>
                      <div className="text-sm font-bold text-foreground">{item.value}</div>
                      <div className="text-[9px] text-muted-foreground">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak & Multiplier */}
              {stats.streakDays >= 2 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-status-warning/5 border border-status-warning/15">
                  <Flame className="w-4 h-4 text-status-warning" />
                  <span className="text-xs text-foreground font-medium">{stats.streakDays}-day streak!</span>
                  <Badge variant="outline" className="text-[10px] rounded-full border-status-warning/30 text-status-warning ml-auto">
                    {getStreakMultiplier(stats.streakDays)}x XP
                  </Badge>
                </div>
              )}

              {/* AI Suggestions */}
              {stats.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">AI Suggestions</span>
                  </div>
                  {stats.suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-xs text-foreground/80"
                    >
                      {s}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

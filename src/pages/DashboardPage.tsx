import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoodTrackingChart } from "@/components/MoodTrackingChart";
import { SubscriptionStatus } from "@/components/premium/SubscriptionStatus";
import { CounselorBooking } from "@/components/counseling/CounselorBooking";
import { PageLayout } from "@/components/layout/PageLayout";
import { XPBar } from "@/components/gamification/XPBar";
import { DailyQuestsPanel } from "@/components/gamification/DailyQuestsPanel";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { WeeklyDigest } from "@/components/gamification/WeeklyDigest";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { StreakShieldDisplay, useStreakShields } from "@/components/gamification/StreakShield";
import { LootBoxModal, useLootBox } from "@/components/gamification/LootBox";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { MilestonesPanel, useStreakMilestones, MilestoneUnlockModal } from "@/components/gamification/StreakMilestones";
import { WellnessReportCard } from "@/components/gamification/WellnessReportCard";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";
import {
  BarChart3, Heart, BookOpen, Wind, TrendingUp, TrendingDown,
  Target, Flame, Brain, Sparkles, Activity, ArrowRight,
  Moon, Award, MessageCircle, Leaf
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MoodEntry { mood: string; note: string; timestamp: Date; }

const StatCard = ({ icon: Icon, label, value, className }: { icon: any; label: string; value: number; className?: string }) => (
  <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 text-center" role="status" aria-label={`${label}: ${value}`}>
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
      <Icon className={`w-4 h-4 ${className || 'text-primary'}`} aria-hidden="true" />
    </div>
    <div className="text-xl font-bold text-foreground">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
    {value === 0 && <p className="text-[9px] text-primary/60 mt-1">Start now →</p>}
  </Card>
);

const QuickAction = ({ icon: Icon, label, path, navigate }: { icon: any; label: string; path: string; navigate: (path: string) => void }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate(path)}
    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors min-h-[80px]"
  >
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="text-[10px] font-medium text-foreground text-center leading-tight">{label}</span>
  </motion.button>
);

const DashboardSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-6">
    <Skeleton className="h-40 rounded-2xl" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
    <Skeleton className="h-64 rounded-2xl" />
  </div>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [gardenStats, setGardenStats] = useState<any>({});
  const [puzzleStats, setPuzzleStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const { progress, addXP, levelUpData, clearLevelUp, xpToNextLevel, xpProgress, levelTitle, levelEmoji } = usePlayerProgress();
  const { quests, completedCount, totalQuests, allComplete, allCompleteBonusClaimed } = useDailyQuests();
  const { getShields } = useStreakShields();
  const { addToInventory, canOpenBox, markOpened } = useLootBox();
  const [showLootBox, setShowLootBox] = useState(false);
  const shields = getShields();
  const { newMilestone, clearMilestone } = useStreakMilestones(progress.currentStreak);
  const { getItem } = useUserStorage();

  // Show loot box when all quests complete
  useEffect(() => {
    if (allComplete && !allCompleteBonusClaimed && canOpenBox()) {
      const timer = setTimeout(() => setShowLootBox(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, allCompleteBonusClaimed, canOpenBox]);

  useEffect(() => {
    const moods = getItem<any[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
    const garden = getItem<any>(STORAGE_KEYS.GARDEN_STATS, {});
    const puzzle = getItem<any>(STORAGE_KEYS.PUZZLE_STATS, {});

    setMoodEntries(moods.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
    setGardenStats(garden);
    setPuzzleStats(puzzle);
    setLoading(false);
  }, [getItem]);

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      amazing: "bg-mood-motivated", good: "bg-mood-happy", happy: "bg-mood-happy",
      okay: "bg-mood-calm", calm: "bg-mood-calm", sad: "bg-mood-sad",
      anxious: "bg-mood-anxious", angry: "bg-mood-angry", motivated: "bg-mood-motivated"
    };
    return colors[mood] || "bg-muted";
  };

  const getMoodTrend = () => {
    const recent = moodEntries.slice(-7);
    if (recent.length < 2) return "stable";
    const moodValues: Record<string, number> = { amazing: 5, happy: 5, good: 4, okay: 3, calm: 3, motivated: 4, sad: 2, anxious: 1, angry: 1 };
    const half = Math.floor(recent.length / 2);
    const firstAvg = recent.slice(0, half).reduce((s, e) => s + (moodValues[e.mood] || 3), 0) / half;
    const secondAvg = recent.slice(half).reduce((s, e) => s + (moodValues[e.mood] || 3), 0) / (recent.length - half);
    return secondAvg > firstAvg + 0.5 ? "improving" : secondAvg < firstAvg - 0.5 ? "declining" : "stable";
  };

  const totalActions = gardenStats.totalActions || 0;
  const currentStreak = progress.currentStreak;
  const moodTrend = getMoodTrend();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyMoods = moodEntries.filter(e => e.timestamp >= weekAgo).length;
  const weeklyJournals = getItem<any[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []).filter((e: any) => new Date(e.timestamp) >= weekAgo).length;
  const weeklySessions = getItem<any[]>(STORAGE_KEYS.BREATHING_SESSIONS, []).filter((s: any) => new Date(s.timestamp) >= weekAgo).length;

  const quickActions = [
    { label: "Mood Check-In", icon: Heart, path: "/mood" },
    { label: "Talk to Mindo", icon: Brain, path: "/chat" },
    { label: "Journal", icon: BookOpen, path: "/journal" },
    { label: "Mindfulness", icon: Wind, path: "/mindfulness" },
    { label: "Sleep Zone", icon: Moon, path: "/sleep" },
    { label: "Soul Garden", icon: Leaf, path: "/garden" },
  ];

  if (loading) {
    return <PageLayout showBackButton={false}><DashboardSkeleton /></PageLayout>;
  }

  return (
    <PageLayout showBackButton={false}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Modals */}
        {levelUpData && (
          <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />
        )}
        {newMilestone && (
          <MilestoneUnlockModal milestone={newMilestone} onClose={clearMilestone} />
        )}
        <LootBoxModal
          open={showLootBox}
          onClose={() => { setShowLootBox(false); markOpened(); }}
          onClaim={(reward) => {
            addToInventory(reward);
            if (reward.type === 'xp_boost') {
              const xpAmount = reward.id === 'xp_50' ? 50 : reward.id === 'xp_25' ? 25 : 10;
              addXP('quest', xpAmount);
            }
          }}
        />

        {/* XP Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <XPBar
            level={progress.level}
            xp={progress.xp}
            xpToNext={xpToNextLevel}
            xpProgress={xpProgress}
            streak={progress.currentStreak}
            totalXp={progress.totalXpEarned}
          />
        </motion.div>

        {/* Hero Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 w-20 h-20 text-primary/5" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
                {levelEmoji} {levelTitle}'s Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mb-6">Level {progress.level} · {progress.totalXpEarned} total XP earned</p>

              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                {currentStreak > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-status-warning/10 border border-status-warning/20">
                    <Flame className="w-5 h-5 text-status-warning" />
                    <div>
                      <div className="text-lg font-bold text-foreground">{currentStreak}</div>
                      <div className="text-[10px] text-muted-foreground">Day Streak</div>
                    </div>
                  </div>
                )}

                <StreakShieldDisplay shields={shields} streak={currentStreak} />

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{totalActions}</div>
                    <div className="text-[10px] text-muted-foreground">Total Actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-feature-chat/10 border border-feature-chat/20">
                  <Award className="w-5 h-5 text-feature-chat" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{completedCount}/{totalQuests}</div>
                    <div className="text-[10px] text-muted-foreground">Quests Done</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <SubscriptionStatus />

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Heart} label="Mood Entries" value={progress.activitiesCompleted.moods} className="text-feature-mood" />
          <StatCard icon={BookOpen} label="Journal Entries" value={progress.activitiesCompleted.journals} className="text-feature-journal" />
          <StatCard icon={Wind} label="Meditations" value={progress.activitiesCompleted.meditations} className="text-feature-mindfulness" />
          <StatCard icon={Brain} label="Puzzles" value={progress.activitiesCompleted.puzzles} className="text-feature-chat" />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Quests */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <DailyQuestsPanel
                quests={quests}
                completedCount={completedCount}
                totalQuests={totalQuests}
                allComplete={allComplete}
              />
            </motion.div>

            {/* Mood Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Mood Trend</h3>
                  </div>
                  <Badge variant={moodTrend === "improving" ? "default" : "secondary"} className="text-[10px] rounded-full">
                    {moodTrend === "improving" && <TrendingUp className="w-3 h-3 mr-1" />}
                    {moodTrend === "declining" && <TrendingDown className="w-3 h-3 mr-1" />}
                    {moodTrend.charAt(0).toUpperCase() + moodTrend.slice(1)}
                  </Badge>
                </div>
                <MoodTrackingChart moodEntries={moodEntries} />
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {quickActions.map((action, i) => (
                    <QuickAction key={i} icon={action.icon} label={action.label} path={action.path} navigate={navigate} />
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Moods */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-feature-mood/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-feature-mood" />
                  </div>
                  <h3 className="font-semibold text-sm">Recent Moods</h3>
                </div>
                <div className="space-y-2.5">
                  {moodEntries.slice(-5).reverse().map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                      <div className={`w-2.5 h-2.5 rounded-full ${getMoodColor(entry.mood)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize text-foreground">{entry.mood}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.timestamp.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {moodEntries.length === 0 && (
                    <div className="text-center py-6">
                      <Heart className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-2">No mood entries yet</p>
                      <Button variant="link" size="sm" onClick={() => navigate("/mood")} className="text-xs gap-1 min-h-[44px]">
                        Start checking in <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Weekly Goals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Weekly Goals</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Mood Check-ins", current: weeklyMoods, goal: 7 },
                    { label: "Journal Entries", current: weeklyJournals, goal: 3 },
                    { label: "Mindful Sessions", current: weeklySessions, goal: 5 },
                  ].map((g, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{g.label}</span>
                        <span className="font-medium text-foreground">{Math.min(g.current, g.goal)}/{g.goal}</span>
                      </div>
                      <Progress value={Math.min(100, (g.current / g.goal) * 100)} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Garden Level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-feature-garden/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-feature-garden" />
                    </div>
                    <h3 className="font-semibold text-sm">Soul Garden</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded-full border-primary/30 text-primary">
                    Level {progress.level}
                  </Badge>
                </div>
                <Progress value={xpProgress} className="h-1.5 mb-2" />
                <p className="text-[10px] text-muted-foreground">{xpToNextLevel - progress.xp} XP to next level</p>
                <Button variant="link" size="sm" onClick={() => navigate("/garden")} className="text-xs gap-1 p-0 mt-1 min-h-[44px]">
                  Visit Garden <ArrowRight className="w-3 h-3" />
                </Button>
              </Card>
            </motion.div>

            {/* Streak Milestones */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <MilestonesPanel currentStreak={currentStreak} />
            </motion.div>
          </div>
        </div>

        {/* Monthly Wellness Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <WellnessReportCard />
        </motion.div>

        {/* Weekly Digest */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <WeeklyDigest />
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Leaderboard />
        </motion.div>

        {/* Counseling Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Counseling</h3>
            </div>
            <CounselorBooking />
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

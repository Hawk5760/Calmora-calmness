import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Sparkles, Calendar, TrendingUp, Clock, BookOpen, Heart, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayerProgress, getLevelTitle, getLevelEmoji } from "@/hooks/usePlayerProgress";
import { XPBar } from "@/components/gamification/XPBar";
import { GardenEvolution } from "@/components/gamification/GardenEvolution";
import { useLootBox } from "@/components/gamification/LootBox";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";

interface GardenStats {
  totalActions: number;
  moodEntries: number;
  journalEntries: number;
  mindfulMinutes: number;
  level: number;
  goodMoodCount: number;
}

interface HistoryEntry {
  date: string;
  type: 'mood' | 'journal' | 'mindfulness';
  title: string;
  description: string;
  icon: any;
}

export const SoulGarden = () => {
  const [stats, setStats] = useState<GardenStats>({
    totalActions: 0, moodEntries: 0, journalEntries: 0,
    mindfulMinutes: 0, level: 1, goodMoodCount: 0,
  });
  const [growthHistory, setGrowthHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { progress, xpToNextLevel, xpProgress } = usePlayerProgress();
  const { getInventory } = useLootBox();
  const { getItem } = useUserStorage();
  const lootPlants = getInventory().filter(r => r.type === 'garden_plant').map(r => r.id);

  const goodMoods = ['happy', 'excited', 'calm', 'grateful', 'joyful', 'peaceful', 'content', 'optimistic', 'energetic', 'loved'];

  useEffect(() => {
    const moodEntries = getItem<any[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
    const journalEntries = getItem<any[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
    const mindfulMinutes = parseInt(getItem<string>(STORAGE_KEYS.MINDFUL_MINUTES, '0') as string) || 0;
    const goodMoodCount = moodEntries.filter((entry: any) => goodMoods.includes(entry.mood?.toLowerCase())).length;
    const totalActions = moodEntries.length + journalEntries.length + Math.floor(mindfulMinutes / 5);
    const level = Math.floor(totalActions / 5) + 1;

    setStats({ totalActions, moodEntries: moodEntries.length, journalEntries: journalEntries.length, mindfulMinutes, level, goodMoodCount });

    const history: HistoryEntry[] = [];
    moodEntries.forEach((entry: any) => {
      history.push({ date: entry.timestamp || new Date().toISOString(), type: 'mood', title: `Mood Check-in: ${entry.mood}`, description: entry.note || entry.aiResponse || 'Checked in with your emotional state', icon: Heart });
    });
    journalEntries.forEach((entry: any) => {
      history.push({ date: entry.timestamp || new Date().toISOString(), type: 'journal', title: entry.title || 'Journal Entry', description: entry.content ? entry.content.substring(0, 100) + '...' : 'Reflected on your thoughts and experiences', icon: BookOpen });
    });
    if (mindfulMinutes > 0) {
      const sessions = Math.floor(mindfulMinutes / 5);
      for (let i = 0; i < sessions; i++) {
        const sessionDate = new Date(); sessionDate.setDate(sessionDate.getDate() - i);
        history.push({ date: sessionDate.toISOString(), type: 'mindfulness', title: 'Mindfulness Session', description: 'Completed a 5-minute breathing exercise', icon: Clock });
      }
    }
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setGrowthHistory(history);
  }, [getItem]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mood': return 'bg-primary/10 text-primary';
      case 'journal': return 'bg-secondary/10 text-secondary';
      case 'mindfulness': return 'bg-accent/10 text-accent';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const { goodMoodCount, totalActions, level } = stats;
  const isFullGarden = goodMoodCount >= 7;
  const hasRarePlant = goodMoodCount >= 21;

  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg overflow-hidden">
      {/* XP Bar */}
      <div className="mb-4">
        <XPBar
          level={progress.level}
          xp={progress.xp}
          xpToNext={xpToNextLevel}
          xpProgress={xpProgress}
          streak={progress.currentStreak}
          totalXp={progress.totalXpEarned}
          compact
        />
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">
          {getLevelEmoji(progress.level)} Your Soul Garden
        </h2>
        <p className="text-sm text-muted-foreground">{getLevelTitle(progress.level)} · Level {progress.level} • {totalActions} mindful actions</p>
      </div>

      {/* Garden Scene */}
      <div className="relative h-64 sm:h-72 md:h-80 mb-6 sm:mb-8 rounded-2xl overflow-hidden border border-border/30 shadow-xl">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#E0F7FA] dark:from-[#1a1a3e] dark:via-[#2d1b69] dark:to-[#1a2a1a]" />

        {/* Sun with realistic glow */}
        <motion.div
          className="absolute top-6 right-10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FFD700] to-[#FFA500] shadow-[0_0_60px_20px_rgba(255,215,0,0.3),0_0_100px_40px_rgba(255,165,0,0.15)]" />
        </motion.div>

        {/* Clouds */}
        <motion.div className="absolute top-8 left-6" animate={{ x: [0, 15, 0] }} transition={{ duration: 20, repeat: Infinity }}>
          <div className="relative">
            <div className="w-16 h-6 bg-white/70 rounded-full" />
            <div className="absolute -top-2 left-3 w-8 h-8 bg-white/70 rounded-full" />
            <div className="absolute -top-1 left-8 w-6 h-6 bg-white/70 rounded-full" />
          </div>
        </motion.div>
        {isFullGarden && (
          <motion.div className="absolute top-12 left-[40%]" animate={{ x: [0, -10, 0] }} transition={{ duration: 25, repeat: Infinity }}>
            <div className="relative">
              <div className="w-20 h-7 bg-white/50 rounded-full" />
              <div className="absolute -top-3 left-4 w-10 h-10 bg-white/50 rounded-full" />
              <div className="absolute -top-1 left-10 w-8 h-8 bg-white/50 rounded-full" />
            </div>
          </motion.div>
        )}

        {/* Distant mountains/hills */}
        <div className="absolute bottom-24 left-0 right-0">
          <svg viewBox="0 0 400 60" className="w-full h-16 opacity-30">
            <path d="M0,60 Q50,10 100,40 Q150,5 200,35 Q250,15 300,45 Q350,10 400,50 L400,60 Z" 
              fill="url(#hillGrad)" />
            <defs>
              <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#228B22" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Ground layers */}
        <div className="absolute bottom-0 left-0 right-0 h-24">
          {/* Soil base */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#5D4037] via-[#6D4C41] to-[#795548]" />
          {/* Rich grass */}
          <div className="absolute bottom-6 left-0 right-0 h-20 bg-gradient-to-t from-[#2E7D32] via-[#388E3C] to-[#43A047] rounded-t-[50%_100%]" />
          {/* Grass highlights */}
          <div className="absolute bottom-10 left-0 right-0 h-4 bg-gradient-to-r from-[#4CAF50]/40 via-[#66BB6A]/60 to-[#4CAF50]/40" />
        </div>

        {/* Grass blades - reduced count for performance */}
        <div className="absolute bottom-14 left-0 right-0 flex justify-around px-4" style={{ willChange: 'transform' }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-gradient-to-t from-[#2E7D32] to-[#81C784] rounded-t-full origin-bottom"
              style={{ height: `${12 + Math.random() * 16}px`, transform: `rotate(${Math.random() * 16 - 8}deg)` }}
              animate={{ rotate: [Math.random() * 4 - 2, Math.random() * 4 - 2] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
        </div>

        {/* Stone path */}
        {isFullGarden && (
          <div className="absolute bottom-4 left-[25%] right-[25%] flex justify-around items-center">
            {[12, 16, 14, 18, 13].map((w, i) => (
              <div key={i} className="rounded-full bg-gradient-to-b from-[#9E9E9E] to-[#757575] shadow-inner opacity-70"
                style={{ width: w, height: w * 0.55 }} />
            ))}
          </div>
        )}

        {/* Trees */}
        {(level >= 3 || goodMoodCount >= 3) && (
          <motion.div className="absolute bottom-14 left-[8%]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            {/* Trunk */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-r from-[#5D4037] via-[#6D4C41] to-[#5D4037] rounded-sm" />
            {/* Canopy layers */}
            <div className="relative -top-6">
              <div className="w-20 h-16 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-[50%] shadow-lg" />
              <div className="absolute -left-2 top-4 w-14 h-12 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-[50%]" />
              <div className="absolute -right-2 top-3 w-14 h-12 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-[50%]" />
              <div className="absolute left-3 -top-4 w-14 h-12 bg-gradient-to-b from-[#43A047] to-[#388E3C] rounded-[50%]" />
            </div>
          </motion.div>
        )}

        {isFullGarden && (
          <>
            <motion.div className="absolute bottom-14 right-[6%]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.4 }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-24 bg-gradient-to-r from-[#4E342E] via-[#5D4037] to-[#4E342E] rounded-sm" />
              <div className="relative -top-8">
                <div className="w-24 h-20 bg-gradient-to-b from-[#1B5E20] to-[#0D3B0D] rounded-[50%] shadow-lg" />
                <div className="absolute -left-3 top-5 w-16 h-14 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-[50%]" />
                <div className="absolute -right-3 top-4 w-16 h-14 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20] rounded-[50%]" />
                <div className="absolute left-4 -top-5 w-16 h-14 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-[50%]" />
              </div>
            </motion.div>
            <motion.div className="absolute bottom-14 left-[42%]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.6 }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-r from-[#5D4037] via-[#6D4C41] to-[#5D4037] rounded-sm" />
              <div className="relative -top-4">
                <div className="w-16 h-14 bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-[50%] shadow-lg" />
                <div className="absolute -left-1 top-3 w-10 h-10 bg-gradient-to-b from-[#43A047] to-[#388E3C] rounded-[50%]" />
                <div className="absolute -right-1 top-2 w-10 h-10 bg-gradient-to-b from-[#43A047] to-[#388E3C] rounded-[50%]" />
              </div>
            </motion.div>
          </>
        )}

        {/* Flowers */}
        {(level >= 2 || goodMoodCount >= 2) && (
          <Flower left="22%" color1="#E91E63" color2="#F06292" delay={0.3} />
        )}
        {(level >= 4 || goodMoodCount >= 4) && (
          <Flower left="72%" color1="#9C27B0" color2="#CE93D8" delay={0.5} />
        )}
        {(level >= 5 || goodMoodCount >= 5) && (
          <Flower left="58%" color1="#FF9800" color2="#FFB74D" delay={0.7} size="sm" />
        )}
        {goodMoodCount >= 6 && (
          <Flower left="35%" color1="#F44336" color2="#EF9A9A" delay={0.9} size="lg" />
        )}
        {isFullGarden && (
          <>
            <Flower left="28%" color1="#FF5722" color2="#FFAB91" delay={1.1} />
            <Flower left="82%" color1="#2196F3" color2="#90CAF9" delay={1.3} size="sm" />
            <Flower left="50%" color1="#E91E63" color2="#F8BBD0" delay={1.5} />
          </>
        )}

        {/* Butterflies */}
        {(level >= 5 || goodMoodCount >= 5) && (
          <motion.div
            className="absolute top-[35%] left-[38%]"
            animate={{ x: [0, 30, -20, 10, 0], y: [0, -15, 5, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <div className="flex items-center gap-[1px]">
              <motion.div className="w-3 h-4 rounded-full bg-gradient-to-r from-[#AB47BC] to-[#E040FB]" animate={{ rotateY: [0, 60, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
              <div className="w-1 h-2 bg-[#4A148C] rounded-full" />
              <motion.div className="w-3 h-4 rounded-full bg-gradient-to-l from-[#AB47BC] to-[#E040FB]" animate={{ rotateY: [0, -60, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
            </div>
          </motion.div>
        )}
        {isFullGarden && (
          <motion.div
            className="absolute top-[45%] right-[22%]"
            animate={{ x: [0, -25, 15, -10, 0], y: [0, 10, -20, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          >
            <div className="flex items-center gap-[1px]">
              <motion.div className="w-2.5 h-3.5 rounded-full bg-gradient-to-r from-[#FF8A65] to-[#FFAB91]" animate={{ rotateY: [0, 60, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
              <div className="w-1 h-1.5 bg-[#BF360C] rounded-full" />
              <motion.div className="w-2.5 h-3.5 rounded-full bg-gradient-to-l from-[#FF8A65] to-[#FFAB91]" animate={{ rotateY: [0, -60, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
            </div>
          </motion.div>
        )}

        {/* Rare Golden Lotus */}
        {hasRarePlant && (
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            {/* Aura glow */}
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.4)_0%,rgba(255,165,0,0.15)_50%,transparent_70%)] blur-xl animate-pulse" />
            <div className="relative flex flex-col items-center">
              {/* Lotus petals */}
              <div className="relative w-16 h-16">
                {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((r, i) => (
                  <div key={`o-${i}`} className="absolute left-1/2 top-1/2 w-4 h-9 rounded-full"
                    style={{
                      background: 'linear-gradient(to top, #F9A825, #FDD835, #FFF9C4)',
                      transform: `translate(-50%, -50%) rotate(${r}deg) translateY(-14px)`,
                      transformOrigin: 'center center',
                      filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
                    }} />
                ))}
                {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((r, i) => (
                  <div key={`i-${i}`} className="absolute left-1/2 top-1/2 w-3 h-7 rounded-full"
                    style={{
                      background: 'linear-gradient(to top, #FF8F00, #FFB300, #FFE082)',
                      transform: `translate(-50%, -50%) rotate(${r}deg) translateY(-10px)`,
                      transformOrigin: 'center center',
                    }} />
                ))}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-[#FFE082] via-[#FFD54F] to-[#FFB300] shadow-lg z-10"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.8))' }} />
              </div>
              <Sparkles className="absolute -top-5 -right-6 w-4 h-4 text-[#FFD700] animate-pulse" />
              <Star className="absolute -top-3 -left-7 w-3 h-3 text-[#FFA000] animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="mt-3 px-3 py-1 rounded-full shadow-lg"
                style={{ background: 'linear-gradient(to right, #F9A825, #FFB300, #F9A825)', filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))' }}>
                <span className="text-[10px] font-bold text-white">✨ RARE GOLDEN LOTUS ✨</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {totalActions === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30">
            <div className="text-center bg-card/90 p-5 rounded-xl shadow-lg border border-border/30">
              <Leaf className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-foreground text-sm font-medium">Your garden is waiting to bloom...</p>
              <p className="text-muted-foreground text-xs mt-1">Log good moods to grow your garden!</p>
            </div>
          </div>
        )}

        {/* Ambient particles - reduced count */}
        {isFullGarden && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-[#FFEB3B]/60"
                style={{ left: `${20 + i * 25}%`, top: `${35 + (i % 2) * 15}%`, willChange: 'transform, opacity' }}
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </>
        )}
      </div>

      {/* Milestone Progress */}
      {stats.goodMoodCount < 21 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-xl border border-border/30">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {stats.goodMoodCount < 7 ? "🌱 Growing to Full Garden" : "🌸 Growing to Rare Plant"}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {stats.goodMoodCount < 7 ? `${stats.goodMoodCount}/7 good moods` : `${stats.goodMoodCount}/21 good moods`}
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${stats.goodMoodCount >= 7 ? "bg-gradient-to-r from-[#F9A825] to-[#FF8F00]" : "bg-gradient-to-r from-primary to-primary/70"}`}
              initial={{ width: 0 }}
              animate={{ width: stats.goodMoodCount < 7 ? `${(stats.goodMoodCount / 7) * 100}%` : `${((stats.goodMoodCount - 7) / 14) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
            {stats.goodMoodCount < 7
              ? `Log ${7 - stats.goodMoodCount} more good moods to unlock a full garden!`
              : `Log ${21 - stats.goodMoodCount} more good moods to unlock the rare Golden Lotus!`}
          </p>
        </div>
      )}

      {/* Achievement Banner */}
      {stats.goodMoodCount >= 21 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border border-[#FFB300]/30" style={{ background: 'linear-gradient(to right, rgba(249,168,37,0.15), rgba(255,143,0,0.15), rgba(249,168,37,0.15))' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ background: 'rgba(255,179,0,0.25)' }}>
              <Star className="w-5 h-5" style={{ color: '#FFB300' }} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-foreground">🏆 Rare Golden Lotus Unlocked!</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground">You've achieved {stats.goodMoodCount} good mood check-ins. Amazing!</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        {[
          { label: "Mood Check-ins", value: stats.moodEntries, color: "text-primary", bg: "bg-primary/10" },
          { label: "Good Moods 🌟", value: stats.goodMoodCount, color: "text-primary", bg: "bg-primary/10" },
          { label: "Journal Entries", value: stats.journalEntries, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Mindful Minutes", value: stats.mindfulMinutes, color: "text-accent", bg: "bg-accent/10" },
        ].map((s, i) => (
          <div key={i} className={`text-center p-3 md:p-4 ${s.bg} rounded-xl`}>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plant Collection */}
      <div className="mb-4 sm:mb-6">
        <GardenEvolution playerLevel={progress.level} goodMoodCount={stats.goodMoodCount} lootPlants={lootPlants} />
      </div>

      {/* History Button */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hover:bg-primary/10 w-full sm:w-auto h-10 sm:h-11 text-sm">
            <TrendingUp className="w-4 h-4 mr-2" /> View Growth History
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> Your Growth Journey
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-4 sm:mt-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[
                { v: stats.totalActions, l: "Total Actions", c: "text-primary", b: "bg-primary/5" },
                { v: stats.level, l: "Current Level", c: "text-secondary", b: "bg-secondary/5" },
                { v: growthHistory.length, l: "Activities", c: "text-accent", b: "bg-accent/5" },
              ].map((s, i) => (
                <div key={i} className={`text-center p-2 sm:p-3 ${s.b} rounded-lg`}>
                  <div className={`text-base sm:text-lg font-semibold ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              {growthHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Leaf className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No growth history yet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-4">Start your journey by checking your mood, writing in your journal, or practicing mindfulness!</p>
                </div>
              ) : (
                growthHistory.map((entry, index) => {
                  const Icon = entry.icon;
                  return (
                    <div key={index} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`p-1.5 sm:p-2 rounded-full ${getTypeColor(entry.type)} flex-shrink-0`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-xs sm:text-sm">{entry.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{entry.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">{entry.type}</Badge>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Realistic flower component
const Flower = ({ left, color1, color2, delay = 0, size = "md" }: { left: string; color1: string; color2: string; delay?: number; size?: string }) => {
  const petalW = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const petalH = size === "sm" ? 8 : size === "lg" ? 14 : 11;
  const centerSize = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const stemH = size === "sm" ? 20 : size === "lg" ? 32 : 26;

  return (
    <motion.div
      className="absolute bottom-14 flex flex-col items-center"
      style={{ left }}
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", delay }}
    >
      {/* Flower head */}
      <motion.div className="relative" animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        {[0, 60, 120, 180, 240, 300].map((r, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: petalW, height: petalH,
              background: `linear-gradient(to top, ${color1}, ${color2})`,
              transform: `rotate(${r}deg) translateY(-${petalH * 0.7}px)`,
              transformOrigin: 'bottom center',
              left: '50%', top: '50%', marginLeft: -petalW / 2, marginTop: -petalH / 2,
            }} />
        ))}
        <div className="rounded-full shadow-sm"
          style={{ width: centerSize, height: centerSize, background: 'linear-gradient(to bottom, #FFF176, #FFD54F, #FFB300)' }} />
      </motion.div>
      {/* Stem */}
      <div className="bg-gradient-to-b from-[#388E3C] to-[#2E7D32] rounded-full" style={{ width: 2, height: stemH, marginTop: -2 }} />
      {/* Leaves */}
      <div className="absolute rounded-full bg-[#43A047]" style={{ width: 10, height: 6, bottom: stemH * 0.4, left: -8, transform: 'rotate(-40deg)' }} />
      <div className="absolute rounded-full bg-[#43A047]" style={{ width: 10, height: 6, bottom: stemH * 0.6, right: -8, transform: 'rotate(40deg)' }} />
    </motion.div>
  );
};

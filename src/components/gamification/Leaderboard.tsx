import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ChevronDown, ChevronUp, Flame, Zap, Crown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerProgress, getLevelTitle, getLevelEmoji } from "@/hooks/usePlayerProgress";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  isYou: boolean;
}

// Generate realistic fake leaderboard data seeded by date
const generateLeaderboard = (yourLevel: number, yourXp: number, yourStreak: number): LeaderboardEntry[] => {
  const names = [
    'MindfulSoul', 'CalmWarrior', 'ZenExplorer', 'PeacefulHeart', 'InnerLight',
    'SoulSeeker', 'QuietMind', 'GentleBreeze', 'StarGazer', 'MoonChild',
    'DreamWeaver', 'SunChaser', 'CloudWalker', 'OceanBreeze', 'ForestWhisper',
    'BraveSoul', 'WiseOwl', 'GoldenHeart', 'SilverLining', 'CosmicEnergy'
  ];
  
  const seed = new Date().toDateString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seededRandom = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
  
  const entries: LeaderboardEntry[] = [];
  
  // Generate 9 fake entries with varying stats
  for (let i = 0; i < 9; i++) {
    const nameSeed = seed + i * 7;
    const nameIdx = Math.floor(seededRandom(nameSeed) * names.length);
    const levelVariance = Math.floor(seededRandom(seed + i * 13) * 8) - 2;
    const fakeLevel = Math.max(1, yourLevel + levelVariance);
    const fakeXp = Math.floor(seededRandom(seed + i * 17) * 500) + fakeLevel * 50;
    const fakeStreak = Math.floor(seededRandom(seed + i * 23) * 15);
    
    entries.push({
      rank: 0,
      name: names[nameIdx],
      level: fakeLevel,
      xp: fakeXp,
      streak: fakeStreak,
      isYou: false,
    });
  }
  
  // Add "You"
  entries.push({
    rank: 0,
    name: 'You',
    level: yourLevel,
    xp: yourXp,
    streak: yourStreak,
    isYou: true,
  });
  
  // Sort by XP descending
  entries.sort((a, b) => b.xp - a.xp);
  entries.forEach((e, i) => { e.rank = i + 1; });
  
  return entries;
};

const rankIcons: Record<number, typeof Trophy> = {
  1: Crown,
  2: Medal,
  3: Medal,
};

const rankColors: Record<number, string> = {
  1: 'text-status-warning',
  2: 'text-muted-foreground',
  3: 'text-[#CD7F32]',
};

export const Leaderboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { progress } = usePlayerProgress();

  useEffect(() => {
    setEntries(generateLeaderboard(progress.level, progress.totalXpEarned, progress.currentStreak));
  }, [progress.level, progress.totalXpEarned, progress.currentStreak]);

  const yourRank = entries.find(e => e.isYou)?.rank || 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-status-warning/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-status-warning" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm text-foreground">Leaderboard</h3>
            <p className="text-[10px] text-muted-foreground">Anonymous wellness rankings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {yourRank > 0 && (
            <Badge variant="outline" className="text-[10px] rounded-full">
              #{yourRank}
            </Badge>
          )}
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
            <CardContent className="px-4 pb-5 sm:px-5 space-y-1.5">
              {entries.map((entry, i) => {
                const RankIcon = rankIcons[entry.rank];
                return (
                  <motion.div
                    key={entry.name + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                      entry.isYou ? "bg-primary/10 border border-primary/20" : "bg-muted/10"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center flex-shrink-0">
                      {RankIcon ? (
                        <RankIcon className={`w-4 h-4 mx-auto ${rankColors[entry.rank]}`} />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                      entry.isYou ? "bg-primary/20" : "bg-muted/30"
                    )}>
                      {entry.isYou ? getLevelEmoji(entry.level) : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-medium truncate", entry.isYou ? "text-primary" : "text-foreground")}>
                          {entry.name}
                        </span>
                        {entry.isYou && <Badge variant="default" className="text-[8px] rounded-full px-1.5 py-0">You</Badge>}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        Lv.{entry.level} {getLevelTitle(entry.level)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.streak >= 3 && (
                        <div className="flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-status-warning" />
                          <span className="text-[9px] text-status-warning font-medium">{entry.streak}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-primary" />
                        <span className="text-[9px] text-foreground font-medium">{entry.xp}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <p className="text-[9px] text-muted-foreground text-center pt-2">
                🔒 All names are anonymous · Rankings update daily
              </p>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

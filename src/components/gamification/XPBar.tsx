import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap } from "lucide-react";
import { getLevelTitle, getLevelEmoji, getStreakMultiplier } from "@/hooks/usePlayerProgress";
import { motion } from "framer-motion";

interface XPBarProps {
  level: number;
  xp: number;
  xpToNext: number;
  xpProgress: number;
  streak: number;
  totalXp: number;
  compact?: boolean;
}

export const XPBar = ({ level, xp, xpToNext, xpProgress, streak, totalXp, compact = false }: XPBarProps) => {
  const multiplier = getStreakMultiplier(streak);
  const emoji = getLevelEmoji(level);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{emoji}</span>
          <span className="text-xs font-semibold text-foreground">Lv.{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Progress value={xpProgress} className="h-1.5" />
        </div>
        {streak >= 3 && (
          <Badge variant="outline" className="text-[10px] rounded-full border-status-warning/30 text-status-warning gap-1 px-1.5 py-0">
            <Flame className="w-2.5 h-2.5" />{multiplier}x
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border border-primary/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="text-sm font-bold text-foreground">{title}</div>
            <div className="text-[10px] text-muted-foreground">Level {level}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <Badge variant="outline" className="text-xs rounded-full border-status-warning/30 bg-status-warning/10 text-status-warning gap-1">
              <Flame className="w-3 h-3" />{streak} day · {multiplier}x XP
            </Badge>
          )}
          <Badge variant="outline" className="text-xs rounded-full gap-1">
            <Zap className="w-3 h-3 text-primary" />{totalXp} XP
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={xpProgress} className="h-2 flex-1" />
        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">{xp}/{xpToNext}</span>
      </div>
    </motion.div>
  );
};

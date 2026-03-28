import { Badge } from "@/components/ui/badge";
import { Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface AdaptiveDifficultyProps {
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
  reason: string;
  onAccept: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const getAdaptiveDifficulty = (): { difficulty: 'easy' | 'medium' | 'hard'; reason: string } => {
  const moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
  const recent = moodEntries.slice(-3);
  
  if (recent.length === 0) return { difficulty: 'medium', reason: 'Default challenge level' };

  const stressMoods = ['anxious', 'sad', 'angry', 'stressed', 'overwhelmed'];
  const positiveMoods = ['happy', 'motivated', 'amazing', 'calm', 'excited'];
  
  const recentMoods = recent.map((e: any) => e.mood?.toLowerCase());
  const stressCount = recentMoods.filter((m: string) => stressMoods.includes(m)).length;
  const positiveCount = recentMoods.filter((m: string) => positiveMoods.includes(m)).length;

  if (stressCount >= 2) {
    return { difficulty: 'easy', reason: 'Taking it easy — you\'ve had a tough day 💛' };
  }
  if (positiveCount >= 2) {
    return { difficulty: 'hard', reason: 'You\'re feeling strong — challenge yourself! 💪' };
  }
  return { difficulty: 'medium', reason: 'Balanced challenge for today' };
};

export const AdaptiveDifficultyBadge = ({ suggestedDifficulty, reason, onAccept }: AdaptiveDifficultyProps) => {
  const Icon = suggestedDifficulty === 'easy' ? TrendingDown : suggestedDifficulty === 'hard' ? TrendingUp : Minus;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAccept(suggestedDifficulty)}
      className="w-full p-3 rounded-xl bg-primary/5 border border-primary/15 text-left transition-colors hover:bg-primary/10"
    >
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary">AI Suggests</span>
        <Badge variant="outline" className="text-[10px] rounded-full ml-auto capitalize">{suggestedDifficulty}</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3" /> {reason}
      </p>
    </motion.button>
  );
};

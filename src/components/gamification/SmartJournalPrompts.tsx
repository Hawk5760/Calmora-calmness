import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SmartPrompt {
  prompt: string;
  emoji: string;
  reason: string;
}

const generateSmartPrompts = (): SmartPrompt[] => {
  const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  const journalEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
  const recent = moodEntries.slice(-5);
  const recentMoods = recent.map((e: any) => e.mood?.toLowerCase());
  
  const prompts: SmartPrompt[] = [];

  // Mood-based prompts
  const stressMoods = ['anxious', 'stressed', 'overwhelmed', 'angry'];
  const sadMoods = ['sad', 'lonely', 'down'];
  const happyMoods = ['happy', 'excited', 'amazing', 'motivated'];
  
  const hasStress = recentMoods.some((m: string) => stressMoods.includes(m));
  const hasSadness = recentMoods.some((m: string) => sadMoods.includes(m));
  const hasHappiness = recentMoods.some((m: string) => happyMoods.includes(m));

  if (hasStress) {
    prompts.push({
      prompt: "What's the one thing causing you the most stress right now? If you could wave a magic wand, how would it change?",
      emoji: "🌊",
      reason: "Based on recent stress patterns"
    });
    prompts.push({
      prompt: "Write about a time you overcame something difficult. What strengths did you use?",
      emoji: "💪",
      reason: "Resilience building for stressful times"
    });
  }

  if (hasSadness) {
    prompts.push({
      prompt: "What's one small thing that brought you comfort today, even if it was tiny?",
      emoji: "🌤️",
      reason: "Finding light in difficult days"
    });
    prompts.push({
      prompt: "Write a letter to your future self. What do you want them to know about how you're feeling right now?",
      emoji: "💌",
      reason: "Processing emotions through perspective"
    });
  }

  if (hasHappiness) {
    prompts.push({
      prompt: "What's fueling your positive energy lately? How can you create more of those moments?",
      emoji: "⚡",
      reason: "Amplifying your positive momentum"
    });
    prompts.push({
      prompt: "If you could bottle up how you feel right now and give it a name, what would it be?",
      emoji: "✨",
      reason: "Capturing your best moments"
    });
  }

  // Activity-based prompts
  if (journalEntries.length === 0) {
    prompts.push({
      prompt: "Welcome to journaling! Start with: What are 3 things you're thankful for right now?",
      emoji: "🌱",
      reason: "Great first journal prompt"
    });
  }

  if (moodEntries.length >= 7) {
    prompts.push({
      prompt: "Looking back at your mood patterns this week, what patterns do you notice? What triggers your best days?",
      emoji: "📊",
      reason: "You have enough mood data for self-reflection"
    });
  }

  // Time-based prompts
  const hour = new Date().getHours();
  if (hour < 12) {
    prompts.push({
      prompt: "What intention do you want to set for today? What would make today feel meaningful?",
      emoji: "🌅",
      reason: "Morning intention setting"
    });
  } else if (hour >= 20) {
    prompts.push({
      prompt: "What was the best part of your day? What would you do differently tomorrow?",
      emoji: "🌙",
      reason: "Evening reflection"
    });
  }

  // Default fallbacks
  if (prompts.length < 2) {
    prompts.push({
      prompt: "Describe your current emotional landscape as if it were a weather report. What's the forecast?",
      emoji: "🌦️",
      reason: "Creative emotional exploration"
    });
    prompts.push({
      prompt: "What conversation have you been avoiding? What would you say if you could speak freely?",
      emoji: "💭",
      reason: "Uncovering hidden thoughts"
    });
  }

  // Shuffle and return top 3
  return prompts.sort(() => Math.random() - 0.5).slice(0, 3);
};

interface SmartJournalPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SmartJournalPrompts = ({ onSelectPrompt }: SmartJournalPromptsProps) => {
  const [prompts, setPrompts] = useState<SmartPrompt[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setPrompts(generateSmartPrompts());
  }, []);

  const refresh = () => {
    setPrompts(generateSmartPrompts());
  };

  if (!isVisible || prompts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Smart Prompts</span>
          <Badge variant="outline" className="text-[9px] rounded-full border-primary/30 text-primary">
            Personalized
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={refresh}
        >
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {prompts.map((p, i) => (
            <motion.button
              key={p.prompt}
              layout
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelectPrompt(p.prompt)}
              className="w-full text-left p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0">{p.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {p.prompt}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {p.reason}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

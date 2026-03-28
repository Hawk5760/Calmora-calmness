import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface MoodCoachChallengeProps {
  mood: string;
}

const MOOD_CHALLENGES: Record<string, { challenge: string; tip: string; emoji: string }[]> = {
  sad: [
    { challenge: "Write 3 things that made you smile this week", tip: "Gratitude rewires your brain for positivity", emoji: "📝" },
    { challenge: "Take a 10-minute walk outside", tip: "Nature + movement boosts serotonin naturally", emoji: "🚶" },
    { challenge: "Call or text someone you care about", tip: "Social connection is a powerful mood lifter", emoji: "📱" },
  ],
  anxious: [
    { challenge: "Do a 5-minute breathing exercise", tip: "Box breathing activates your calming nervous system", emoji: "🧘" },
    { challenge: "Write down your worries, then close the notebook", tip: "Externalizing anxiety reduces its power", emoji: "📓" },
    { challenge: "Name 5 things you can see, 4 you can touch", tip: "Grounding brings you back to the present", emoji: "👀" },
  ],
  angry: [
    { challenge: "Do 20 jumping jacks right now", tip: "Physical movement releases pent-up energy safely", emoji: "💪" },
    { challenge: "Write a letter you'll never send", tip: "Expressing feelings reduces their intensity", emoji: "✉️" },
    { challenge: "Splash cold water on your face", tip: "The dive reflex instantly calms your nervous system", emoji: "💧" },
  ],
  happy: [
    { challenge: "Share your good mood — compliment someone", tip: "Spreading joy amplifies your own happiness", emoji: "🌟" },
    { challenge: "Capture this moment in your journal", tip: "Documenting joy creates a happiness bank", emoji: "📸" },
    { challenge: "Try something new today", tip: "Positive moods boost creativity and openness", emoji: "🎨" },
  ],
  calm: [
    { challenge: "Extend this calm with a 10-min meditation", tip: "Building on calm states deepens inner peace", emoji: "🕯️" },
    { challenge: "Practice mindful eating at your next meal", tip: "Mindfulness in daily activities sustains calm", emoji: "🍵" },
    { challenge: "Read for 15 minutes", tip: "Calm states enhance focus and comprehension", emoji: "📚" },
  ],
  motivated: [
    { challenge: "Set one specific goal for this week", tip: "Channel motivation into concrete action", emoji: "🎯" },
    { challenge: "Start that task you've been putting off", tip: "Momentum from motivation is powerful — use it!", emoji: "🚀" },
    { challenge: "Teach someone something you know", tip: "Sharing knowledge reinforces your own mastery", emoji: "🧠" },
  ],
};

const getChallenge = (mood: string) => {
  const key = mood.toLowerCase();
  const challenges = MOOD_CHALLENGES[key] || MOOD_CHALLENGES['calm'] || [];
  return challenges[Math.floor(Math.random() * challenges.length)];
};

export const MoodCoachChallenge = ({ mood }: MoodCoachChallengeProps) => {
  const challenge = getChallenge(mood);
  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-5 border-status-warning/20 bg-status-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-status-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Mood Coach</h3>
            <p className="text-[10px] text-muted-foreground">Personalized micro-challenge</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px] rounded-full gap-1 border-primary/30 text-primary">
            <Zap className="w-2.5 h-2.5" />+10 XP
          </Badge>
        </div>
        <div className="p-3 rounded-lg bg-background/60 border border-border/30">
          <p className="text-sm font-medium text-foreground mb-1">
            {challenge.emoji} {challenge.challenge}
          </p>
          <p className="text-xs text-muted-foreground italic">💡 {challenge.tip}</p>
        </div>
      </Card>
    </motion.div>
  );
};

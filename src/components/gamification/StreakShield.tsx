import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Shield, ShieldCheck, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export const useStreakShields = () => {
  const { user } = useAuth();
  const storageKey = user ? `streak_shields_${user.id}` : 'streak_shields_guest';

  const getShields = useCallback((): number => {
    return parseInt(localStorage.getItem(storageKey) || '0');
  }, [storageKey]);

  const addShield = useCallback(() => {
    const current = getShields();
    localStorage.setItem(storageKey, String(Math.min(current + 1, 5)));
  }, [storageKey, getShields]);

  const useShield = useCallback((): boolean => {
    const current = getShields();
    if (current <= 0) return false;
    localStorage.setItem(storageKey, String(current - 1));
    return true;
  }, [storageKey, getShields]);

  return { getShields, addShield, useShield };
};

// Earned at: 7-day streak, 14-day streak, completing all quests 3 days in a row
export const checkShieldEarning = (streak: number, questCompleteDays: number): string | null => {
  const earned = localStorage.getItem('shield_earned_milestones') || '';
  
  if (streak >= 7 && !earned.includes('7d')) {
    localStorage.setItem('shield_earned_milestones', earned + ',7d');
    return "7-day streak milestone! 🛡️";
  }
  if (streak >= 14 && !earned.includes('14d')) {
    localStorage.setItem('shield_earned_milestones', earned + ',14d');
    return "14-day streak milestone! 🛡️🛡️";
  }
  return null;
};

interface StreakShieldDisplayProps {
  shields: number;
  streak: number;
}

export const StreakShieldDisplay = ({ shields, streak }: StreakShieldDisplayProps) => {
  const [showInfo, setShowInfo] = useState(false);

  if (streak < 3 && shields === 0) return null;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowInfo(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
      >
        <Shield className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-semibold text-foreground">{shields}</span>
      </motion.button>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-sm border-primary/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Streak Shields</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Shields protect your streak if you miss a day. You have <span className="font-bold text-primary">{shields}</span> shield{shields !== 1 ? 's' : ''}.
            </p>

            <div className="flex justify-center gap-1.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i < shields ? 'bg-primary/15 border border-primary/30' : 'bg-muted/20 border border-border/30'
                  }`}
                >
                  <Shield className={`w-4 h-4 ${i < shields ? 'text-primary' : 'text-muted-foreground/30'}`} />
                </div>
              ))}
            </div>

            <div className="space-y-2 text-left">
              <p className="text-[10px] font-semibold text-foreground">How to earn shields:</p>
              <div className="space-y-1.5">
                {[
                  { label: "7-day streak", icon: Flame },
                  { label: "14-day streak", icon: Flame },
                  { label: "All daily quests completed", icon: Sparkles },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 text-[10px] text-muted-foreground">
                    <item.icon className="w-3 h-3 text-primary" />
                    {item.label} → +1 Shield
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setShowInfo(false)} variant="outline" className="rounded-full mt-4">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

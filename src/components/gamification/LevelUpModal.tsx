import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLevelTitle, getLevelEmoji } from "@/hooks/usePlayerProgress";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LevelUpModalProps {
  open: boolean;
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal = ({ open, oldLevel, newLevel, onClose }: LevelUpModalProps) => {
  const emoji = getLevelEmoji(newLevel);
  const title = getLevelTitle(newLevel);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center border-primary/30">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-4"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border-2 border-primary/30">
            <span className="text-5xl">{emoji}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-5 h-5 text-status-warning" />
            <h2 className="text-xl font-bold text-foreground">Level Up!</h2>
            <Sparkles className="w-5 h-5 text-status-warning" />
          </div>
          <p className="text-muted-foreground text-sm mb-1">
            Level {oldLevel} → Level {newLevel}
          </p>
          <p className="text-lg font-semibold text-primary mb-6">
            You are now a {title}!
          </p>
        </motion.div>

        <Button onClick={onClose} className="rounded-full px-8">
          Continue Journey
        </Button>
      </DialogContent>
    </Dialog>
  );
};

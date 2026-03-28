import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Gift, Sparkles } from "lucide-react";
import { DailyQuest } from "@/hooks/useDailyQuests";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DailyQuestsPanelProps {
  quests: DailyQuest[];
  completedCount: number;
  totalQuests: number;
  allComplete: boolean;
}

export const DailyQuestsPanel = ({ quests, completedCount, totalQuests, allComplete }: DailyQuestsPanelProps) => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-status-warning" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Daily Quests</h3>
          </div>
          <Badge variant="outline" className="text-[10px] rounded-full">
            {completedCount}/{totalQuests}
          </Badge>
        </div>

        <div className="space-y-2">
          {quests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                quest.completed ? "bg-status-success/5 border border-status-success/20" : "bg-muted/20"
              )}
            >
              {quest.completed ? (
                <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium", quest.completed && "line-through text-muted-foreground")}>
                  <span className="mr-1.5">{quest.icon}</span>
                  {quest.title}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{quest.description}</p>
              </div>
              <Badge variant={quest.completed ? "default" : "secondary"} className="text-[10px] rounded-full flex-shrink-0">
                +{quest.xpReward} XP
              </Badge>
            </motion.div>
          ))}
        </div>

        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 rounded-lg bg-gradient-to-r from-status-warning/10 to-status-warning/5 border border-status-warning/20 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-status-warning" />
              <span className="text-xs font-semibold text-foreground">All Quests Complete! +25 Bonus XP 🎉</span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

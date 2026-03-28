import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Lock, CheckCircle2, Medal, Sparkles } from "lucide-react";
import { Achievement, UserStats } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

interface AchievementsBadgesProps {
  achievements: Achievement[];
  stats: UserStats;
  compact?: boolean;
}

export const AchievementsBadges = ({ achievements, stats, compact = false }: AchievementsBadgesProps) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  const recentUnlocked = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'puzzle': return 'bg-feature-journal/10 border-feature-journal/30 text-feature-journal';
      case 'wellness': return 'bg-feature-mindfulness/10 border-feature-mindfulness/30 text-feature-mindfulness';
      case 'streak': return 'bg-status-warning/10 border-status-warning/30 text-status-warning';
      case 'milestone': return 'bg-feature-chat/10 border-feature-chat/30 text-feature-chat';
      default: return 'bg-muted';
    }
  };

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{unlockedCount}/{totalCount} Badges</div>
                    <div className="text-xs text-muted-foreground">Tap to view all</div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {recentUnlocked.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-soul/20 flex items-center justify-center border-2 border-background text-lg"
                      title={achievement.name}
                    >
                      {achievement.icon}
                    </div>
                  ))}
                </div>
              </div>
              <Progress value={progressPercent} className="h-1.5 mt-3" />
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements & Badges
            </DialogTitle>
          </DialogHeader>
          <AchievementsFullView achievements={achievements} stats={stats} />
        </DialogContent>
      </Dialog>
    );
  }

  return <AchievementsFullView achievements={achievements} stats={stats} />;
};

const AchievementsFullView = ({ achievements, stats }: { achievements: Achievement[], stats: UserStats }) => {
  const categories: Achievement['category'][] = ['puzzle', 'streak', 'milestone', 'wellness'];
  const categoryNames = {
    puzzle: 'Puzzle Masters',
    streak: 'Streak Champions', 
    milestone: 'Milestones',
    wellness: 'Wellness Goals'
  };

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Stats Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-soul/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold">{stats.totalGamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stats.longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stats.bestMoves === 999 ? '-' : stats.bestMoves}</div>
                <div className="text-xs text-muted-foreground">Best Moves</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stats.perfectGames}</div>
                <div className="text-xs text-muted-foreground">Perfect</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements by Category */}
        {categories.map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{categoryNames[category]}</h3>
                <Badge variant="outline" className="text-xs">
                  {unlockedInCategory}/{categoryAchievements.length}
                </Badge>
              </div>
              <div className="grid gap-2">
                {categoryAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'puzzle': return 'from-feature-journal/20 to-feature-journal/10 border-feature-journal/30';
      case 'wellness': return 'from-feature-mindfulness/20 to-feature-mindfulness/10 border-feature-mindfulness/30';
      case 'streak': return 'from-status-warning/20 to-status-warning/10 border-status-warning/30';
      case 'milestone': return 'from-feature-chat/20 to-feature-chat/10 border-feature-chat/30';
      default: return 'from-muted to-muted';
    }
  };

  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border transition-all",
        achievement.unlocked
          ? `bg-gradient-to-r ${getCategoryColor(achievement.category)}`
          : "bg-muted/30 border-muted opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xl",
          achievement.unlocked 
            ? "bg-background/80" 
            : "bg-muted grayscale"
        )}>
          {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm",
              !achievement.unlocked && "text-muted-foreground"
            )}>
              {achievement.name}
            </span>
            {achievement.unlocked && (
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
        </div>
      </div>
      
      {!achievement.unlocked && achievement.progress > 0 && (
        <div className="mt-2">
          <Progress 
            value={(achievement.progress / achievement.requirement) * 100} 
            className="h-1" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Progress: {achievement.progress}/{achievement.requirement}
          </p>
        </div>
      )}
      
      {achievement.unlocked && achievement.unlockedAt && (
        <p className="text-xs text-muted-foreground mt-1">
          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

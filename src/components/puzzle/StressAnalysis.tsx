import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, TrendingUp, TrendingDown, Minus, Sparkles, Clock, Target, Activity } from "lucide-react";
import { UserStats } from "@/hooks/useAchievements";

interface StressAnalysisProps {
  moves: number;
  timeSeconds: number;
  stats: UserStats;
  difficulty?: "easy" | "medium" | "hard";
  totalPairs?: number;
}

export const StressAnalysis = ({ moves, timeSeconds, stats, difficulty = "medium", totalPairs = 8 }: StressAnalysisProps) => {
  // Adjust minimum moves based on difficulty
  const minMoves = totalPairs;
  const maxReasonableMoves = totalPairs * 2.5;

  const calculateFocusScore = () => {
    const focusScore = Math.max(0, Math.min(100, 100 - ((moves - minMoves) / (maxReasonableMoves - minMoves)) * 100));
    return Math.round(focusScore);
  };

  const calculatePaceScore = () => {
    const avgTimePerMove = timeSeconds / moves;
    if (avgTimePerMove >= 2 && avgTimePerMove <= 6) return 100;
    if (avgTimePerMove < 2) return 70;
    return Math.max(30, 100 - ((avgTimePerMove - 6) * 5));
  };

  const calculateConsistencyScore = () => {
    if (stats.totalGamesPlayed < 2) return 50;
    const deviation = Math.abs(moves - stats.avgMoves);
    return Math.max(30, Math.min(100, 100 - deviation * 10));
  };

  const calculateEfficiencyScore = () => {
    const ratio = minMoves / moves;
    return Math.round(Math.min(100, ratio * 100));
  };

  const focusScore = calculateFocusScore();
  const paceScore = calculatePaceScore();
  const consistencyScore = calculateConsistencyScore();
  const efficiencyScore = calculateEfficiencyScore();
  const overallWellness = Math.round((focusScore + paceScore + consistencyScore + efficiencyScore) / 4);

  const getStressLevel = () => {
    if (overallWellness >= 80) return { level: 'Low', color: 'bg-status-success', text: 'text-status-success', description: 'Aap bahut relaxed aur focused hain! 🌟' };
    if (overallWellness >= 60) return { level: 'Moderate', color: 'bg-status-warning', text: 'text-status-warning', description: 'Normal stress level hai, keep going! 💪' };
    if (overallWellness >= 40) return { level: 'Elevated', color: 'bg-mood-motivated', text: 'text-mood-motivated', description: 'Thoda stressed lag rahe ho, break lo! 🧘' };
    return { level: 'High', color: 'bg-destructive', text: 'text-destructive', description: 'Aapko rest ki zaroorat hai. Deep breaths lo. 💙' };
  };

  const getTrend = () => {
    if (stats.totalGamesPlayed < 3) return 'neutral';
    if (moves < stats.avgMoves) return 'improving';
    if (moves > stats.avgMoves + 3) return 'declining';
    return 'stable';
  };

  const stressInfo = getStressLevel();
  const trend = getTrend();

  const getDifficultyInsight = () => {
    if (difficulty === "hard") {
      if (moves <= totalPairs + 4) return "🏆 Hard mode mein itna kam moves! Exceptional cognitive ability!";
      if (moves <= totalPairs * 2) return "💪 Hard mode complete! Your brain is handling complexity well.";
      return "🧩 Hard mode is challenging — great for brain training!";
    }
    if (difficulty === "easy") {
      if (moves === totalPairs) return "⚡ Perfect game on easy! Ready for a harder challenge?";
      return "🌱 Easy mode is great for warm-up and relaxation.";
    }
    if (moves === totalPairs) return "🧠 Perfect game! Flawless memory today.";
    if (moves <= totalPairs + 2) return "✨ Near-perfect! Your working memory is sharp.";
    return null;
  };

  const getWellnessInsights = () => {
    const insights: string[] = [];
    
    const diffInsight = getDifficultyInsight();
    if (diffInsight) insights.push(diffInsight);

    if (focusScore >= 80) {
      insights.push("🎯 Excellent focus! Aapka concentration top-notch hai.");
    } else if (focusScore >= 60) {
      insights.push("🎯 Good focus level. Thoda aur practice se improve hoga.");
    } else {
      insights.push("🎯 Focus improve karne ke liye, try a 2-min breathing exercise before playing.");
    }

    if (paceScore >= 80) {
      insights.push("⏱️ Perfect pace! Balanced approach — na zyada jaldi, na slow.");
    } else if (paceScore < 60) {
      insights.push("⏱️ Pace adjust karo — rushing se mistakes badhti hain.");
    }

    if (efficiencyScore >= 90) {
      insights.push("📊 Memory efficiency outstanding! You're recalling positions accurately.");
    } else if (efficiencyScore < 50) {
      insights.push("📊 Try to remember card positions — it builds stronger neural pathways.");
    }

    if (stats.currentStreak >= 3) {
      insights.push(`🔥 ${stats.currentStreak} day streak! Consistency mental wellness ke liye great hai.`);
    }

    if (stats.totalGamesPlayed >= 10 && moves < stats.avgMoves) {
      insights.push("📈 You're improving! Average se better perform kiya.");
    }

    return insights;
  };

  const getCopingTips = () => {
    if (overallWellness >= 80) {
      return [
        "Is positive energy ko baaki activities mein bhi carry karo",
        "Someone ke saath apni achievements share karo",
        difficulty !== "hard" ? "Ek level upar try karo — challenge brain ko sharper banata hai" : "You've mastered the hardest level! Amazing!"
      ];
    }
    if (overallWellness >= 60) {
      return [
        "5 minute ka breathing exercise try karo",
        "Thoda pani piyo aur stretch karo",
        "Positive self-talk practice karo"
      ];
    }
    return [
      "Deep breathing: 4 counts inhale, 7 hold, 8 exhale",
      "Short walk ya window ke paas jake fresh air lo",
      "Kisi se baat karo ya calming music sunno",
      "Aaj ke liye break lo, kal phir try karna"
    ];
  };

  return (
    <div className="space-y-4">
      {/* Overall Wellness Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            AI Wellness Analysis
            {difficulty !== "medium" && (
              <Badge variant="outline" className="ml-2 text-xs">
                {difficulty === "hard" ? "🔥 Hard" : "🌱 Easy"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-primary">{overallWellness}%</div>
              <div className="text-sm text-muted-foreground">Overall Wellness Score</div>
            </div>
            <div className="text-right">
              <Badge className={`${stressInfo.color} text-primary-foreground`}>
                {stressInfo.level} Stress
              </Badge>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {trend === 'improving' && <TrendingUp className="w-4 h-4 text-status-success" />}
                {trend === 'declining' && <TrendingDown className="w-4 h-4 text-destructive" />}
                {trend === 'stable' && <Minus className="w-4 h-4 text-status-warning" />}
                {trend === 'neutral' && <Activity className="w-4 h-4 text-muted-foreground" />}
                <span className={trend === 'improving' ? 'text-status-success' : trend === 'declining' ? 'text-destructive' : 'text-muted-foreground'}>
                  {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Needs attention' : trend === 'stable' ? 'Stable' : 'Building data'}
                </span>
              </div>
            </div>
          </div>
          <p className={`text-sm ${stressInfo.text} font-medium`}>{stressInfo.description}</p>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Target, label: "Focus", score: focusScore, color: "text-status-info" },
          { icon: Clock, label: "Pace", score: paceScore, color: "text-feature-chat" },
          { icon: Activity, label: "Consistency", score: consistencyScore, color: "text-status-success" },
          { icon: Brain, label: "Efficiency", score: efficiencyScore, color: "text-status-warning" },
        ].map((item, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <div className="text-xl font-bold">{item.score}%</div>
            <Progress value={item.score} className="h-1 mt-2" />
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-status-warning" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getWellnessInsights().map((insight, index) => (
              <li key={index} className="text-sm text-muted-foreground">{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Coping Tips */}
      <Card className="bg-gradient-to-br from-status-success/5 to-transparent border-status-success/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-4 h-4 text-status-success" />
            Wellness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getCopingTips().map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-status-success">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Game Stats Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">This Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{moves}</div>
              <div className="text-xs text-muted-foreground">Total Moves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.floor(timeSeconds / 60)}:{(timeSeconds % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Time Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-status-success">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-status-info">{stats.totalGamesPlayed}</div>
              <div className="text-xs text-muted-foreground">Games Played</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

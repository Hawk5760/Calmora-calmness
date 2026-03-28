import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Wind, Play, Pause, RotateCcw, Heart, Brain, Moon, Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { toast as sonnerToast } from "sonner";

interface BreathingSession {
  id: string;
  type: string;
  duration: number;
  timestamp: Date;
}

export const MindfulnessPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionDuration, setSessionDuration] = useState([5]);
  const [selectedPattern, setSelectedPattern] = useState("calm");
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const { toast } = useToast();
  const { addXP, levelUpData, clearLevelUp } = usePlayerProgress();
  const { completeQuest } = useDailyQuests();

  const breathingPatterns = [
    { id: "calm", name: "Calm Breathing", icon: Wind, description: "4-4-4-4 pattern for general relaxation", pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 }, gradient: "from-sky-500/20 to-blue-500/20", iconColor: "text-sky-500", ring: "ring-sky-500/30" },
    { id: "stress", name: "Stress Relief", icon: Heart, description: "4-7-8 pattern to reduce anxiety", pattern: { inhale: 4, hold: 7, exhale: 8, pause: 2 }, gradient: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-500", ring: "ring-emerald-500/30" },
    { id: "focus", name: "Focus Enhancement", icon: Brain, description: "6-2-6-2 pattern for concentration", pattern: { inhale: 6, hold: 2, exhale: 6, pause: 2 }, gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-500", ring: "ring-violet-500/30" },
    { id: "sleep", name: "Sleep Preparation", icon: Moon, description: "4-4-6-2 pattern for better sleep", pattern: { inhale: 4, hold: 4, exhale: 6, pause: 2 }, gradient: "from-indigo-500/20 to-blue-600/20", iconColor: "text-indigo-500", ring: "ring-indigo-500/30" }
  ];

  const selectedPatternData = breathingPatterns.find(p => p.id === selectedPattern)!;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
        const pattern = selectedPatternData.pattern;
        const cycleTime = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause;
        const currentCyclePosition = (sessionDuration[0] * 60 - timeLeft) % cycleTime;
        if (currentCyclePosition < pattern.inhale) setCurrentPhase("inhale");
        else if (currentCyclePosition < pattern.inhale + pattern.hold) setCurrentPhase("hold");
        else if (currentCyclePosition < pattern.inhale + pattern.hold + pattern.exhale) setCurrentPhase("exhale");
        else setCurrentPhase("pause");
      }, 1000);
    } else if (timeLeft === 0 && isActive) handleSessionComplete();
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, selectedPatternData, sessionDuration]);

  const startSession = () => {
    setTimeLeft(sessionDuration[0] * 60);
    setIsActive(true);
    setCurrentPhase("inhale");
    setCompletedMinutes(0);
    toast({ title: "Session started 🧘", description: `${sessionDuration[0]} min of ${selectedPatternData.name}` });
  };

  const pauseSession = () => setIsActive(false);
  const resumeSession = () => setIsActive(true);
  const stopSession = () => { setIsActive(false); setTimeLeft(0); setCurrentPhase("inhale"); };

  const handleSessionComplete = () => {
    setIsActive(false);
    const minutes = sessionDuration[0];
    setCompletedMinutes(prev => prev + minutes);
    const session: BreathingSession = { id: Date.now().toString(), type: selectedPattern, duration: minutes, timestamp: new Date() };
    const existingSessions = JSON.parse(localStorage.getItem("breathingSessions") || "[]");
    existingSessions.push(session);
    localStorage.setItem("breathingSessions", JSON.stringify(existingSessions));
    const existingStats = JSON.parse(localStorage.getItem("gardenStats") || "{}");
    const newStats = { ...existingStats, mindfulMinutes: (existingStats.mindfulMinutes || 0) + minutes, totalActions: (existingStats.totalActions || 0) + 1 };
    localStorage.setItem("gardenStats", JSON.stringify(newStats));
    toast({ title: "Session complete! 🧘‍♀️", description: `You've completed ${minutes} minutes of mindful breathing.` });

    // Gamification: Award XP and complete quest
    addXP('meditation');
    const quest = completeQuest('meditation');
    if (quest) {
      sonnerToast.success(`✅ Quest Complete: ${quest.title}`, { description: `+${quest.xpReward} XP earned!` });
      addXP('quest', quest.xpReward);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    const instructions = { inhale: "Breathe in slowly...", hold: "Hold your breath...", exhale: "Breathe out gently...", pause: "Rest and pause..." };
    return instructions[currentPhase];
  };

  const getPhaseEmoji = () => {
    const emojis = { inhale: "🌬️", hold: "✨", exhale: "🍃", pause: "🕊️" };
    return emojis[currentPhase];
  };

  const breathScale = currentPhase === "inhale" || currentPhase === "hold" ? 1.35 : 0.75;
  const phaseDuration = selectedPatternData.pattern[currentPhase];

  return (
    <PageLayout>
      {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-8 sm:mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Wind className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Guided Breathing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gradient-soul">Mindfulness</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">Find your center through mindful breathing exercises</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar */}
          <motion.div className="lg:col-span-1 order-2 lg:order-1 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {/* Patterns */}
            <Card className="p-4 sm:p-5 bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Breathing Patterns
              </h3>
              <div className="space-y-2">
                {breathingPatterns.map((pattern) => {
                  const Icon = pattern.icon;
                  const isSelected = selectedPattern === pattern.id;
                  return (
                    <motion.button
                      key={pattern.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isActive && setSelectedPattern(pattern.id)}
                      disabled={isActive}
                      className={`w-full text-left p-3 rounded-xl transition-all ${isSelected ? `bg-gradient-to-r ${pattern.gradient} ring-2 ${pattern.ring} shadow-sm` : "bg-muted/30 hover:bg-muted/50"} ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center ${isSelected ? 'shadow-sm' : ''}`}>
                          <Icon className={`w-4 h-4 ${pattern.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-xs">{pattern.name}</h4>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{pattern.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-4 sm:p-5 bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="text-sm font-semibold mb-3 text-foreground">Session Settings</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Duration</label>
                    <Badge variant="secondary" className="text-xs">{sessionDuration[0]} min</Badge>
                  </div>
                  <Slider value={sessionDuration} onValueChange={setSessionDuration} max={30} min={1} step={1} disabled={isActive} className="w-full touch-pan-y" />
                </div>
                <div className="p-2.5 rounded-lg bg-muted/30 text-center">
                  <span className="text-xs text-muted-foreground">Pattern: </span>
                  <span className="text-xs font-mono font-medium text-foreground">
                    {selectedPatternData.pattern.inhale}-{selectedPatternData.pattern.hold}-{selectedPatternData.pattern.exhale}-{selectedPatternData.pattern.pause}
                  </span>
                </div>
              </div>
            </Card>

            {completedMinutes > 0 && (
              <Card className="p-4 bg-primary/10 border-primary/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{completedMinutes}</div>
                  <p className="text-xs text-muted-foreground">minutes completed today</p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Main Visualization */}
          <motion.div className="lg:col-span-2 order-1 lg:order-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden relative">
              {/* Ambient bg particles */}
              {isActive && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
                      style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
                      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              )}

              <div className="text-center relative z-10">
                {/* Breathing Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center">
                    {/* Outer glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
                      animate={{ scale: isActive || timeLeft > 0 ? breathScale : 1 }}
                      transition={{ duration: phaseDuration, ease: "easeInOut" }}
                    />
                    {/* Outer ring */}
                    <motion.div
                      className="absolute w-full h-full rounded-full border-2 border-primary/20"
                      animate={{ scale: isActive || timeLeft > 0 ? breathScale : 1 }}
                      transition={{ duration: phaseDuration, ease: "easeInOut" }}
                    />
                    {/* Middle ring */}
                    <motion.div
                      className="absolute w-[85%] h-[85%] rounded-full border border-primary/15"
                      animate={{ scale: isActive || timeLeft > 0 ? breathScale * 0.95 : 1 }}
                      transition={{ duration: phaseDuration, ease: "easeInOut" }}
                    />
                    {/* Main circle */}
                    <motion.div
                      className="w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 shadow-[0_0_60px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center"
                      animate={{ scale: isActive || timeLeft > 0 ? breathScale : 1 }}
                      transition={{ duration: phaseDuration, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="w-[65%] h-[65%] rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center border border-primary/10"
                        animate={{ scale: isActive || timeLeft > 0 ? (breathScale > 1 ? 1.1 : 0.9) : 1 }}
                        transition={{ duration: phaseDuration, ease: "easeInOut" }}
                      >
                        <span className="text-3xl sm:text-4xl">{getPhaseEmoji()}</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Phase info */}
                <AnimatePresence mode="wait">
                  <motion.div key={currentPhase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{getPhaseInstruction()}</h3>
                    <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30 bg-primary/5">
                      {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
                    </Badge>
                  </motion.div>
                </AnimatePresence>

                {/* Timer */}
                <div className="mb-6">
                  <div className="text-4xl sm:text-5xl font-bold text-foreground font-mono mb-1">{formatTime(timeLeft)}</div>
                  <p className="text-xs text-muted-foreground">{timeLeft > 0 ? "Time remaining" : "Ready to begin"}</p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-3">
                  {!isActive && timeLeft === 0 && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={startSession} size="lg" className="gap-2 rounded-full px-8 shadow-lg">
                        <Play className="w-5 h-5" /> Start Session
                      </Button>
                    </motion.div>
                  )}
                  {isActive && (
                    <Button onClick={pauseSession} variant="outline" size="lg" className="gap-2 rounded-full px-6">
                      <Pause className="w-5 h-5" /> Pause
                    </Button>
                  )}
                  {!isActive && timeLeft > 0 && (
                    <Button onClick={resumeSession} size="lg" className="gap-2 rounded-full px-8 shadow-lg">
                      <Play className="w-5 h-5" /> Resume
                    </Button>
                  )}
                  {timeLeft > 0 && (
                    <Button onClick={stopSession} variant="destructive" size="lg" className="gap-2 rounded-full px-6">
                      <RotateCcw className="w-5 h-5" /> Stop
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, RefreshCw, Sparkles, Medal, Zap, Clock, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAchievements } from "@/hooks/useAchievements";
import { StressAnalysis } from "@/components/puzzle/StressAnalysis";
import { AchievementsBadges } from "@/components/puzzle/AchievementsBadges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { AdaptiveDifficultyBadge, getAdaptiveDifficulty } from "@/components/gamification/AdaptiveDifficulty";

interface MemoryCard { id: number; symbol: string; isFlipped: boolean; isMatched: boolean; }
type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; cols: number; symbols: string[]; label: string; description: string; emoji: string }> = {
  easy: { pairs: 4, cols: 4, symbols: ['🌸', '🌿', '🦋', '🌊'], label: "Easy", description: "4 pairs · Great for warming up", emoji: "🌱" },
  medium: { pairs: 8, cols: 4, symbols: ['🌸', '🌿', '🦋', '🌊', '⭐', '🌙', '🍀', '🌺'], label: "Medium", description: "8 pairs · The classic challenge", emoji: "🌿" },
  hard: { pairs: 12, cols: 6, symbols: ['🌸', '🌿', '🦋', '🌊', '⭐', '🌙', '🍀', '🌺', '🔥', '❄️', '🌈', '🎯'], label: "Hard", description: "12 pairs · Test your limits", emoji: "🌳" },
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  return shuffled;
};

const createCards = (difficulty: Difficulty): MemoryCard[] => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const pairs = [...config.symbols, ...config.symbols];
  return shuffleArray(pairs).map((symbol, index) => ({ id: index, symbol, isFlipped: false, isMatched: false }));
};

export const WordPuzzleGame = () => {
  const { user } = useAuth();
  const { achievements, stats, recordGameCompletion, newlyUnlocked, clearNewlyUnlocked, getUnlockedCount } = useAchievements();
  const { addXP, levelUpData, clearLevelUp } = usePlayerProgress();
  const { completeQuest } = useDailyQuests();
  const adaptiveSuggestion = getAdaptiveDifficulty();

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isPreviewPhase, setIsPreviewPhase] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const config = DIFFICULTY_CONFIG[difficulty];
  const totalPairs = config.pairs;

  useEffect(() => {
    if (gameStarted && !gameComplete && !isPreviewPhase) {
      timerRef.current = setInterval(() => { setGameTime(Math.floor((Date.now() - startTimeRef.current) / 1000)); }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, gameComplete, isPreviewPhase]);

  useEffect(() => { if (gameStarted) initializeGame(); }, [gameStarted]);

  useEffect(() => {
    if (matches === totalPairs && gameStarted) {
      setGameComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setGameTime(finalTime);
      recordGameCompletion(moves, finalTime);
      // Gamification: Award XP and complete quest
      addXP('puzzle');
      const quest = completeQuest('puzzle');
      if (quest) {
        toast.success(`✅ Quest Complete: ${quest.title}`, { description: `+${quest.xpReward} XP earned!` });
        addXP('quest', quest.xpReward);
      }
      toast.success("Congratulations! 🎉", { description: `All ${totalPairs} pairs found! +30 XP` });
    }
  }, [matches]);

  const initializeGame = () => {
    const newCards = createCards(difficulty);
    setCards(newCards.map(c => ({ ...c, isFlipped: true })));
    setFlippedCards([]); setMoves(0); setMatches(0); setGameComplete(false); setIsLocked(true); setIsPreviewPhase(true); setGameTime(0);
    const previewTime = difficulty === "hard" ? 2000 : difficulty === "easy" ? 800 : 1000;
    setTimeout(() => { setCards(newCards.map(c => ({ ...c, isFlipped: false }))); setIsPreviewPhase(false); setIsLocked(false); startTimeRef.current = Date.now(); }, previewTime);
  };

  const handleCardClick = (cardId: number) => {
    if (isLocked) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) return;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1); setIsLocked(true);
      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId)!, second = cards.find(c => c.id === secondId)!;
      if (first.symbol === second.symbol) {
        setTimeout(() => { setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)); setMatches(prev => prev + 1); setFlippedCards([]); setIsLocked(false); }, 500);
      } else {
        setTimeout(() => { setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)); setFlippedCards([]); setIsLocked(false); }, 1000);
      }
    }
  };

  const startGame = () => setGameStarted(true);
  const resetGame = () => initializeGame();

  // Welcome Screen
  if (!gameStarted) {
    return (
      <PageLayout>
        {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Cognitive Wellness</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gradient-soul">Mind Puzzle</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Memory match game with AI-powered stress analysis & wellness insights</p>
          </motion.div>

          {/* Stats Preview */}
          {stats.totalGamesPlayed > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="mb-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 max-w-md mx-auto">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    {[
                      { v: stats.totalGamesPlayed, l: "Games", color: "text-primary" },
                      { v: stats.currentStreak, l: "Streak", color: "text-emerald-500" },
                      { v: stats.bestMoves === 999 ? '-' : stats.bestMoves, l: "Best", color: "text-sky-500" },
                      { v: getUnlockedCount(), l: "Badges", color: "text-amber-500" },
                    ].map((s, i) => (
                      <div key={i}>
                        <div className={`text-xl font-bold ${s.color}`}>{s.v}</div>
                        <div className="text-[10px] text-muted-foreground">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Difficulty Selection */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="mb-8 border-border/50 max-w-lg mx-auto bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-4 text-center text-foreground">Choose Difficulty</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDifficulty(d)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${difficulty === d ? 'border-primary bg-primary/10 shadow-md' : 'border-border/50 hover:border-primary/40 bg-muted/20'}`}
                    >
                      <span className="text-2xl mb-2 block">{DIFFICULTY_CONFIG[d].emoji}</span>
                      <div className="font-semibold text-xs text-foreground">{DIFFICULTY_CONFIG[d].label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{DIFFICULTY_CONFIG[d].pairs} pairs</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Adaptive Difficulty */}
          <div className="mb-4 max-w-md mx-auto">
            <AdaptiveDifficultyBadge
              suggestedDifficulty={adaptiveSuggestion.difficulty}
              reason={adaptiveSuggestion.reason}
              onAccept={(d) => setDifficulty(d)}
            />
          </div>

          {/* Achievements Preview */}
          <div className="mb-6 max-w-md mx-auto">
            <AchievementsBadges achievements={achievements} stats={stats} compact />
          </div>

          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={startGame} size="lg" className="rounded-full px-8 gap-2 shadow-lg text-sm">
                <Brain className="w-5 h-5" /> Start {config.label} Game
              </Button>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Victory Screen
  if (gameComplete) {
    return (
      <PageLayout>
        {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="relative inline-block mb-4" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-pulse" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient-soul">Congratulations! 🎉</h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{moves} moves</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
              <span>·</span>
              <Badge variant="outline" className="text-xs rounded-full">{config.label}</Badge>
            </div>

            {newlyUnlocked.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="mt-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30 max-w-md mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 justify-center mb-3"><Medal className="w-5 h-5 text-amber-500" /><span className="font-semibold text-sm">New Badges!</span></div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {newlyUnlocked.map(a => <Badge key={a.id} className="bg-gradient-to-r from-amber-500 to-amber-600 text-primary-foreground text-xs py-1 px-3 rounded-full">{a.icon} {a.name}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full p-1">
              <TabsTrigger value="analysis" className="rounded-full gap-2 text-xs sm:text-sm"><Brain className="w-4 h-4" />Stress Report</TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-full gap-2 text-xs sm:text-sm"><Trophy className="w-4 h-4" />Achievements</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis"><StressAnalysis moves={moves} timeSeconds={gameTime} stats={stats} difficulty={difficulty} totalPairs={totalPairs} /></TabsContent>
            <TabsContent value="achievements"><AchievementsBadges achievements={achievements} stats={stats} /></TabsContent>
          </Tabs>

          <div className="flex justify-center gap-3 mt-8">
            <Button onClick={resetGame} size="lg" className="rounded-full px-8 gap-2 shadow-lg"><RefreshCw className="w-5 h-5" />Play Again</Button>
            <Button onClick={() => { setGameStarted(false); setGameComplete(false); }} variant="outline" size="lg" className="rounded-full">Change Difficulty</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Game Board
  return (
    <PageLayout>
      {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gradient-soul">Mind Puzzle</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="rounded-full text-xs">{config.emoji} {config.label}</Badge>
            <span className="text-xs text-muted-foreground">Find all {totalPairs} pairs</span>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-6">
          {[
            { icon: Target, label: "Moves", value: moves, color: "text-primary" },
            { icon: Sparkles, label: "Matches", value: `${matches}/${totalPairs}`, color: "text-emerald-500" },
            { icon: Clock, label: "Time", value: `${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`, color: "text-sky-500" },
          ].map((s, i) => (
            <Card key={i} className="px-4 sm:px-5 py-2.5 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="text-center flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <div>
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {stats.currentStreak > 0 && (
          <div className="text-center mb-4">
            <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-600 rounded-full text-xs">🔥 {stats.currentStreak} day streak</Badge>
          </div>
        )}

        {/* Card Grid */}
        <div className={`grid gap-2.5 sm:gap-3 max-w-${difficulty === 'hard' ? '2xl' : 'lg'} mx-auto mb-8`} style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
              whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card.id)}
              className="aspect-square cursor-pointer"
            >
              <div className={`w-full h-full rounded-xl flex items-center justify-center ${difficulty === 'hard' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'} transition-all duration-300 shadow-md border
                ${card.isFlipped || card.isMatched
                  ? 'bg-card border-primary/30'
                  : 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-primary/50'}
                ${card.isMatched ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''}`}>
                <AnimatePresence mode="wait">
                  {(card.isFlipped || card.isMatched) ? (
                    <motion.span key="emoji" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.2 }}>
                      {card.symbol}
                    </motion.span>
                  ) : (
                    <motion.div key="back" className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <span className="text-primary-foreground/60 text-base">?</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={resetGame} variant="outline" size="lg" className="rounded-full gap-2"><RefreshCw className="w-4 h-4" />New Game</Button>
        </div>
      </div>
    </PageLayout>
  );
};

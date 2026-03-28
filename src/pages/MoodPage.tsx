import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { Music, Heart, Sparkles, Send, Mic, MicOff, MessageCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimitHandler } from "@/hooks/useRateLimitHandler";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { motion, AnimatePresence } from "framer-motion";
import { Song, getMoodBasedSongs } from "@/utils/songLibrary";
import { detectMood } from "@/utils/moodDetection";
import { generateAIResponse } from "@/utils/moodResponses";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { MoodCoachChallenge } from "@/components/gamification/MoodCoachChallenge";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { toast as sonnerToast } from "sonner";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";

interface MoodEntry {
  mood: string;
  note: string;
  timestamp: Date;
  aiResponse?: string;
  songSuggestions?: Song[];
}

export const MoodPage = () => {
  const [userInput, setUserInput] = useState("");
  const [detectedMood, setDetectedMood] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [songSuggestions, setSongSuggestions] = useState<Song[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [moodConfidence, setMoodConfidence] = useState(0);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const { toast } = useToast();
  const { handleApiError } = useRateLimitHandler({ featureName: 'Mood Detection' });
  const { getItem, setItem } = useUserStorage();

  const { addXP, levelUpData, clearLevelUp } = usePlayerProgress();
  const { completeQuest } = useDailyQuests();

  const { isRecording: voiceIsRecording, startRecording, stopRecording } = useVoiceRecognition((transcribedText) => {
    setUserInput(prev => prev + (prev ? ' ' : '') + transcribedText);
    toast({ title: "Voice captured! 🎤", description: "Your voice has been converted to text." });
  });

  const handleAnalyzeInput = async () => {
    if (!userInput.trim()) {
      toast({ title: "Please share something", description: "Tell me what's on your mind so I can understand how you're feeling.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setShowResponse(false);
    setIsUsingAI(false);
    let finalMood = 'calm', finalResponse = '', finalSongs: Song[] = [], finalConfidence = 70, usedAI = false;

    try {
      const { data, error } = await supabase.functions.invoke('mood-detection', { body: { text: userInput, context: 'mood check-in' } });
      if (!error && data?.mood) {
        finalMood = data.mood;
        finalConfidence = data.confidence || 85;
        finalResponse = data.supportive_message || generateAIResponse(data.mood, userInput);
        usedAI = !data.fallback;
        if (data.song_suggestions?.length > 0) {
          finalSongs = data.song_suggestions.map((song: any) => ({
            title: song.title || 'Unknown', artist: song.artist || 'Unknown Artist', mood: finalMood, genre: song.genre || 'Music',
            youtubeUrl: song.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent((song.title || '') + ' ' + (song.artist || ''))}`
          }));
        }
        if (finalSongs.length === 0) finalSongs = getMoodBasedSongs(finalMood);
        toast({ title: usedAI ? "AI mood detection complete! 🧠" : "Mood detected! 🌿", description: `I'm ${finalConfidence}% confident you're feeling ${finalMood}` });
      } else throw new Error('AI detection failed');
    } catch (err: any) {
      const handled = handleApiError(err);
      if (!handled) {
        finalMood = detectMood(userInput);
        finalResponse = generateAIResponse(finalMood, userInput);
        finalSongs = getMoodBasedSongs(finalMood);
        finalConfidence = 70;
        toast({ title: "Mood detected locally! 🌱", description: `I sense you're feeling ${finalMood}. Using backup detection.` });
      } else {
        finalMood = detectMood(userInput);
        finalResponse = generateAIResponse(finalMood, userInput);
        finalSongs = getMoodBasedSongs(finalMood);
        finalConfidence = 70;
      }
    }

    setDetectedMood(finalMood); setAiResponse(finalResponse); setSongSuggestions(finalSongs);
    setMoodConfidence(finalConfidence); setIsUsingAI(usedAI);

    const moodEntry: MoodEntry = { mood: finalMood, note: userInput, timestamp: new Date(), aiResponse: finalResponse, songSuggestions: finalSongs };
    const existingEntries = getItem<MoodEntry[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
    existingEntries.push(moodEntry);
    setItem(STORAGE_KEYS.MOOD_ENTRIES, existingEntries);
    const existingStats = getItem<any>(STORAGE_KEYS.GARDEN_STATS, {});
    setItem(STORAGE_KEYS.GARDEN_STATS, { ...existingStats, moodEntries: (existingStats.moodEntries || 0) + 1, totalActions: (existingStats.totalActions || 0) + 1 });

    // Gamification: Award XP and complete quest
    addXP('mood');
    const quest = completeQuest('mood');
    if (quest) {
      sonnerToast.success(`✅ Quest Complete: ${quest.title}`, { description: `+${quest.xpReward} XP earned!` });
      addXP('quest', quest.xpReward);
    }

    setIsAnalyzing(false); setShowResponse(true);
  };

  const handleNewEntry = () => { setUserInput(""); setDetectedMood(""); setAiResponse(""); setSongSuggestions([]); setShowResponse(false); setMoodConfidence(0); setIsUsingAI(false); };
  const handleVoiceToggle = () => { voiceIsRecording ? stopRecording() : startRecording(); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyzeInput(); } };

  const quickTopics: string[] = [];

  return (
    <PageLayout>
      <main className="pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Level Up Modal */}
          {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}

          <AnimatePresence mode="wait">
            {!showResponse ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }} className="w-40 h-40 sm:w-52 sm:h-52">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]" src="/videos/mood-mascot.mp4" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="text-center space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">I'm <span className="text-primary">Calmora</span>, your daily</h1>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">AI Mental Health Companion</h2>
                  <p className="text-muted-foreground text-sm sm:text-base mt-2">With me, you're safe, heard, and never judged.</p>
                  <Badge variant="outline" className="text-[10px] rounded-full gap-1 border-primary/30 text-primary mt-2">
                    <Zap className="w-2.5 h-2.5" /> Earn +15 XP per mood check-in
                  </Badge>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="w-full max-w-2xl flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 relative flex items-center bg-muted/60 backdrop-blur-sm rounded-full border border-border/60 px-4 py-2.5 focus-within:border-primary/60 transition-colors">
                    <Sparkles className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                    <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm sm:text-base outline-none" />
                    <Button onClick={handleVoiceToggle} variant="ghost" size="icon" className={`rounded-full flex-shrink-0 h-8 w-8 ${voiceIsRecording ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}>
                      {voiceIsRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button onClick={handleAnalyzeInput} size="icon" className="rounded-full h-11 w-11 flex-shrink-0" disabled={isAnalyzing || !userInput.trim()}>
                    {isAnalyzing ? <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Send className="w-4 h-4" />}
                  </Button>
                </motion.div>

                {voiceIsRecording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-destructive">
                    <div className="animate-pulse w-2.5 h-2.5 bg-destructive rounded-full" />
                    <span className="text-sm">Listening...</span>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }} className="text-center space-y-4 w-full max-w-2xl">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {quickTopics.map((topic, i) => (
                      <Button key={i} variant="outline" size="sm" className="rounded-full text-xs backdrop-blur-sm" onClick={() => setUserInput(topic)}>{topic}</Button>
                    ))}
                  </div>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }} className="text-xs text-muted-foreground text-center mt-6 max-w-lg">
                  ⓘ Disclaimer: Calmora offers support, not medical care. Always consult a professional.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div key="response" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="space-y-6">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  <Card className="p-5 border border-primary/30 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">I sense you're feeling:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] rounded-full gap-1 text-primary border-primary/30">
                          <Zap className="w-2.5 h-2.5" />+15 XP
                        </Badge>
                        <span className="text-xs text-muted-foreground">{moodConfidence}% confident</span>
                      </div>
                    </div>
                    <Badge className="text-base py-1.5 px-4 capitalize">{detectedMood}</Badge>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
                  <Card className="p-6 border border-border">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Calmora says:</h3>
                        <p className="text-foreground leading-relaxed">{aiResponse}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* AI Mood Coach Challenge */}
                <MoodCoachChallenge mood={detectedMood} />

                {songSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <Card className="p-5 sm:p-6 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Music className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Songs to lift your mood 🎶</h3>
                      </div>
                      <div className="grid gap-2.5">
                        {songSuggestions.map((song, i) => (
                          <a key={i} href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Music className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-foreground truncate">{song.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{song.artist} · {song.genre}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] flex-shrink-0 rounded-full">▶ Play</Badge>
                          </a>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-3 text-center">🎵 Curated for Indian listeners · Tap any song to play on YouTube</p>
                    </Card>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button onClick={handleNewEntry} variant="outline" size="lg">Share Something New</Button>
                  <Button onClick={() => { window.location.href = `/chat?mood=${detectedMood}&message=${encodeURIComponent(userInput)}`; }} variant="default" size="lg" className="gap-2">
                    <MessageCircle className="w-4 h-4" /> Continue Talk with Mindo
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </PageLayout>
  );
};

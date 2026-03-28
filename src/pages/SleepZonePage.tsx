import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Moon, Play, Pause, RotateCcw, Timer, Waves, Wind, Cloud, Leaf, Music, ExternalLink, Stars, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";

interface SleepSession { id: string; durationMinutes: number; startedAt: number; endedAt?: number; }
interface Soundscape { id: string; name: string; icon: React.ReactNode; audioUrl: string; gradient: string; activeGradient: string; }
interface MusicRecommendation { title: string; artist: string; spotifyUrl?: string; youtubeUrl?: string; mood: string; }

const soundscapes: Soundscape[] = [
  { id: "rain", name: "Gentle Rain", icon: <Cloud className="w-5 h-5" />, audioUrl: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3", gradient: "from-sky-500/10 to-blue-500/10", activeGradient: "from-sky-500/25 to-blue-500/25" },
  { id: "waves", name: "Ocean Waves", icon: <Waves className="w-5 h-5" />, audioUrl: "https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3", gradient: "from-cyan-500/10 to-teal-500/10", activeGradient: "from-cyan-500/25 to-teal-500/25" },
  { id: "wind", name: "Forest Wind", icon: <Wind className="w-5 h-5" />, audioUrl: "https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3", gradient: "from-emerald-500/10 to-green-500/10", activeGradient: "from-emerald-500/25 to-green-500/25" },
  { id: "nature", name: "Night Nature", icon: <Leaf className="w-5 h-5" />, audioUrl: "https://assets.mixkit.co/active_storage/sfx/2497/2497-preview.mp3", gradient: "from-lime-500/10 to-emerald-500/10", activeGradient: "from-lime-500/25 to-emerald-500/25" },
];

const musicRecommendations: MusicRecommendation[] = [
  { title: "Weightless", artist: "Marconi Union", spotifyUrl: "https://open.spotify.com/track/6kkwzB6hXLIONkEk9JciA6", youtubeUrl: "https://www.youtube.com/results?search_query=Marconi+Union+Weightless+official", mood: "Deep relaxation, proven to reduce anxiety" },
  { title: "Clair de Lune", artist: "Debussy", spotifyUrl: "https://open.spotify.com/track/1DjJjUGuDLj6nOWl8dTKoz", youtubeUrl: "https://www.youtube.com/results?search_query=Debussy+Clair+de+Lune+piano", mood: "Classical piano for peaceful sleep" },
  { title: "Raag Bhairavi Flute", artist: "Pandit Hariprasad Chaurasia", youtubeUrl: "https://www.youtube.com/results?search_query=Hariprasad+Chaurasia+Raag+Bhairavi+flute", mood: "Indian classical for meditation" },
  { title: "Om Namah Shivaya", artist: "Sounds of Isha", youtubeUrl: "https://www.youtube.com/results?search_query=Sounds+of+Isha+Om+Namah+Shivaya", mood: "Spiritual chanting for inner peace" },
  { title: "528Hz Sleep Music", artist: "Healing Frequencies", youtubeUrl: "https://www.youtube.com/results?search_query=528Hz+deep+sleep+music+8+hours", mood: "Healing frequency for deep sleep" },
];

export const SleepZonePage = () => {
  useSEO("Sleep Zone | Calmora", "Wind down with a gentle sleep timer and soothing ambient sounds.", "/sleep");

  const [duration, setDuration] = useState(30);
  const [remaining, setRemaining] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef<SleepSession | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(25);

  useEffect(() => { setRemaining(duration * 60); }, [duration]);
  useEffect(() => { return () => { if (timerRef.current) window.clearInterval(timerRef.current); stopAllAudio(); }; }, []);
  useEffect(() => { Object.values(audioRefs.current).forEach((a) => { if (a) a.volume = volume / 100; }); }, [volume]);

  const start = () => {
    if (running) return;
    setRunning(true);
    if (!sessionRef.current) sessionRef.current = { id: crypto.randomUUID(), durationMinutes: duration, startedAt: Date.now() };
    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => { if (prev <= 1) { stop(); completeSession(); return 0; } return prev - 1; });
    }, 1000);
  };
  const pause = () => { if (timerRef.current) window.clearInterval(timerRef.current); timerRef.current = null; setRunning(false); };
  const stop = () => pause();
  const reset = () => { pause(); setRemaining(duration * 60); sessionRef.current = null; };

  const completeSession = () => {
    if (!sessionRef.current) return;
    sessionRef.current.endedAt = Date.now();
    const existing: SleepSession[] = JSON.parse(localStorage.getItem("sleepSessions") || "[]");
    existing.push(sessionRef.current);
    localStorage.setItem("sleepSessions", JSON.stringify(existing));
    sessionRef.current = null;
    stopAllAudio();
  };

  const toggleSound = (soundId: string, audioUrl: string) => {
    if (activeSounds.has(soundId)) {
      const audio = audioRefs.current[soundId];
      if (audio) { audio.pause(); audio.currentTime = 0; }
      setActiveSounds((prev) => { const next = new Set(prev); next.delete(soundId); return next; });
    } else {
      let audio = audioRefs.current[soundId];
      if (!audio) { audio = new Audio(audioUrl); audio.loop = true; audio.volume = volume / 100; audioRefs.current[soundId] = audio; }
      audio.play().catch(console.error);
      setActiveSounds((prev) => new Set(prev).add(soundId));
    }
  };

  const stopAllAudio = () => { Object.values(audioRefs.current).forEach((a) => { if (a) { a.pause(); a.currentTime = 0; } }); setActiveSounds(new Set()); };

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = Math.floor(remaining % 60).toString().padStart(2, "0");
  const progress = duration > 0 ? ((duration * 60 - remaining) / (duration * 60)) * 100 : 0;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <motion.header className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-feature-sleep/10 border border-feature-sleep/20 mb-4">
            <Moon className="w-4 h-4 text-feature-sleep" />
            <span className="text-xs font-medium text-feature-sleep">Sleep & Relaxation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-soul">Sleep Zone</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Wind down with soothing sounds and a gentle timer</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Timer Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-20">
                <Stars className="w-16 h-16 text-feature-sleep" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-feature-sleep/10 flex items-center justify-center">
                    <Timer className="w-4 h-4 text-feature-sleep" />
                  </div>
                  <h2 className="font-semibold text-sm">Sleep Timer</h2>
                </div>

                <div className="flex justify-center mb-5">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" opacity="0.3" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray={`${progress * 3.267} 326.7`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-mono text-foreground">{mm}:{ss}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">{duration} min session</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[15, 30, 45, 60].map((d) => (
                    <Button key={d} variant={duration === d ? "default" : "outline"} size="sm" className="text-xs rounded-full" onClick={() => { setDuration(d); setRemaining(d * 60); }}>{d}m</Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {running ? (
                    <Button onClick={pause} className="flex-1 rounded-full gap-2"><Pause className="w-4 h-4" /> Pause</Button>
                  ) : (
                    <Button onClick={start} className="flex-1 rounded-full gap-2 shadow-lg"><Play className="w-4 h-4" /> Start</Button>
                  )}
                  <Button variant="outline" size="icon" onClick={reset} className="rounded-full h-10 w-10"><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Ambience Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold text-sm">Sleep Ambience</h2>
                {activeSounds.size > 0 && <Badge variant="secondary" className="text-[10px] ml-auto">{activeSounds.size} active</Badge>}
              </div>

              <div className="space-y-2.5 mb-5">
                {soundscapes.map((sound) => {
                  const isPlaying = activeSounds.has(sound.id);
                  return (
                    <motion.button key={sound.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => toggleSound(sound.id, sound.audioUrl)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${isPlaying ? `bg-gradient-to-r ${sound.activeGradient} border-primary/30 shadow-sm` : 'bg-muted/20 border-transparent hover:bg-muted/40'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>{sound.icon}</div>
                        <span className="text-sm font-medium text-foreground">{sound.name}</span>
                      </div>
                      <Badge variant={isPlaying ? "default" : "outline"} className="text-[10px] rounded-full">{isPlaying ? "Playing" : "Play"}</Badge>
                    </motion.button>
                  );
                })}
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="text-xs font-medium text-foreground">{volume}%</span>
                </div>
                <Slider value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} className="touch-pan-y" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Music Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mt-6 p-5 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-feature-chat/10 flex items-center justify-center">
                <Music className="w-4 h-4 text-feature-chat" />
              </div>
              <h2 className="font-semibold text-sm">Recommended Sleep Music</h2>
            </div>
            <div className="grid gap-2.5">
              {musicRecommendations.map((music, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-feature-chat/10 flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-feature-chat" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground truncate">{music.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{music.artist}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {music.spotifyUrl && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild><a href={music.spotifyUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a></Button>}
                      {music.youtubeUrl && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild><a href={music.youtubeUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a></Button>}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 ml-12 line-clamp-2">{music.mood}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">Tip: Combine ambient sounds with soft music for the best sleep experience 💤</p>
          </Card>
        </motion.div>

        <Card className="mt-6 p-4 bg-status-warning/5 border-status-warning/20">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <h3 className="font-semibold text-xs mb-1 text-foreground">Wellness-Based Sleep Insights</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Yeh ek wellness tool hai, medical sleep tracker nahi. Agar aapko neend se related koi health issue hai, toh doctor se zaroor milein.</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SleepZonePage;

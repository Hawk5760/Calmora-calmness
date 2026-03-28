import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRateLimitHandler } from "@/hooks/useRateLimitHandler";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import mindoMascotBlue from "@/assets/mindo-mascot-blue.png";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  mood?: string;
  timestamp: number;
}

const useSEO = (title: string, description: string, canonicalPath = "/chat") => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + canonicalPath;
  }, [title, description, canonicalPath]);
};

const detectMood = (text: string): string => {
  const t = text.toLowerCase();
  const lists: Record<string, string[]> = {
    happy: ["happy","joyful","excited","cheerful","grateful","fulfilled","energetic","inspired","positive","motivated","bubbly","playful","amazing","great","wonderful","fantastic","awesome","good","love","proud","blessed","smile","delighted","thrilled","overjoyed"],
    sad: ["sad","low","lonely","downhearted","drained","empty","helpless","disappointed","crying","numb","isolated","homesick","failed","fail","depressed","miss","missing","heartbroken","hurt","pain","lost","broken","miserable","hopeless","unhappy","upset","down","blue","tears","grief","sorrow"],
    angry: ["angry","irritated","frustrated","tense","annoyed","furious","rage","fed up","resentful","hostile","mad","hate","pissed","disgusted","sick of","done with"],
    anxious: ["anxious","worried","nervous","stressed","overwhelmed","panic","scared","fearful","uneasy","restless","overthinking","pressure","tension","afraid"],
    calm: ["calm","peaceful","mindful","balanced","grounded","relaxed","serene","tranquil","content","mellow","centered","still","quiet","zen","easy"],
    motivated: ["motivated","determined","focused","driven","ambitious","pumped","ready","confident","empowered","strong","unstoppable","brave","bold"]
  };
  const scores: Record<string, number> = {};
  Object.keys(lists).forEach(k => scores[k] = 0);
  
  // Check for phrases first (higher weight)
  const phrases: Record<string, string[]> = {
    happy: ["feeling great","so happy","really good","amazing day","love life","best feeling","feeling blessed"],
    sad: ["feeling down","want to cry","feel empty","nobody cares","giving up","feel alone","so tired","feel like a failure","not good enough"],
    angry: ["so angry","fed up","had enough","driving me crazy","can't take it","makes me furious"],
    anxious: ["so stressed","can't stop thinking","really worried","freaking out","losing my mind","so overwhelmed"],
    calm: ["feeling calm","at peace","really relaxed","feeling balanced","inner peace","going with flow"],
    motivated: ["let's do this","ready to go","feeling strong","can do anything","bring it on","full of energy"]
  };
  
  Object.entries(phrases).forEach(([mood, ps]) => {
    ps.forEach(p => { if (t.includes(p)) scores[mood] += 3; });
  });
  
  Object.entries(lists).forEach(([mood, kws]) => {
    kws.forEach(k => { if (t.includes(k)) scores[mood] += 1; });
  });
  
  const top = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
  return top[1] > 0 ? top[0] : "neutral";
};

const respondForMood = (mood: string, userText: string): string => {
  const map: Record<string, string[]> = {
    happy: ["Your joy is shining through! Keep savoring this beautiful energy.","Love that! What made you feel this happy today?"],
    sad: ["I'm here with you. Your feelings are valid—be gentle with yourself.","That sounds heavy. Want a tiny step we can take right now to feel a bit better?"],
    angry: ["I hear the intensity. Let's take one deep breath together—in 4, hold 4, out 6.","It's okay to feel angry. Do you want to vent more or find a way to release it?"],
    anxious: ["I can sense the weight you're carrying. Let's breathe together—in 4, hold 4, out 6.","Your mind might be racing, but you're safe right here. What's on your mind?"],
    motivated: ["I can feel your determination! Channel this amazing energy into something great.","You're on fire! What's driving this awesome motivation today?"],
    calm: ["Lovely grounded energy. Maybe try a mindful minute to deepen it?","Staying present suits you. What would make this calm last a bit longer?"],
    neutral: ["I'm here for you. How are you feeling right now?","Tell me more about what's going on. I'm all ears."]
  };
  const arr = map[mood] || map.neutral;
  return arr[Math.floor(Math.random() * arr.length)];
};

const storageKey = "aiBuddyChat";

const quickStarters = [
  "I feel overwhelmed today",
  "I need motivation",
  "Help me calm down",
  "I want to talk about my day",
];

export const AIBuddyPage = () => {
  useSEO("Mindo | Calmora", "Chat with Mindo, your gentle AI companion for support, reflection, and mindfulness.");
  const { toast } = useToast();
  const { handleApiError } = useRateLimitHandler({ featureName: 'Mindo AI' });
  const [searchParams, setSearchParams] = useSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const initializedFromParams = useRef(false);

  // Read mood & message from URL params (from Mood Detector redirect)
  useEffect(() => {
    if (initializedFromParams.current) return;
    const mood = searchParams.get("mood");
    const message = searchParams.get("message");
    if (mood && message) {
      initializedFromParams.current = true;
      setSearchParams({}, { replace: true });
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: decodeURIComponent(message), timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      const saved = localStorage.getItem(storageKey);
      const existingMessages: ChatMessage[] = saved ? JSON.parse(saved) : [];
      const history = existingMessages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      const contextMessage = `The user was redirected from the Mood Detector. Their detected mood is "${mood}". Continue the conversation with empathy and context about their mood. Here's what they shared: ${decodeURIComponent(message)}`;
      supabase.functions.invoke('gemini-chat', { body: { message: contextMessage, mood, history } }).then(({ data, error }) => {
        const aiResponse = (!error && data?.response) ? data.response : respondForMood(mood, decodeURIComponent(message));
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "ai", text: aiResponse, mood, timestamp: Date.now() }]);
        setIsLoading(false);
      }).catch(() => {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "ai", text: respondForMood(mood, decodeURIComponent(message)), mood, timestamp: Date.now() }]);
        setIsLoading(false);
      });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed, timestamp: Date.now() };
    const mood = detectMood(trimmed);
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    const history = messages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', { body: { message: trimmed, mood, history } });
      if (error) throw error;
      const aiResponse = data?.response || respondForMood(mood, trimmed);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "ai", text: aiResponse, mood, timestamp: Date.now() }]);
      if (data?.fallback) toast({ title: "Using fallback response", description: "Gemini API unavailable, using local responses.", variant: "default" });
    } catch (error: any) {
      console.error('AI chat error:', error);
      const handled = handleApiError(error, () => {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "ai", text: respondForMood(mood, trimmed), mood, timestamp: Date.now() }]);
      });
      if (!handled) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "ai", text: respondForMood(mood, trimmed), mood, timestamp: Date.now() }]);
        toast({ title: "Connection issue", description: "Using local AI responses. Your chat continues!", variant: "default" });
      }
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={mindoMascotBlue} alt="Mindo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mindo</h1>
          </div>
          <p className="text-sm text-muted-foreground">Your emotional companion — gentle guidance aur supportive chat ke liye</p>
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-lg mx-auto">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ <strong>Important:</strong> Mindo ek support companion hai, therapist nahi. Professional help ke liye mental health expert se baat karein.
            </p>
          </div>
        </header>

        {/* Chat Area */}
        <Card className="bg-card/60 backdrop-blur-sm border border-border/50 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-foreground">Mindo is online</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{messages.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs text-muted-foreground hover:text-destructive h-7 px-2">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="h-[380px] sm:h-[420px] overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                <motion.img
                  src={mindoMascotBlue}
                  alt="Mindo"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">Hey! I'm Mindo 👋</p>
                  <p className="text-sm text-muted-foreground">Share what's on your mind, or pick a starter below.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {quickStarters.map((s, i) => (
                    <Button key={i} variant="outline" size="sm" className="rounded-full text-xs" onClick={() => { setInput(s); }}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI avatar */}
                  {m.role === 'ai' && (
                    <img src={mindoMascotBlue} alt="Mindo" className="w-8 h-8 rounded-full object-contain bg-muted/60 p-0.5 flex-shrink-0 mt-1" />
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted/50 text-foreground rounded-bl-md border border-border/40'
                  }`}>
                    {m.mood && m.role === 'ai' && (
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Mood: {m.mood}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                  {/* User avatar */}
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-primary">
                      You
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2.5 items-end"
              >
                <img src={mindoMascotBlue} alt="Mindo" className="w-8 h-8 rounded-full object-contain bg-muted/60 p-0.5" />
                <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 border border-border/40">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border/50 bg-background/50">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }}}
                placeholder="Share what's on your mind..."
                rows={1}
                className="flex-1 resize-none bg-muted/40 rounded-xl border border-border/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors min-h-[40px] max-h-[120px]"
              />
              <Button
                onClick={() => send(input)}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-xl h-10 w-10 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AIBuddyPage;

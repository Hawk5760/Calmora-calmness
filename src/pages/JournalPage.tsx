import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Star, Lightbulb, Sunset, Coffee, Sparkles, Loader2, PenLine, Calendar, Search, ChevronDown, ChevronUp, Trash2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { SmartJournalPrompts } from "@/components/gamification/SmartJournalPrompts";
import { toast as sonnerToast } from "sonner";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  prompt: string;
  tags: string[];
  timestamp: Date;
}

export const JournalPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [aiReflection, setAiReflection] = useState<{
    reflection: string;
    summary: string;
    followUpQuestion: string;
  } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const { toast } = useToast();
  const { addXP, levelUpData, clearLevelUp } = usePlayerProgress();
  const { completeQuest } = useDailyQuests();
  const { getItem, setItem } = useUserStorage();

  // Load past entries
  useEffect(() => {
    const entries = getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
    setPastEntries(entries.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));
  }, [getItem]);

  const journalPrompts = [
    { id: "gratitude", icon: Heart, title: "Gratitude", prompt: "What are three things you're grateful for today, and why do they matter to you?", emoji: "🙏" },
    { id: "reflection", icon: Star, title: "Reflection", prompt: "What was the highlight of your day? What would you do differently?", emoji: "✨" },
    { id: "growth", icon: Lightbulb, title: "Growth", prompt: "What did you learn about yourself today? How did you grow as a person?", emoji: "🌱" },
    { id: "dreams", icon: Sunset, title: "Dreams", prompt: "What dreams are calling to your heart? What steps can you take toward them?", emoji: "🌅" },
    { id: "present", icon: Coffee, title: "Present", prompt: "Describe this moment in detail. What do you see, hear, feel, and sense around you?", emoji: "☕" },
  ];

  const predefinedTags = ["gratitude", "reflection", "growth", "healing", "joy", "anxiety", "love", "peace"];

  const handlePromptSelect = (prompt: any) => {
    setSelectedPrompt(prompt.id);
    setTitle(prompt.title + " - " + new Date().toLocaleDateString());
    setContent(`${prompt.prompt}\n\n`);
  };

  const addTag = (tag: string) => {
    if (tag && !customTags.includes(tag)) {
      setCustomTags([...customTags, tag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Please fill in all fields", description: "Add a title and some content to save your journal entry.", variant: "destructive" });
      return;
    }

    const entry: JournalEntry = { id: Date.now().toString(), title: title.trim(), content: content.trim(), prompt: selectedPrompt, tags: customTags, timestamp: new Date() };
    const existingEntries = getItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
    existingEntries.unshift(entry);
    setItem(STORAGE_KEYS.JOURNAL_ENTRIES, existingEntries);
    setPastEntries(existingEntries.map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })));

    const existingStats = getItem<any>(STORAGE_KEYS.GARDEN_STATS, {});
    const newStats = { ...existingStats, journalEntries: (existingStats.journalEntries || 0) + 1, totalActions: (existingStats.totalActions || 0) + 1 };
    setItem(STORAGE_KEYS.GARDEN_STATS, newStats);

    // Gamification: Award XP and complete quest
    addXP('journal');
    const quest = completeQuest('journal');
    if (quest) {
      sonnerToast.success(`✅ Quest Complete: ${quest.title}`, { description: `+${quest.xpReward} XP earned!` });
      addXP('quest', quest.xpReward);
    }

    toast({ title: "Journal entry saved! 📖", description: "Your thoughts are now part of your soul garden's growth." });

    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('journal-reflection', {
        body: { content: content.trim(), title: title.trim() }
      });

      let responseData: any = data;
      if (error) {
        if (error.message?.includes('429')) toast({ title: "AI is throttled", description: "Rate limit reached." });
      }

      if (responseData) {
        const payload = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        setAiReflection({
          reflection: payload.reflection || "Thank you for sharing. Your entry reflects care and honesty.",
          summary: payload.summary || "Entry captured.",
          followUpQuestion: payload.followUpQuestion || "What felt most important as you wrote this?"
        });
        toast({ title: "AI reflection ready", description: "Scroll down to view your insights." });
      } else {
        setAiReflection({
          reflection: "Thank you for sharing from the heart. Your words show courage and care—take a breath and honor that.",
          summary: "Entry received.",
          followUpQuestion: "What small kindness can you offer yourself next?"
        });
      }
    } catch {
      toast({ title: "Note", description: "Your entry was saved, but AI reflection is temporarily unavailable.", variant: "default" });
    } finally {
      setIsLoadingAI(false);
    }

    setTitle("");
    setContent("");
    setSelectedPrompt("");
    setCustomTags([]);
  };

  const deleteEntry = (id: string) => {
    const updated = pastEntries.filter(e => e.id !== id);
    setPastEntries(updated);
    setItem(STORAGE_KEYS.JOURNAL_ENTRIES, updated);
    toast({ title: "Entry deleted" });
  };

  // Filter and search past entries
  const filteredEntries = pastEntries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || entry.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags from past entries
  const allTags = [...new Set(pastEntries.flatMap(e => e.tags || []))];

  const selectedPromptData = journalPrompts.find(p => p.id === selectedPrompt);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <PageLayout>
      {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            <Calendar className="w-4 h-4" />
            {today}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 text-gradient-soul">
            Guided Journaling
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Explore your inner world through mindful writing
          </p>
        </motion.div>

        {/* Past Entries Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => setShowPastEntries(!showPastEntries)}
            className="rounded-full gap-2 mb-4"
          >
            <BookOpen className="w-4 h-4" />
            Past Entries ({pastEntries.length})
            {showPastEntries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          <AnimatePresence>
            {showPastEntries && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50 mb-6">
                  {/* Search & Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-full bg-muted/30 border-border/50"
                      />
                    </div>
                    {allTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant={filterTag === null ? "default" : "outline"}
                          className="cursor-pointer text-xs rounded-full"
                          onClick={() => setFilterTag(null)}
                        >
                          All
                        </Badge>
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={filterTag === tag ? "default" : "outline"}
                            className="cursor-pointer text-xs rounded-full"
                            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Entries List */}
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                    {filteredEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {searchQuery || filterTag ? "No entries match your search" : "No journal entries yet"}
                        </p>
                      </div>
                    ) : (
                      filteredEntries.map((entry) => (
                        <div key={entry.id} className="p-3.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-foreground truncate">{entry.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{entry.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                                {entry.tags?.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Smart AI Prompts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <SmartJournalPrompts onSelectPrompt={(prompt) => {
            setTitle("AI Prompt - " + new Date().toLocaleDateString());
            setContent(prompt + "\n\n");
          }} />
        </motion.div>

        {/* Prompt Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            Choose a prompt or write freely
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {journalPrompts.map((prompt) => {
              const isSelected = selectedPrompt === prompt.id;
              return (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptSelect(prompt)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all min-h-[44px] ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "bg-card/80 border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-foreground"
                  }`}
                >
                  <span>{prompt.emoji}</span>
                  {prompt.title}
                </button>
              );
            })}
            <button
              onClick={() => { setSelectedPrompt(""); setTitle("Free Writing - " + new Date().toLocaleDateString()); setContent(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all min-h-[44px] ${
                selectedPrompt === ""
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card/80 border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-foreground"
              }`}
            >
              ✍️ Free Write
            </button>
          </div>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-5 sm:p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-soft">
            {selectedPromptData && (
              <div className="mb-5 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-foreground/80 italic">"{selectedPromptData.prompt}"</p>
              </div>
            )}

            <div className="space-y-5">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="bg-transparent border-0 border-b border-border/30 rounded-none text-lg font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary/50 px-0"
              />

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts flow freely..."
                className="bg-transparent border-0 rounded-none text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 min-h-[200px] sm:min-h-[280px] px-0 resize-none"
                rows={10}
              />

              {/* Tags */}
              <div className="pt-2 border-t border-border/20">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {predefinedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={customTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105 text-xs rounded-full min-h-[32px] px-3"
                      onClick={() => customTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Custom tag..."
                    className="bg-muted/30 border-border/30 text-sm h-8 rounded-full px-3"
                    onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(newTag); } }}
                  />
                  <Button onClick={() => addTag(newTag)} variant="outline" size="sm" className="rounded-full h-8 text-xs min-w-[60px]">
                    Add
                  </Button>
                </div>
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer text-xs rounded-full" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleSaveEntry} className="w-full h-12 rounded-full text-base font-medium min-h-[48px]" disabled={isLoadingAI}>
                {isLoadingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Getting AI reflection...</> : "Save & Reflect 📖"}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* AI Reflection */}
        <AnimatePresence>
          {aiReflection && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-glow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Reflection</h3>
                    <p className="text-foreground/90 leading-relaxed">{aiReflection.reflection}</p>
                  </div>
                </div>
                {aiReflection.summary && (
                  <div className="mb-3 p-3 bg-background/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Summary:</p>
                    <p className="text-sm text-foreground/80">{aiReflection.summary}</p>
                  </div>
                )}
                {aiReflection.followUpQuestion && (
                  <div className="p-3 bg-background/50 rounded-lg border-l-4 border-primary/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">For next time:</p>
                    <p className="text-sm text-foreground/80 italic">{aiReflection.followUpQuestion}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
};

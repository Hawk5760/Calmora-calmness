import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";

interface MoodEntry {
  mood: string;
  note: string;
  timestamp: Date;
}

export const MoodCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const { getItem, setItem } = useUserStorage();

  const moods = [
    { id: "great", icon: Star, label: "Amazing", color: "text-yellow-500" },
    { id: "good", icon: Smile, label: "Good", color: "text-green-500" },
    { id: "okay", icon: Meh, label: "Okay", color: "text-blue-500" },
    { id: "sad", icon: Frown, label: "Sad", color: "text-purple-500" },
    { id: "anxious", icon: Heart, label: "Anxious", color: "text-pink-500" },
  ];

  const handleMoodSubmit = () => {
    console.log("Mood submit clicked", { selectedMood, note });
    
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today to continue.",
        variant: "destructive",
      });
      return;
    }

    const moodEntry: MoodEntry = {
      mood: selectedMood,
      note,
      timestamp: new Date(),
    };

    // Store mood entry user-scoped
    const existingEntries = getItem<MoodEntry[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
    existingEntries.push(moodEntry);
    setItem(STORAGE_KEYS.MOOD_ENTRIES, existingEntries);

    toast({
      title: "Mood logged! 🌱",
      description: "Your soul garden appreciates your mindfulness.",
    });

    // Reset form
    setSelectedMood("");
    setNote("");
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-soft">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-foreground">
          How are you feeling today?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Check in with yourself and let your soul garden know how you're doing.
        </p>
      </div>

      {/* Mood Selection - Responsive grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
        {moods.map((mood) => {
          const Icon = mood.icon;
          return (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-gentle hover:scale-105 ${
                selectedMood === mood.id
                  ? "bg-primary/20 shadow-glow"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-1 sm:mb-2 ${mood.color}`} />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground truncate w-full text-center">
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Note Section */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">
          What's on your mind? (Optional)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Share what you're feeling or what happened today..."
          className="bg-background/50 border-border/50 focus:border-primary transition-gentle text-sm sm:text-base"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleMoodSubmit}
        variant="soul" 
        size="lg" 
        className="w-full h-11 sm:h-12 text-sm sm:text-base"
      >
        Log My Mood 🌱
      </Button>
    </Card>
  );
};
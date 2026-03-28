import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Heart, Star, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

const affirmations = [
  { text: "I am worthy of love, happiness, and all good things in life.", category: "Self-Love", icon: Heart },
  { text: "I trust in my ability to overcome challenges and grow stronger.", category: "Resilience", icon: Star },
  { text: "Today is filled with possibilities and I embrace them with an open heart.", category: "Optimism", icon: Sun },
  { text: "I am calm, peaceful, and in control of my thoughts and emotions.", category: "Inner Peace", icon: Sparkles },
  { text: "Every breath I take fills me with confidence and clarity.", category: "Confidence", icon: Star },
  { text: "I choose to see the beauty and goodness in myself and others.", category: "Gratitude", icon: Heart },
  { text: "I am exactly where I need to be on my journey of growth.", category: "Acceptance", icon: Sun },
  { text: "My mind is clear, my heart is open, and my spirit is strong.", category: "Mindfulness", icon: Sparkles },
];

export const AffirmationsPage = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [savedAffirmations, setSavedAffirmations] = useState<typeof affirmations>([]);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    const saved = localStorage.getItem('savedAffirmations');
    if (saved) setSavedAffirmations(JSON.parse(saved));
  }, []);

  const getNewAffirmation = () => {
    setCurrentAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
  };

  const saveAffirmation = () => {
    const updated = [...savedAffirmations, currentAffirmation];
    setSavedAffirmations(updated);
    localStorage.setItem('savedAffirmations', JSON.stringify(updated));
    toast({ title: "Affirmation saved!", description: "Added to your collection for later reflection." });
  };

  const removeSavedAffirmation = (index: number) => {
    const updated = savedAffirmations.filter((_, i) => i !== index);
    setSavedAffirmations(updated);
    localStorage.setItem('savedAffirmations', JSON.stringify(updated));
  };

  const IconComponent = currentAffirmation.icon;
  const isSaved = savedAffirmations.some(a => a.text === currentAffirmation.text);

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          icon={<Sparkles className="w-4 h-4 text-primary" />}
          badge="Daily Affirmations"
          title="Daily Affirmations"
          subtitle="Start your day with positive thoughts and intentions"
        />

        {/* Current Affirmation Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 bg-primary text-primary-foreground border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <IconComponent className="w-8 h-8" />
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                  {currentAffirmation.category}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold leading-relaxed">
                {currentAffirmation.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={getNewAffirmation} variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  <RefreshCw className="mr-2 h-4 w-4" /> New Affirmation
                </Button>
                <Button onClick={saveAffirmation} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" disabled={isSaved}>
                  <Heart className="mr-2 h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Affirmations */}
        {savedAffirmations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Your Saved Affirmations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {savedAffirmations.map((affirmation, index) => {
                const SavedIcon = affirmation.icon;
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <SavedIcon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">{affirmation.text}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{affirmation.category}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => removeSavedAffirmation(index)} className="text-muted-foreground hover:text-destructive">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tips Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mt-8 bg-muted/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">✨ Affirmation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div><p className="font-medium mb-2">🌅 Morning Practice</p><p>Read your affirmations first thing in the morning to set a positive tone for your day.</p></div>
                <div><p className="font-medium mb-2">🔄 Repeat & Believe</p><p>Say each affirmation 3-5 times, focusing on truly believing and feeling the words.</p></div>
                <div><p className="font-medium mb-2">📝 Personalize</p><p>Feel free to modify affirmations to make them more personal and meaningful to you.</p></div>
                <div><p className="font-medium mb-2">💝 Share Positivity</p><p>Share your favorite affirmations with loved ones to spread positive energy.</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

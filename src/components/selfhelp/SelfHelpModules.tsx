import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Heart, Moon, Shield, Smile, Target, 
  CheckCircle2, Clock, BookOpen, Play, ChevronRight,
  Sparkles, Users, Zap, Volume2, VolumeX, Pause
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "anxiety" | "depression" | "stress" | "sleep" | "relationships" | "self-esteem";
  duration: string;
  lessons: Lesson[];
  color: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  exercise?: string;
  completed?: boolean;
}

const modules: Module[] = [
  {
    id: "anxiety-management",
    title: "Managing Anxiety",
    description: "Learn practical techniques to understand and reduce anxiety symptoms",
    icon: Shield,
    category: "anxiety",
    duration: "15 min",
    color: "text-blue-500",
    lessons: [
      {
        id: "a1",
        title: "Understanding Anxiety",
        content: "Anxiety is your body's natural response to stress. It's a feeling of fear or worry about what's to come. While it's normal to feel anxious sometimes, persistent anxiety can interfere with daily life.\n\nKey facts:\n• Anxiety affects 1 in 4 people\n• It's treatable with the right tools\n• Physical symptoms are common (racing heart, sweating)\n• Thoughts often catastrophize situations",
        exercise: "Take 3 deep breaths right now. Notice how your body feels before and after."
      },
      {
        id: "a2",
        title: "The 5-4-3-2-1 Grounding Technique",
        content: "When anxiety strikes, use this sensory technique to ground yourself in the present moment:\n\n5 things you can SEE\n4 things you can TOUCH\n3 things you can HEAR\n2 things you can SMELL\n1 thing you can TASTE\n\nThis redirects your mind from anxious thoughts to the present moment.",
        exercise: "Practice this technique right now. Look around and identify 5 things you can see."
      },
      {
        id: "a3",
        title: "Challenging Anxious Thoughts",
        content: "Cognitive restructuring helps you identify and challenge negative thought patterns:\n\n1. Identify the anxious thought\n2. Ask: What evidence supports this?\n3. Ask: What evidence contradicts this?\n4. Create a balanced alternative thought\n\nExample: 'Everyone will judge me' → 'Most people are focused on themselves, not judging me.'",
        exercise: "Write down one anxious thought you've had today. Now challenge it using the steps above."
      }
    ]
  },
  {
    id: "mood-lifting",
    title: "Lifting Your Mood",
    description: "Discover activities and mindset shifts to improve your emotional wellbeing",
    icon: Smile,
    category: "depression",
    duration: "12 min",
    color: "text-yellow-500",
    lessons: [
      {
        id: "m1",
        title: "Behavioral Activation",
        content: "When feeling low, we often wait to 'feel like' doing things. Behavioral activation flips this: action comes before motivation.\n\nStart small:\n• Take a 5-minute walk\n• Text a friend\n• Do one small chore\n• Step outside briefly\n\nAction creates momentum, which creates motivation.",
        exercise: "Choose ONE small action you can do right now, even if you don't feel like it."
      },
      {
        id: "m2",
        title: "Gratitude Practice",
        content: "Research shows gratitude rewires the brain for positivity. It's not about ignoring problems—it's about also noticing good things.\n\nDaily practice:\n• Name 3 things you're grateful for\n• Be specific (not just 'family' but 'my mom called to check on me')\n• Feel the gratitude, don't just list it",
        exercise: "Right now, think of 3 specific things you're grateful for today."
      },
      {
        id: "m3",
        title: "Self-Compassion",
        content: "We're often harder on ourselves than we'd ever be on a friend. Self-compassion means treating yourself with the same kindness.\n\nThree components:\n1. Self-kindness (not self-criticism)\n2. Common humanity (everyone struggles)\n3. Mindfulness (acknowledge pain without over-identifying)\n\nTry this: What would you say to a friend going through this?",
        exercise: "Write yourself a compassionate note as if you were writing to a dear friend."
      }
    ]
  },
  {
    id: "stress-reduction",
    title: "Stress Reduction",
    description: "Build resilience and learn to manage daily stressors effectively",
    icon: Brain,
    category: "stress",
    duration: "10 min",
    color: "text-green-500",
    lessons: [
      {
        id: "s1",
        title: "Understanding Your Stress Response",
        content: "Your body's stress response (fight-flight-freeze) is designed to protect you. But chronic stress keeps this system activated.\n\nSigns of chronic stress:\n• Muscle tension\n• Difficulty sleeping\n• Irritability\n• Racing thoughts\n• Fatigue\n\nRecognizing stress is the first step to managing it.",
        exercise: "Scan your body right now. Where do you hold tension? Shoulders? Jaw? Back?"
      },
      {
        id: "s2",
        title: "Progressive Muscle Relaxation",
        content: "PMR involves tensing and releasing muscle groups to release physical tension:\n\n1. Start with your feet—tense for 5 seconds\n2. Release and notice the relaxation\n3. Move up: calves, thighs, stomach, hands, arms, shoulders, face\n\nThis teaches your body the difference between tension and relaxation.",
        exercise: "Try tensing your shoulders right now—hold for 5 seconds—then release. Notice the difference."
      },
      {
        id: "s3",
        title: "Setting Healthy Boundaries",
        content: "Boundaries protect your energy and prevent burnout:\n\n• It's okay to say 'no'\n• You don't need to explain every decision\n• Your needs matter as much as others'\n• Boundaries are about respect, not rejection\n\nStart small: What's one area where you need better boundaries?",
        exercise: "Identify one situation where you need to set a boundary this week."
      }
    ]
  },
  {
    id: "better-sleep",
    title: "Better Sleep",
    description: "Improve your sleep quality with evidence-based techniques",
    icon: Moon,
    category: "sleep",
    duration: "10 min",
    color: "text-indigo-500",
    lessons: [
      {
        id: "sl1",
        title: "Sleep Hygiene Basics",
        content: "Good sleep starts with good habits:\n\n• Keep a consistent sleep schedule\n• Make your room cool, dark, and quiet\n• Avoid screens 1 hour before bed\n• No caffeine after 2 PM\n• Don't use your bed for work\n\nYour bedroom should signal 'sleep' to your brain.",
        exercise: "Pick one sleep hygiene tip to implement tonight."
      },
      {
        id: "sl2",
        title: "Wind-Down Routine",
        content: "A consistent pre-sleep routine tells your body it's time to rest:\n\n30 minutes before bed:\n• Dim the lights\n• Do a calming activity (reading, gentle stretching)\n• Write tomorrow's to-do list to clear your mind\n• Practice breathing exercises\n\nConsistency is key—do the same routine every night.",
        exercise: "Design your ideal 30-minute wind-down routine."
      },
      {
        id: "sl3",
        title: "Managing Racing Thoughts at Night",
        content: "Can't sleep because your mind won't stop? Try these:\n\n• 'Worry journal': Write worries down to address tomorrow\n• Body scan meditation: Focus on each body part relaxing\n• Counting breaths: Count exhales up to 10, then restart\n• Visualization: Imagine a peaceful, detailed scene\n\nThe goal is to occupy your mind with something calming.",
        exercise: "Try counting your exhales from 1 to 10 right now. If your mind wanders, start over."
      }
    ]
  },
  {
    id: "healthy-relationships",
    title: "Healthy Relationships",
    description: "Build stronger connections and improve communication skills",
    icon: Users,
    category: "relationships",
    duration: "12 min",
    color: "text-pink-500",
    lessons: [
      {
        id: "r1",
        title: "Active Listening",
        content: "Good communication starts with truly listening:\n\n• Give full attention—put devices away\n• Don't plan your response while they talk\n• Reflect back what you heard\n• Ask clarifying questions\n• Validate their feelings\n\nPeople feel valued when they feel heard.",
        exercise: "In your next conversation, practice reflecting: 'So what you're saying is...'"
      },
      {
        id: "r2",
        title: "Expressing Needs Clearly",
        content: "Use 'I' statements to express needs without blame:\n\n❌ 'You never listen to me'\n✅ 'I feel unheard when I'm talking and you're on your phone'\n\nFormula: 'I feel [emotion] when [situation] because [reason]. I need [request].'\n\nThis reduces defensiveness and opens dialogue.",
        exercise: "Think of a recent frustration. Reframe it as an 'I' statement."
      },
      {
        id: "r3",
        title: "Handling Conflict",
        content: "Conflict is normal—how you handle it matters:\n\n• Take a break if emotions are high\n• Focus on the issue, not the person\n• Look for compromise, not 'winning'\n• Apologize when you're wrong\n• Don't bring up past conflicts\n\nHealthy conflict can actually strengthen relationships.",
        exercise: "Reflect on a recent conflict. What could you have done differently?"
      }
    ]
  },
  {
    id: "building-confidence",
    title: "Building Confidence",
    description: "Develop self-esteem and believe in your capabilities",
    icon: Target,
    category: "self-esteem",
    duration: "10 min",
    color: "text-orange-500",
    lessons: [
      {
        id: "c1",
        title: "Recognizing Your Strengths",
        content: "Low self-esteem often means overlooking your strengths:\n\n• What do others compliment you on?\n• What comes naturally to you?\n• What have you overcome?\n• What would your best friend say about you?\n\nYour strengths are real, even if you minimize them.",
        exercise: "List 5 things you're good at. Ask a friend if you're stuck."
      },
      {
        id: "c2",
        title: "Challenging the Inner Critic",
        content: "That harsh inner voice isn't the truth:\n\n• Notice when it speaks up\n• Ask: Would I say this to a friend?\n• Replace criticism with encouragement\n• Remember: Thoughts aren't facts\n\nYou deserve the same kindness you'd give others.",
        exercise: "Catch your inner critic today. Write down what it says and challenge it."
      },
      {
        id: "c3",
        title: "Taking Action Despite Fear",
        content: "Confidence grows through action, not waiting to feel ready:\n\n• Start with small challenges\n• Celebrate small wins\n• Expect discomfort—it's normal\n• Learn from setbacks, don't fear them\n\nEvery time you act despite fear, you prove to yourself that you can.",
        exercise: "Identify one small thing you've been avoiding. Commit to doing it this week."
      }
    ]
  }
];

export const SelfHelpModules = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("completedLessons");
    return saved ? JSON.parse(saved) : {};
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Check speech synthesis support
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Cleanup on unmount or lesson change
  useEffect(() => {
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [currentLessonIndex, selectedModule]);

  const cleanTextForSpeech = (text: string) => {
    return text
      .replace(/[•●○◦▪▫]/g, "") // Remove bullet points
      .replace(/\n{2,}/g, ". ") // Replace multiple newlines with pause
      .replace(/\n/g, " ") // Replace single newlines
      .replace(/[❌✅]/g, "") // Remove emoji markers
      .replace(/'/g, "'") // Fix apostrophes
      .trim();
  };

  const handlePlayNarration = () => {
    if (!selectedModule) return;
    
    const lesson = selectedModule.lessons[currentLessonIndex];
    const fullText = `${lesson.title}. ${lesson.content}${lesson.exercise ? `. Exercise: ${lesson.exercise}` : ''}`;
    const cleanedText = cleanTextForSpeech(fullText);

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a calm, natural voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Could not play narration. Please try again.",
        variant: "destructive"
      });
    };

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const stopNarration = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const categoryColors = {
    anxiety: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    depression: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    stress: "bg-green-500/10 text-green-700 dark:text-green-400",
    sleep: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    relationships: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    "self-esteem": "bg-orange-500/10 text-orange-700 dark:text-orange-400"
  };

  const getModuleProgress = (moduleId: string, totalLessons: number) => {
    const completed = completedLessons[moduleId]?.length || 0;
    return Math.round((completed / totalLessons) * 100);
  };

  const isLessonCompleted = (moduleId: string, lessonId: string) => {
    return completedLessons[moduleId]?.includes(lessonId) || false;
  };

  const markLessonComplete = (moduleId: string, lessonId: string) => {
    const updated = {
      ...completedLessons,
      [moduleId]: [...(completedLessons[moduleId] || []), lessonId]
    };
    
    if (!completedLessons[moduleId]?.includes(lessonId)) {
      setCompletedLessons(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
      
      toast({
        title: "Lesson completed! ✨",
        description: "Great job on completing this lesson.",
      });
    }
  };

  const handleNextLesson = () => {
    if (selectedModule && currentLessonIndex < selectedModule.lessons.length - 1) {
      markLessonComplete(selectedModule.id, selectedModule.lessons[currentLessonIndex].id);
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (selectedModule) {
      markLessonComplete(selectedModule.id, selectedModule.lessons[currentLessonIndex].id);
      toast({
        title: "Module completed! 🎉",
        description: `You've finished "${selectedModule.title}". Keep up the great work!`,
      });
      setSelectedModule(null);
      setCurrentLessonIndex(0);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (selectedModule) {
    const lesson = selectedModule.lessons[currentLessonIndex];
    const Icon = selectedModule.icon;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              stopNarration();
              setSelectedModule(null);
              setCurrentLessonIndex(0);
            }}
          >
            ← Back to Modules
          </Button>
          <Badge className={categoryColors[selectedModule.category]}>
            {selectedModule.category}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Lesson {currentLessonIndex + 1} of {selectedModule.lessons.length}
            </span>
            <span className="text-muted-foreground">
              {getModuleProgress(selectedModule.id, selectedModule.lessons.length)}% complete
            </span>
          </div>
          <Progress value={((currentLessonIndex + 1) / selectedModule.lessons.length) * 100} className="h-2" />
        </div>

        {/* Module Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-primary/10`}>
              <Icon className={`w-6 h-6 ${selectedModule.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{selectedModule.title}</h2>
              <p className="text-sm text-muted-foreground">{lesson.title}</p>
            </div>
          </div>
          
          {/* Audio Narration Button */}
          {isSpeechSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayNarration}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Listen
                </>
              )}
            </Button>
          )}
        </div>

        {/* Lesson Content */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {lesson.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-foreground/90 whitespace-pre-line leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {lesson.exercise && (
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Try This Exercise</h4>
                    <p className="text-sm text-muted-foreground">{lesson.exercise}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousLesson}
            disabled={currentLessonIndex === 0}
          >
            Previous
          </Button>
          <Button onClick={handleNextLesson}>
            {currentLessonIndex === selectedModule.lessons.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Module
              </>
            ) : (
              <>
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Self-Help Modules</h2>
        <p className="text-muted-foreground">
          Evidence-based techniques to support your mental wellness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          const progress = getModuleProgress(module.id, module.lessons.length);
          
          return (
            <Card 
              key={module.id}
              className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedModule(module)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <Badge className={categoryColors[module.category]}>
                    {module.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {module.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {module.lessons.length} lessons
                  </div>
                </div>
                
                {progress > 0 && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{progress}% complete</p>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 group-hover:bg-primary/10"
                >
                  {progress > 0 && progress < 100 ? "Continue" : progress === 100 ? "Review" : "Start"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

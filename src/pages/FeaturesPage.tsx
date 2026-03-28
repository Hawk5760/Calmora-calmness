import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import {
  Heart, BookOpen, Wind, Brain, Leaf, MessageCircle,
  BarChart3, Moon, Sparkles, ClipboardList, Phone,
  ArrowRight, Shield, Headphones, ChevronRight
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "AI Mood Detector",
    description: "Share how you're feeling through voice or text. Our AI analyzes your emotions, provides supportive responses in Hinglish, and recommends uplifting songs to brighten your day.",
    highlights: ["Voice & text input", "AI-powered sentiment analysis", "Personalized song recommendations", "Supportive responses"],
    color: "from-feature-mood/10 to-feature-mood/5 border-feature-mood/20",
    iconColor: "text-feature-mood",
    href: "/mood",
  },
  {
    icon: BookOpen,
    title: "Guided Journaling",
    description: "Express yourself through beautiful daily prompts for gratitude, reflection, and personal growth. Get AI-powered insights on your journal entries.",
    highlights: ["Daily prompts", "AI reflections", "Private & encrypted", "Track patterns"],
    color: "from-feature-journal/10 to-feature-journal/5 border-feature-journal/20",
    iconColor: "text-feature-journal",
    href: "/journal",
  },
  {
    icon: Wind,
    title: "Mindfulness & Breathing",
    description: "Guided breathing exercises and meditation sessions designed for stress relief, anxiety management, and better focus throughout the day.",
    highlights: ["Breathing techniques", "Guided meditation", "Timer sessions", "Stress relief"],
    color: "from-feature-mindfulness/10 to-feature-mindfulness/5 border-feature-mindfulness/20",
    iconColor: "text-feature-mindfulness",
    href: "/mindfulness",
  },
  {
    icon: Brain,
    title: "Mind Puzzles",
    description: "Memory match games with multiple difficulty levels that sharpen your focus while providing AI-driven stress analysis and wellness insights after each game.",
    highlights: ["Multiple difficulty levels", "AI stress report", "Achievement badges", "Progress tracking"],
    color: "from-feature-chat/10 to-feature-chat/5 border-feature-chat/20",
    iconColor: "text-feature-chat",
    href: "/sounds",
  },
  {
    icon: MessageCircle,
    title: "Mindo",
    description: "Chat with your supportive AI companion who speaks in a warm Hinglish tone. Get gentle guidance, positive reframing, and empathetic conversations whenever you need.",
    highlights: ["24/7 availability", "Hinglish conversations", "Empathetic responses", "Mood-aware"],
    color: "from-status-warning/10 to-status-warning/5 border-status-warning/20",
    iconColor: "text-status-warning",
    href: "/chat",
  },
  {
    icon: Leaf,
    title: "Soul Garden",
    description: "Watch your virtual garden bloom as you complete mindful actions and reach milestones. A beautiful visual representation of your wellness journey.",
    highlights: ["Visual progress", "Milestone rewards", "Daily growth", "Garden levels"],
    color: "from-feature-garden/10 to-feature-garden/5 border-feature-garden/20",
    iconColor: "text-feature-garden",
    href: "/garden",
  },
  {
    icon: Headphones,
    title: "Self-Help Modules",
    description: "Evidence-based interactive lessons covering anxiety, depression, stress, sleep, relationships, and self-esteem. Learn at your own pace with audio narration.",
    highlights: ["6 module categories", "Audio narration", "Practical exercises", "Progress saved"],
    color: "from-feature-sleep/10 to-feature-sleep/5 border-feature-sleep/20",
    iconColor: "text-feature-sleep",
    href: "/self-help",
  },
  {
    icon: ClipboardList,
    title: "Psychological Assessments",
    description: "Take validated self-assessment screenings including PHQ-9, GAD-7, DASS-21, WHO-5, PSS, and K-10 to understand your mental health better.",
    highlights: ["6+ validated tests", "Instant results", "Severity ratings", "Recommendations"],
    color: "from-primary/10 to-primary/5 border-primary/20",
    iconColor: "text-primary",
    href: "/assessments",
  },
  {
    icon: Moon,
    title: "Sleep Zone",
    description: "Ambient sounds and sleep timer designed for restful nights. Choose from nature sounds, white noise, and calming melodies to help you drift off.",
    highlights: ["Ambient sounds", "Sleep timer", "Nature soundscapes", "Background play"],
    color: "from-feature-sleep/10 to-feature-sleep/5 border-feature-sleep/20",
    iconColor: "text-feature-sleep",
    href: "/sleep",
  },
  {
    icon: Sparkles,
    title: "Daily Affirmations",
    description: "Start each day with personalized positive affirmations designed to boost your confidence, motivation, and self-belief.",
    highlights: ["Personalized daily", "Confidence boost", "Save favorites", "Share with friends"],
    color: "from-status-warning/10 to-status-warning/5 border-status-warning/20",
    iconColor: "text-status-warning",
    href: "/affirmations",
  },
  {
    icon: BarChart3,
    title: "Wellness Dashboard",
    description: "Track your entire wellness journey with detailed analytics. See mood patterns, activity streaks, and insights to understand your progress.",
    highlights: ["Mood trends", "Activity calendar", "Weekly stats", "Visual analytics"],
    color: "from-status-info/10 to-status-info/5 border-status-info/20",
    iconColor: "text-status-info",
    href: "/dashboard",
  },
  {
    icon: Phone,
    title: "Crisis Support",
    description: "Immediate access to helpline numbers and emergency contacts. Available 24/7 with direct calling support for when you need help the most.",
    highlights: ["24/7 helplines", "One-tap calling", "Multiple languages", "Always accessible"],
    color: "from-destructive/10 to-destructive/5 border-destructive/20",
    iconColor: "text-destructive",
    href: "/crisis-support",
  },
];
export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 md:pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              All Features
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything Calmora Offers
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore our complete toolkit designed to support your mental wellness journey — from AI-powered mood detection to guided self-help modules.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth?mode=anonymous">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Shield className="w-4 h-4" />
                  Try Anonymously
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`overflow-hidden border bg-gradient-to-br ${feature.color} hover:shadow-lg transition-all duration-300 group`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-background/80 shadow-sm">
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {feature.highlights.map((h, i) => (
                            <span key={i} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 md:mt-16">
            <Card className="p-6 sm:p-8 bg-card border border-border max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Secure & Private</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your data is encrypted end-to-end. You can even use Calmora anonymously — no email required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/auth?mode=anonymous">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Continue Anonymously
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

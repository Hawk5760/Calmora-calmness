import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";

// Lazy load heavy below-fold component
const SoulGarden = lazy(() => import("@/components/SoulGarden").then(m => ({ default: m.SoulGarden })));

import {
  Heart,
  BookOpen,
  Wind,
  Brain,
  Leaf,
  MessageCircle,
  BarChart3,
  Moon,
  Sparkles,
  ArrowRight,
  Shield,
  Lock,
  ChevronRight,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Mood Detector",
      description:
        "Voice or text-based mood tracking with AI sentiment analysis and personalized music suggestions.",
      href: "/mood",
    },
    {
      icon: BookOpen,
      title: "Guided Journaling",
      description:
        "Beautiful daily prompts for gratitude, reflection, and inner growth with AI-powered insights.",
      href: "/journal",
    },
    {
      icon: Wind,
      title: "Mindfulness",
      description:
        "Guided breathing exercises and meditation sessions for stress, anxiety, and better focus.",
      href: "/mindfulness",
    },
    {
      icon: Brain,
      title: "Mind Puzzles",
      description:
        "Calming memory games designed to improve focus and provide a mental break.",
      href: "/sounds",
    },
    {
      icon: Leaf,
      title: "Soul Garden",
      description:
        "Watch your virtual garden bloom as you complete mindful actions and reach milestones.",
      href: "/garden",
    },
    {
      icon: MessageCircle,
      title: "Mindo",
      description:
        "Chat with your supportive AI companion for gentle guidance and positive reframing.",
      href: "/chat",
    },
  ];

  return (
    <div className="min-h-screen bg-background" role="main">
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Authentication CTA for non-authenticated users */}
      {!user && (
        <section className="py-10 sm:py-16 px-4 sm:px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-card border border-border shadow-soft">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Secure & Private
                </h2>
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-xl mx-auto">
                Create your secure account to access all features. Your data is
                encrypted and protected with enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto gap-2 h-11 sm:h-12">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-11 sm:h-12">
                    Explore All Features
                  </Button>
                </Link>
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                ✓ End-to-end encryption • ✓ No data selling • ✓ GDPR compliant
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Overview */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full mb-3 sm:mb-4">
              Features
            </span>
            <h2 id="features-heading" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Everything You Need for Inner Peace
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover tools designed to help you reflect, breathe, and grow your
              emotional wellness
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={user ? feature.href : "/auth"} className="group">
                <div className="h-full p-4 sm:p-5 md:p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      {user && (
        <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block px-3 py-1 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full mb-3 sm:mb-4">
                Try It Now
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
                Start Your Journey Today
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                Check in with your mood and watch your soul garden grow
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <MoodCheckIn />
              <Suspense fallback={<div className="h-64 rounded-xl bg-muted/30 animate-pulse" />}>
                <SoulGarden />
              </Suspense>
            </div>
          </div>
        </section>
      )}

      {/* Additional Features */}
      <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-foreground">
            More Features to Explore
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-xl mx-auto">
            Your wellness toolkit continues to expand with new tools
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Link to={user ? "/dashboard" : "/auth"}>
              <div className="p-4 sm:p-5 md:p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Analytics Dashboard</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Deep insights into your mood patterns and progress
                </p>
              </div>
            </Link>
            <Link to={user ? "/sleep" : "/auth"}>
              <div className="p-4 sm:p-5 md:p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                <Moon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Sleep Zone</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sleep timer and ambient sounds for restful nights
                </p>
              </div>
            </Link>
            <Link to={user ? "/affirmations" : "/auth"}>
              <div className="p-4 sm:p-5 md:p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2">Daily Affirmations</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Personalized positive affirmations to boost confidence
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 sm:pt-16 pb-8 px-4 sm:px-6 border-t border-border bg-card/50" role="contentinfo">
        <div className="max-w-6xl mx-auto">
          {/* Top Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/lovable-uploads/12d2bf45-5f26-4fad-a79d-fce873b1aa64.png" alt="Calmora" className="w-8 h-8 rounded-full" />
                <span className="text-lg font-bold text-foreground">Calmora</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Your digital sanctuary for mental wellness. AI-powered tools designed for Indian students to reflect, breathe, and grow.
              </p>
              <div className="flex items-center gap-2">
                <a href="https://www.instagram.com/calmora_mentalwellness/" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/channel/UCyJz6FlWM1v5bXacnKFGkyA" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="mailto:support@calmora.app"
                  className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground" aria-label="Email">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Features</h4>
              <ul className="space-y-2">
                {[
                  { label: "Mood Detector", href: "/mood" },
                  { label: "Guided Journaling", href: "/journal" },
                  { label: "Mindfulness", href: "/mindfulness" },
                  { label: "CBT Exercises", href: "/cbt" },
                  { label: "Soul Garden", href: "/garden" },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={user ? link.href : "/features"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: "Crisis Helplines", href: "/crisis-support" },
                  { label: "Assessments", href: "/assessments" },
                  { label: "Community", href: "/community" },
                  { label: "AI Companion", href: "/chat" },
                  { label: "Self-Help Modules", href: "/self-help" },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={user ? link.href : "/features"} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: "Pricing", href: "/pricing" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Features", href: "/features" },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="text-xs">Made in India 🇮🇳</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Calmora. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>v2.0</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">Built with <Heart className="w-3 h-3 text-destructive" /> for your peace</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Sparkles, BookOpen, Moon, Shield, ArrowRight, X } from "lucide-react";

const steps = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Welcome to Calmora! 🌿",
    description: "Your safe space for mental wellness. Let me show you what I can do.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Mood Detector",
    description: "Share how you're feeling and I'll analyze your emotions with AI, plus recommend songs to match your mood.",
  },
  {
    icon: <Brain className="w-8 h-8 text-primary" />,
    title: "Talk to Mindo",
    description: "Your AI companion who listens without judgment. Chat anytime you need support.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Journal & Mindfulness",
    description: "Write your thoughts, practice breathing exercises, and track your wellness journey.",
  },
  {
    icon: <Moon className="w-8 h-8 text-primary" />,
    title: "Sleep & Soul Garden",
    description: "Wind down with soothing sounds and watch your Soul Garden grow as you engage with Calmora.",
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Your Privacy Matters",
    description: "Aapke thoughts private hain. We never sell your data and everything is encrypted. 🔒",
  },
];

export const OnboardingFlow = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("calmora_onboarding_done");
    if (!seen) setShow(true);
  }, []);

  const finish = () => {
    localStorage.setItem("calmora_onboarding_done", "true");
    setShow(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  if (!show) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl p-8 shadow-2xl"
        >
          {/* Skip button */}
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full h-8 w-8" onClick={finish}>
            <X className="w-4 h-4" />
          </Button>

          {/* Progress dots */}
          <div className="flex gap-1.5 justify-center mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              {current.icon}
            </div>
            <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <span className="text-xs text-muted-foreground">{step + 1} of {steps.length}</span>
            <Button onClick={next} className="rounded-full gap-2 shadow-lg">
              {step === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

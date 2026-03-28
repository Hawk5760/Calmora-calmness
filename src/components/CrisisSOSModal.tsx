import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Heart, X, MessageCircleHeart, Shield, Sparkles, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const helplines = [
  { name: 'Vandrevala Foundation', phone: '1860-2662-345', available: '24/7', desc: 'Free & confidential' },
  { name: 'iCall (TISS)', phone: '9152987821', available: 'Mon-Sat, 8am-10pm', desc: 'Professional counselors' },
  { name: 'AASRA', phone: '9820466726', available: '24/7', desc: 'Crisis support' },
  { name: 'Snehi', phone: '044-24640050', available: '24/7', desc: 'Emotional support' },
];

const consolingMessages = [
  "Yaar, tu akela nahi hai. Hum sab tere saath hain. 💚",
  "Zindagi mein ups-downs aate hain, but tu bohot strong hai. Believe kar apne aap pe.",
  "Tujhe koi judge nahi karega. Bas ek baar kisi se baat kar — tera mann halka ho jayega.",
  "Tera hona important hai. Duniya ko teri zaroorat hai, chahe abhi aisa na lage.",
  "Ek deep breath le… phir se ek… tu safe hai yahan. 🌿",
];

// Breathing phases: 4-7-8 technique
const BREATHING_PHASES = [
  { label: 'Inhale', duration: 4, color: 'hsl(var(--primary))' },
  { label: 'Hold', duration: 7, color: 'hsl(var(--accent))' },
  { label: 'Exhale', duration: 8, color: 'hsl(175 60% 35%)' },
];

interface CrisisSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BreathingCircle = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(BREATHING_PHASES[0].duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setPhaseIndex(p => {
            const next = (p + 1) % BREATHING_PHASES.length;
            setCountdown(BREATHING_PHASES[next].duration);
            return next;
          });
          return BREATHING_PHASES[(phaseIndex + 1) % BREATHING_PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, phaseIndex]);

  const phase = BREATHING_PHASES[phaseIndex];
  const scale = phase.label === 'Inhale' ? 1.3 : phase.label === 'Hold' ? 1.3 : 0.85;

  return (
    <div className="flex flex-col items-center gap-3">
      {!isActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsActive(true)}
          className="gap-2 rounded-full border-primary/30 text-primary hover:bg-primary/10"
        >
          <Wind className="w-4 h-4" />
          Start Breathing Exercise
        </Button>
      ) : (
        <>
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ repeat: Infinity, duration: phase.duration, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-primary/20"
            />
            {/* Main breathing circle */}
            <motion.div
              animate={{ scale }}
              transition={{ duration: phase.duration, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex flex-col items-center justify-center backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-primary">{phase.label}</span>
              <span className="text-2xl font-bold text-foreground">{countdown}</span>
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-foreground">4-7-8 Breathing Technique</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setIsActive(false); setPhaseIndex(0); setCountdown(BREATHING_PHASES[0].duration); }}
            className="text-[10px] text-muted-foreground h-6"
          >
            Stop
          </Button>
        </>
      )}
    </div>
  );
};

export const CrisisSOSModal = ({ isOpen, onClose }: CrisisSOSModalProps) => {
  const [showHelplines, setShowHelplines] = useState(false);
  const randomMessage = consolingMessages[Math.floor(Math.random() * consolingMessages.length)];
  const modalRef = useRef<HTMLDivElement>(null);
  

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus modal
      setTimeout(() => modalRef.current?.querySelector<HTMLElement>('button')?.focus(), 100);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleTalkToCalmora = () => {
    onClose();
    window.location.href = '/chat';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Crisis support"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Animated border pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl border-2 border-primary/30 pointer-events-none"
            />

            {/* Header gradient */}
            <div className="bg-gradient-to-r from-rose-500/20 via-primary/20 to-emerald-500/20 p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
                  >
                    <Shield className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-destructive fill-destructive" />
                      Hey, Ruk Zara…
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Calmora cares about you 💚</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full -mt-1 -mr-1" aria-label="Close">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Consoling message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-primary/5 border border-primary/15"
              >
                <div className="flex items-start gap-3">
                  <MessageCircleHeart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{randomMessage}</p>
                </div>
              </motion.div>

              {/* Breathing Exercise */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <p className="text-xs text-muted-foreground text-center mb-3">
                  🌬️ Take a moment to breathe with Calmora
                </p>
                <BreathingCircle />
              </motion.div>

              {/* Encouragement */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-2"
              >
                <p className="text-sm text-muted-foreground">
                  Kisi trained professional se baat karna <strong className="text-foreground">bilkul okay</strong> hai.
                  Yeh courage ki nishani hai, kamzori ki nahi. 💪
                </p>
              </motion.div>

              {/* Action buttons */}
              {!showHelplines ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={() => setShowHelplines(true)}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    <Phone className="w-4 h-4" />
                    Kisi Se Baat Karo — Helpline Numbers
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTalkToCalmora}
                    className="w-full gap-2 border-primary/30 hover:bg-primary/10"
                    size="lg"
                  >
                    <MessageCircleHeart className="w-4 h-4 text-primary" />
                    Talk to Calmora AI 💬
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full gap-2 text-muted-foreground"
                  >
                    <Sparkles className="w-4 h-4" />
                    Main Theek Hu, Shukriya 🙏
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Yeh sab free aur confidential hain. Koi judge nahi karega. ❤️
                  </p>
                  {helplines.map((line, i) => (
                    <motion.a
                      key={i}
                      href={`tel:${line.phone.replace(/-/g, '')}`}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{line.name}</p>
                        <p className="text-xs text-primary font-medium">{line.phone}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-muted-foreground">{line.available}</p>
                        <p className="text-[10px] text-primary font-medium">Call →</p>
                      </div>
                    </motion.a>
                  ))}

                  <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                    <p className="text-xs text-foreground font-medium">Emergency? Call <strong>112</strong></p>
                    <p className="text-[10px] text-muted-foreground">Ya nearest hospital jao.</p>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full mt-2 text-xs text-muted-foreground"
                  >
                    Band Karo ✕
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border/50 bg-muted/30 text-center">
              <p className="text-[10px] text-muted-foreground">
                🌱 Tu brave hai ki tune yahan tak padha. Tera hona matter karta hai.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

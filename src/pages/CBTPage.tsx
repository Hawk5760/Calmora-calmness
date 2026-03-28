import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, FileText, RefreshCw, Lightbulb, Check, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';

// ─── Cognitive Distortions ───
const DISTORTIONS = [
  { id: 'all_or_nothing', name: 'All-or-Nothing', emoji: '⚫', desc: 'Seeing things in black or white with no middle ground.', example: '"If I\'m not perfect, I\'m a failure."', reframe: 'Most things exist on a spectrum. What would a "good enough" look like?' },
  { id: 'overgeneralization', name: 'Overgeneralization', emoji: '🔄', desc: 'Making broad conclusions from a single event.', example: '"I failed this test, so I\'ll fail everything."', reframe: 'One event doesn\'t define a pattern. What evidence contradicts this?' },
  { id: 'mental_filter', name: 'Mental Filter', emoji: '🔍', desc: 'Focusing only on the negative and ignoring positives.', example: '"I got one criticism so the whole day was bad."', reframe: 'What positive things also happened that you might be overlooking?' },
  { id: 'mind_reading', name: 'Mind Reading', emoji: '🧠', desc: 'Assuming you know what others think without evidence.', example: '"They must think I\'m stupid."', reframe: 'You can\'t read minds. What would you say if a friend thought this?' },
  { id: 'catastrophizing', name: 'Catastrophizing', emoji: '🌋', desc: 'Expecting the worst-case scenario will happen.', example: '"If I fail this exam, my life is over."', reframe: 'What\'s the most realistic outcome? How have you handled setbacks before?' },
  { id: 'should_statements', name: 'Should Statements', emoji: '📏', desc: 'Rigid rules about how you or others "should" behave.', example: '"I should always be productive."', reframe: 'Replace "should" with "I\'d prefer to." It reduces pressure.' },
  { id: 'labeling', name: 'Labeling', emoji: '🏷️', desc: 'Attaching a negative label to yourself instead of the behavior.', example: '"I\'m an idiot" instead of "I made a mistake."', reframe: 'Separate the behavior from your identity. One action doesn\'t define you.' },
  { id: 'personalization', name: 'Personalization', emoji: '🎯', desc: 'Blaming yourself for things outside your control.', example: '"My friend is upset — it must be my fault."', reframe: 'What other factors could have caused this that aren\'t about you?' },
];

// ─── Thought Record Form ───
interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  distortions: string[];
  reframe: string;
  newIntensity: number;
  timestamp: string;
}

const CBTPage = () => {
  const { addXP, levelUpData, clearLevelUp } = usePlayerProgress();

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {levelUpData && <LevelUpModal open={!!levelUpData} oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={clearLevelUp} />}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">CBT Exercises</h1>
          </div>
          <p className="text-sm text-muted-foreground">Challenge negative thoughts with evidence-based techniques.</p>
          <Badge variant="outline" className="mt-2 text-[10px] rounded-full gap-1 border-primary/30 text-primary">
            <Sparkles className="w-2.5 h-2.5" /> Earn +25 XP per exercise
          </Badge>
        </motion.div>

        <Tabs defaultValue="record" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 h-10 rounded-xl">
            <TabsTrigger value="record" className="rounded-lg text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Thought Record
            </TabsTrigger>
            <TabsTrigger value="distortions" className="rounded-lg text-xs gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Distortions Guide
            </TabsTrigger>
          </TabsList>

          {/* ─── Thought Record ─── */}
          <TabsContent value="record">
            <ThoughtRecordForm onComplete={() => addXP('journal', 25)} />
          </TabsContent>

          {/* ─── Distortions Guide ─── */}
          <TabsContent value="distortions">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-xs text-muted-foreground text-center mb-4">
                Tap any distortion to learn more and practice reframing.
              </p>
              {DISTORTIONS.map((d, i) => (
                <DistortionCard key={d.id} distortion={d} index={i} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

// ─── Thought Record Form Component ───
const ThoughtRecordForm = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState('');
  const [thought, setThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(7);
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [reframe, setReframe] = useState('');
  const [newIntensity, setNewIntensity] = useState(4);
  const [completed, setCompleted] = useState(false);

  const steps = [
    { label: 'Situation', desc: 'What happened?' },
    { label: 'Thought', desc: 'What went through your mind?' },
    { label: 'Emotion', desc: 'How did it make you feel?' },
    { label: 'Distortions', desc: 'Any thinking traps?' },
    { label: 'Reframe', desc: 'A balanced alternative' },
  ];

  const emotions = ['Anxious', 'Sad', 'Angry', 'Guilty', 'Ashamed', 'Frustrated', 'Hopeless', 'Overwhelmed'];

  const canAdvance = () => {
    if (step === 0) return situation.trim().length > 5;
    if (step === 1) return thought.trim().length > 5;
    if (step === 2) return emotion.length > 0;
    if (step === 3) return selectedDistortions.length > 0;
    if (step === 4) return reframe.trim().length > 5;
    return false;
  };

  const handleComplete = () => {
    const record: ThoughtRecord = {
      id: crypto.randomUUID(), situation, automaticThought: thought,
      emotion, emotionIntensity: intensity, distortions: selectedDistortions,
      reframe, newIntensity, timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('cbt_records') || '[]');
    existing.push(record);
    localStorage.setItem('cbt_records', JSON.stringify(existing));
    setCompleted(true);
    onComplete();
    toast.success('Thought record saved! +25 XP', { description: 'Great work challenging that thought.' });
  };

  const toggleDistortion = (id: string) => {
    setSelectedDistortions(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  if (completed) {
    const reduction = intensity - newIntensity;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-sm border-primary/30 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Exercise Complete!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reduction > 0
              ? `Your emotional intensity dropped by ${reduction} points. That's real progress!`
              : `You took time to reflect. That's a powerful step forward.`}
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{intensity}/10</div>
              <div className="text-[10px] text-muted-foreground">Before</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{newIntensity}/10</div>
              <div className="text-[10px] text-muted-foreground">After</div>
            </div>
          </div>
          <Button onClick={() => { setStep(0); setSituation(''); setThought(''); setEmotion(''); setIntensity(7); setSelectedDistortions([]); setReframe(''); setNewIntensity(4); setCompleted(false); }} variant="outline" className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" /> New Exercise
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted/30'}`} />
          </div>
        ))}
      </div>

      <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="mb-1 text-[10px] text-muted-foreground uppercase tracking-wider">
          Step {step + 1} of {steps.length}
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">{steps[step].label}</h3>
        <p className="text-xs text-muted-foreground mb-4">{steps[step].desc}</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 0 && (
              <Textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="e.g., I presented in front of my class today..." className="min-h-[100px] rounded-xl" />
            )}

            {step === 1 && (
              <Textarea value={thought} onChange={e => setThought(e.target.value)} placeholder="e.g., Everyone thought I was terrible..." className="min-h-[100px] rounded-xl" />
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {emotions.map(e => (
                    <Button key={e} size="sm" variant={emotion === e ? 'default' : 'outline'} className="rounded-full text-xs" onClick={() => setEmotion(e)}>
                      {e}
                    </Button>
                  ))}
                </div>
                {emotion && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Intensity: {intensity}/10</label>
                    <input type="range" min={1} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-2">
                {DISTORTIONS.map(d => (
                  <button key={d.id} onClick={() => toggleDistortion(d.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${selectedDistortions.includes(d.id) ? 'bg-primary/10 border border-primary/30' : 'bg-muted/20 border border-transparent hover:bg-muted/30'}`}>
                    <span className="text-lg">{d.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                      <p className="text-[10px] text-muted-foreground truncate">{d.desc}</p>
                    </div>
                    {selectedDistortions.includes(d.id) && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {selectedDistortions.length > 0 && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-[10px] font-semibold text-primary mb-1">💡 Reframing tip:</p>
                    <p className="text-xs text-muted-foreground">
                      {DISTORTIONS.find(d => d.id === selectedDistortions[0])?.reframe}
                    </p>
                  </div>
                )}
                <Textarea value={reframe} onChange={e => setReframe(e.target.value)} placeholder="Write a more balanced, realistic thought..." className="min-h-[100px] rounded-xl" />
                {reframe.trim().length > 5 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">New intensity: {newIntensity}/10</label>
                    <input type="range" min={1} max={10} value={newIntensity} onChange={e => setNewIntensity(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="rounded-xl">
            Back
          </Button>
          {step < 4 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} className="rounded-xl gap-1">
              Next <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleComplete} disabled={!canAdvance()} className="rounded-xl gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// ─── Distortion Card ───
const DistortionCard = ({ distortion, index }: { distortion: typeof DISTORTIONS[0]; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card
        className={`p-4 bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer transition-colors ${expanded ? 'border-primary/30' : 'hover:border-border'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{distortion.emoji}</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">{distortion.name}</h4>
            <p className="text-[10px] text-muted-foreground">{distortion.desc}</p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-[10px] font-semibold text-destructive mb-0.5">Example thought:</p>
                  <p className="text-xs text-muted-foreground italic">{distortion.example}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-semibold text-primary mb-0.5">How to reframe:</p>
                  <p className="text-xs text-muted-foreground">{distortion.reframe}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default CBTPage;

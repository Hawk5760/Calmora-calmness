import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Shield, Zap, Smile, Activity, ArrowRight, ClipboardCheck, Sparkles } from 'lucide-react';
import { PHQ9Form } from '@/components/assessments/PHQ9Form';
import { GAD7Form } from '@/components/assessments/GAD7Form';
import { DASS21Form } from '@/components/assessments/DASS21Form';
import { WHO5Form } from '@/components/assessments/WHO5Form';
import { PSSForm } from '@/components/assessments/PSSForm';
import { K10Form } from '@/components/assessments/K10Form';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

type AssessmentType = 'phq9' | 'gad7' | 'dass21' | 'who5' | 'pss' | 'k10' | null;

const assessments = [
  { id: 'phq9' as const, title: 'PHQ-9', subtitle: 'Depression Screening', icon: Brain, description: '9 questions about mood and daily functioning', time: '2-3 min', category: 'clinical', gradient: 'from-feature-journal/10 to-feature-journal/5', iconBg: 'bg-feature-journal/10', iconColor: 'text-feature-journal' },
  { id: 'gad7' as const, title: 'GAD-7', subtitle: 'Anxiety Screening', icon: Heart, description: '7 questions about anxiety symptoms', time: '2-3 min', category: 'clinical', gradient: 'from-feature-mood/10 to-feature-mood/5', iconBg: 'bg-feature-mood/10', iconColor: 'text-feature-mood' },
  { id: 'dass21' as const, title: 'DASS-21', subtitle: 'Depression, Anxiety & Stress', icon: Activity, description: '21 questions covering depression, anxiety, and stress', time: '5-7 min', category: 'clinical', gradient: 'from-feature-chat/10 to-feature-chat/5', iconBg: 'bg-feature-chat/10', iconColor: 'text-feature-chat' },
  { id: 'who5' as const, title: 'WHO-5', subtitle: 'Wellbeing Index', icon: Smile, description: '5 questions about your overall wellbeing', time: '1-2 min', category: 'self', gradient: 'from-feature-mindfulness/10 to-feature-mindfulness/5', iconBg: 'bg-feature-mindfulness/10', iconColor: 'text-feature-mindfulness' },
  { id: 'pss' as const, title: 'PSS-10', subtitle: 'Perceived Stress Scale', icon: Zap, description: '10 questions about perceived stress levels', time: '3-4 min', category: 'self', gradient: 'from-status-warning/10 to-status-warning/5', iconBg: 'bg-status-warning/10', iconColor: 'text-status-warning' },
  { id: 'k10' as const, title: 'K-10', subtitle: 'Psychological Distress', icon: Shield, description: '10 questions about psychological distress', time: '3-4 min', category: 'clinical', gradient: 'from-primary/10 to-primary/5', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
];

export default function AssessmentsPage() {
  const [selected, setSelected] = useState<AssessmentType>(null);

  if (selected === 'phq9') return <PHQ9Form onBack={() => setSelected(null)} />;
  if (selected === 'gad7') return <GAD7Form onBack={() => setSelected(null)} />;
  if (selected === 'dass21') return <DASS21Form onBack={() => setSelected(null)} />;
  if (selected === 'who5') return <WHO5Form onBack={() => setSelected(null)} />;
  if (selected === 'pss') return <PSSForm onBack={() => setSelected(null)} />;
  if (selected === 'k10') return <K10Form onBack={() => setSelected(null)} />;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Validated Screenings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gradient-soul">Psychological Self-Assessment</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Take validated screenings to understand your mental health. Choose from clinical or self-assessment tools.
          </p>
        </motion.div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 rounded-full p-1">
            <TabsTrigger value="all" className="rounded-full text-xs sm:text-sm">All Tests</TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-full text-xs sm:text-sm">Clinical</TabsTrigger>
            <TabsTrigger value="self" className="rounded-full text-xs sm:text-sm">Self-Assessment</TabsTrigger>
          </TabsList>

          {['all', 'clinical', 'self'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                {assessments.filter(a => tab === 'all' || a.category === tab).map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card
                        className={`group cursor-pointer border-border/50 bg-gradient-to-br ${a.gradient} hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden relative`}
                        onClick={() => setSelected(a.id)}
                      >
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[40px]" />

                        <CardHeader className="pb-2 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 ${a.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icon className={`h-5 w-5 ${a.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">{a.title}</CardTitle>
                                <Badge variant="outline" className="text-[10px] rounded-full border-border/50">{a.time}</Badge>
                              </div>
                              <CardDescription className="text-xs">{a.subtitle}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 relative z-10">
                          <p className="text-xs text-muted-foreground mb-3">{a.description}</p>
                          <Button size="sm" className="w-full rounded-full gap-2 group-hover:shadow-md transition-shadow text-xs">
                            Start Assessment <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-8 bg-muted/30 border-border/30 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center flex-shrink-0">
                   <Shield className="w-4 h-4 text-status-warning" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground text-sm mb-1">Important Information</p>
                  <p>• These are screening tools, not diagnostic instruments.</p>
                  <p>• Your responses are confidential and stored anonymously.</p>
                  <p>• If you're experiencing a crisis, please contact emergency services.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}

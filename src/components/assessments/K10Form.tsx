import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentResults } from './AssessmentResults';
import { ArrowLeft } from 'lucide-react';

const questions = [
  "How often did you feel tired out for no good reason?",
  "How often did you feel nervous?",
  "How often did you feel so nervous nothing could calm you down?",
  "How often did you feel hopeless?",
  "How often did you feel restless or fidgety?",
  "How often did you feel so restless you could not sit still?",
  "How often did you feel depressed?",
  "How often did you feel that everything was an effort?",
  "How often did you feel so sad nothing could cheer you up?",
  "How often did you feel worthless?",
];
const options = [
  { value: "1", label: "None of the time" }, { value: "2", label: "A little of the time" },
  { value: "3", label: "Some of the time" }, { value: "4", label: "Most of the time" }, { value: "5", label: "All of the time" },
];

interface Props { onBack: () => void; }

export function K10Form({ onBack }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const allAnswered = questions.every((_, i) => responses[i] !== undefined);
  const score = () => Object.values(responses).reduce((s, v) => s + parseInt(v || "1"), 0);

  if (showResults) {
    const s = score();
    const sev = s <= 19 ? 'low' : s <= 24 ? 'moderate' : s <= 29 ? 'high' : 'critical' as const;
    return <AssessmentResults results={{
      type: 'K-10', score: s, severity: sev, requiresIntervention: sev === 'critical',
      interpretation: s <= 19 ? 'Likely Well' : s <= 24 ? 'Mild Distress' : s <= 29 ? 'Moderate Distress' : 'Severe Distress',
      recommendations: [
        s <= 19 ? "✅ You're likely well. Continue your wellness practices." : s <= 24 ? "💭 Mild distress — monitor and talk to someone you trust." : "🤝 Consider reaching out to a mental health professional.",
        "🧘 Our Mindfulness tools can help manage distress.",
        s >= 30 ? "📞 If you're in crisis, please contact our Crisis Support." : "📝 Regular check-ins help track your wellbeing over time."
      ]
    }} onBack={onBack} />;
  }

  return (
    <PageLayout><div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
      <Card><CardHeader><CardTitle>K-10 Psychological Distress Scale</CardTitle><CardDescription>Over the past 30 days, how often did you experience the following?</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, i) => (<div key={i} className="space-y-3"><p className="font-medium text-sm">{i + 1}. {q}</p>
            <RadioGroup value={responses[i]} onValueChange={v => setResponses(p => ({ ...p, [i]: v }))}>
              {options.map(o => (<div key={o.value} className="flex items-center space-x-2"><RadioGroupItem value={o.value} id={`k${i}-${o.value}`} /><Label htmlFor={`k${i}-${o.value}`} className="text-sm">{o.label}</Label></div>))}
            </RadioGroup></div>))}
          <Button onClick={() => setShowResults(true)} disabled={!allAnswered} className="w-full">View Results</Button>
        </CardContent></Card>
    </div></PageLayout>
  );
}

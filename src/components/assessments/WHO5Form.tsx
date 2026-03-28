import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentResults } from './AssessmentResults';
import { ArrowLeft } from 'lucide-react';

const questions = [
  "I have felt cheerful and in good spirits", "I have felt calm and relaxed",
  "I have felt active and vigorous", "I woke up feeling fresh and rested",
  "My daily life has been filled with things that interest me",
];
const options = [
  { value: "5", label: "All of the time" }, { value: "4", label: "Most of the time" },
  { value: "3", label: "More than half the time" }, { value: "2", label: "Less than half the time" },
  { value: "1", label: "Some of the time" }, { value: "0", label: "At no time" },
];

interface Props { onBack: () => void; }

export function WHO5Form({ onBack }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const allAnswered = questions.every((_, i) => responses[i] !== undefined);
  const score = () => Object.values(responses).reduce((s, v) => s + parseInt(v || "0"), 0) * 4;

  if (showResults) {
    const s = score();
    const sev = s >= 50 ? 'low' : s >= 28 ? 'moderate' : s >= 13 ? 'high' : 'critical' as const;
    return <AssessmentResults results={{
      type: 'WHO-5 Wellbeing', score: s, severity: sev, requiresIntervention: sev === 'critical',
      interpretation: s >= 50 ? 'Good Wellbeing' : s >= 28 ? 'Low Wellbeing' : 'Very Low Wellbeing',
      recommendations: [
        s >= 50 ? "✅ Your wellbeing is good! Keep up your healthy habits." : "💙 Consider adding more joyful activities to your routine.",
        s < 28 ? "🤝 Consider speaking with a mental health professional." : "🌱 Regular self-care can help maintain your wellbeing.",
        `📊 Your score: ${s}/100 — higher is better.`
      ]
    }} onBack={onBack} />;
  }

  return (
    <PageLayout><div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
      <Card><CardHeader><CardTitle>WHO-5 Wellbeing Index</CardTitle><CardDescription>Over the last 2 weeks, how often have you experienced the following?</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, i) => (<div key={i} className="space-y-3"><p className="font-medium text-sm">{i + 1}. {q}</p>
            <RadioGroup value={responses[i]} onValueChange={v => setResponses(p => ({ ...p, [i]: v }))}>
              {options.map(o => (<div key={o.value} className="flex items-center space-x-2"><RadioGroupItem value={o.value} id={`w${i}-${o.value}`} /><Label htmlFor={`w${i}-${o.value}`} className="text-sm">{o.label}</Label></div>))}
            </RadioGroup></div>))}
          <Button onClick={() => setShowResults(true)} disabled={!allAnswered} className="w-full">View Results</Button>
        </CardContent></Card>
    </div></PageLayout>
  );
}

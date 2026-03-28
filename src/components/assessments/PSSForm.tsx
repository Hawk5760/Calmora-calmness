import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentResults } from './AssessmentResults';
import { ArrowLeft } from 'lucide-react';

const questions = [
  "How often have you been upset because of something unexpected?",
  "How often have you felt unable to control important things?",
  "How often have you felt nervous and stressed?",
  "How often have you felt confident about handling personal problems?",
  "How often have you felt things were going your way?",
  "How often have you found you could not cope with everything?",
  "How often have you been able to control irritations?",
  "How often have you felt on top of things?",
  "How often have you been angered by things outside your control?",
  "How often have you felt difficulties piling up too high?",
];
const reverseItems = [3, 4, 6, 7];
const options = [
  { value: "0", label: "Never" }, { value: "1", label: "Almost Never" },
  { value: "2", label: "Sometimes" }, { value: "3", label: "Fairly Often" }, { value: "4", label: "Very Often" },
];

interface Props { onBack: () => void; }

export function PSSForm({ onBack }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const allAnswered = questions.every((_, i) => responses[i] !== undefined);
  const score = () => questions.reduce((s, _, i) => { const v = parseInt(responses[i] || "0"); return s + (reverseItems.includes(i) ? 4 - v : v); }, 0);

  if (showResults) {
    const s = score();
    const sev = s <= 13 ? 'low' : s <= 26 ? 'moderate' : 'high' as const;
    return <AssessmentResults results={{
      type: 'PSS-10', score: s, severity: sev, requiresIntervention: false,
      interpretation: s <= 13 ? 'Low Stress' : s <= 26 ? 'Moderate Stress' : 'High Stress',
      recommendations: [
        s <= 13 ? "✅ Low stress — you're managing well!" : s <= 26 ? "💭 Moderate stress — consider mindfulness techniques." : "⚡ High stress — prioritize self-care and seek support.",
        "🧘 Try our Mindfulness feature for breathing exercises.",
        "📝 Journaling can help process stressful thoughts."
      ]
    }} onBack={onBack} />;
  }

  return (
    <PageLayout><div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
      <Card><CardHeader><CardTitle>Perceived Stress Scale (PSS-10)</CardTitle><CardDescription>In the last month, how often have you experienced the following?</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          {questions.map((q, i) => (<div key={i} className="space-y-3"><p className="font-medium text-sm">{i + 1}. {q}</p>
            <RadioGroup value={responses[i]} onValueChange={v => setResponses(p => ({ ...p, [i]: v }))}>
              {options.map(o => (<div key={o.value} className="flex items-center space-x-2"><RadioGroupItem value={o.value} id={`p${i}-${o.value}`} /><Label htmlFor={`p${i}-${o.value}`} className="text-sm">{o.label}</Label></div>))}
            </RadioGroup></div>))}
          <Button onClick={() => setShowResults(true)} disabled={!allAnswered} className="w-full">View Results</Button>
        </CardContent></Card>
    </div></PageLayout>
  );
}

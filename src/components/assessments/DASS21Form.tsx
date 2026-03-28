import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PageLayout } from '@/components/layout/PageLayout';
import { AssessmentResults } from './AssessmentResults';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const dass21Questions = [
  "I found it hard to wind down", "I was aware of dryness of my mouth",
  "I couldn't seem to experience any positive feeling at all", "I experienced breathing difficulty",
  "I found it difficult to work up the initiative to do things", "I tended to over-react to situations",
  "I experienced trembling (e.g., in the hands)", "I felt that I was using a lot of nervous energy",
  "I was worried about situations in which I might panic", "I felt that I had nothing to look forward to",
  "I found myself getting agitated", "I found it difficult to relax",
  "I felt down-hearted and blue", "I was intolerant of anything that kept me from getting on",
  "I felt I was close to panic", "I was unable to become enthusiastic about anything",
  "I felt I wasn't worth much as a person", "I felt that I was rather touchy",
  "I was aware of my heart in the absence of physical exertion", "I felt scared without any good reason",
  "I felt that life was meaningless",
];

const depressionItems = [2, 4, 9, 12, 15, 16, 20];
const anxietyItems = [1, 3, 6, 8, 14, 18, 19];
const stressItems = [0, 5, 7, 10, 11, 13, 17];

const options = [
  { value: "0", label: "Did not apply to me at all" },
  { value: "1", label: "Applied to me to some degree" },
  { value: "2", label: "Applied to me a considerable degree" },
  { value: "3", label: "Applied to me very much" },
];

interface Props { onBack: () => void; }

export function DASS21Form({ onBack }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const qPerPage = 7;
  const totalPages = Math.ceil(dass21Questions.length / qPerPage);
  const startIdx = currentPage * qPerPage;
  const pageQs = dass21Questions.slice(startIdx, startIdx + qPerPage);
  const allAnswered = dass21Questions.every((_, i) => responses[i] !== undefined);
  const pageAnswered = pageQs.every((_, i) => responses[startIdx + i] !== undefined);

  const calculate = () => {
    const g = (items: number[]) => items.reduce((s, i) => s + parseInt(responses[i] || "0") * 2, 0);
    return { d: g(depressionItems), a: g(anxietyItems), s: g(stressItems), total: Object.values(responses).reduce((s, v) => s + parseInt(v) * 2, 0) };
  };

  if (showResults) {
    const sc = calculate();
    const sev = sc.d >= 28 ? 'critical' : sc.d >= 21 ? 'high' : sc.d >= 14 ? 'moderate' : 'low' as const;
    return <AssessmentResults results={{
      type: 'DASS-21', score: sc.total, severity: sev, requiresIntervention: sev === 'critical',
      interpretation: `Depression: ${sc.d}, Anxiety: ${sc.a}, Stress: ${sc.s}`,
      recommendations: [
        sc.d >= 14 ? "🧠 Your depression scores suggest professional support may help." : "✅ Depression scores are within normal range.",
        sc.a >= 10 ? "💭 Elevated anxiety — try relaxation techniques." : "✅ Anxiety scores are within normal range.",
        sc.s >= 19 ? "⚡ High stress — prioritize self-care and boundaries." : "✅ Stress scores are manageable."
      ]
    }} onBack={onBack} />;
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <Card>
          <CardHeader>
            <CardTitle>DASS-21 Assessment</CardTitle>
            <CardDescription>Page {currentPage + 1}/{totalPages} — Rate each statement over the past week.</CardDescription>
            <Progress value={((currentPage + 1) / totalPages) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {pageQs.map((q, i) => { const qi = startIdx + i; return (
              <div key={qi} className="space-y-3">
                <p className="font-medium text-sm">{qi + 1}. {q}</p>
                <RadioGroup value={responses[qi]} onValueChange={(v) => setResponses(p => ({ ...p, [qi]: v }))}>
                  {options.map(o => (<div key={o.value} className="flex items-center space-x-2"><RadioGroupItem value={o.value} id={`d${qi}-${o.value}`} /><Label htmlFor={`d${qi}-${o.value}`} className="text-sm">{o.label}</Label></div>))}
                </RadioGroup>
              </div>
            ); })}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}><ArrowLeft className="w-4 h-4 mr-2" /> Previous</Button>
              {currentPage < totalPages - 1 ? <Button onClick={() => setCurrentPage(p => p + 1)} disabled={!pageAnswered}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
              : <Button onClick={() => setShowResults(true)} disabled={!allAnswered}>View Results</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

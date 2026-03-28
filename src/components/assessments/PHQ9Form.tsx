import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssessmentResults } from './AssessmentResults';

interface PHQ9FormProps {
  onBack: () => void;
}

const questions = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way'
];

const options = [
  { value: '0', label: 'Not at all' },
  { value: '1', label: 'Several days' },
  { value: '2', label: 'More than half the days' },
  { value: '3', label: 'Nearly every day' }
];

export function PHQ9Form({ onBack }: PHQ9FormProps) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    return Object.values(responses).reduce((sum, val) => sum + parseInt(val), 0);
  };

  const getSeverity = (score: number): 'low' | 'moderate' | 'high' | 'critical' => {
    if (score <= 4) return 'low';
    if (score <= 9) return 'low';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'high';
    return 'critical';
  };

  const getInterpretation = (score: number): string => {
    if (score <= 4) return 'Minimal depression';
    if (score <= 9) return 'Mild depression';
    if (score <= 14) return 'Moderate depression';
    if (score <= 19) return 'Moderately severe depression';
    return 'Severe depression';
  };

  const getRecommendations = (score: number, hasSuicidalThoughts: boolean): string[] => {
    const recommendations = [];
    
    if (hasSuicidalThoughts || score >= 15) {
      recommendations.push('⚠️ Contact crisis hotline immediately');
      recommendations.push('📞 Book an appointment with a counselor urgently');
    }
    
    if (score >= 10) {
      recommendations.push('🏥 Consider booking a counseling session');
      recommendations.push('📚 Explore our self-help modules');
      recommendations.push('🌱 Practice daily mindfulness exercises');
    } else if (score >= 5) {
      recommendations.push('📚 Try our self-help resources');
      recommendations.push('🧘 Engage in mindfulness activities');
      recommendations.push('💬 Consider talking to Mindo');
    } else {
      recommendations.push('✅ Continue maintaining your mental wellness');
      recommendations.push('🌿 Keep up with your self-care routine');
      recommendations.push('🎯 Use our mood tracking features');
    }
    
    return recommendations;
  };

  const handleSubmit = async () => {
    if (Object.keys(responses).length < questions.length) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Assessment',
        description: 'Please answer all questions before submitting.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const score = calculateScore();
      const severity = getSeverity(score);
      const interpretation = getInterpretation(score);
      const hasSuicidalThoughts = responses[8] !== '0';
      const recommendations = getRecommendations(score, hasSuicidalThoughts);
      const requiresIntervention = score >= 15 || hasSuicidalThoughts;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please log in to save your assessment.'
        });
        return;
      }

      const { error } = await supabase.from('psychological_assessments').insert({
        user_id: user.id,
        assessment_type: 'phq9',
        responses: responses,
        score: score,
        severity: severity,
        recommendations: recommendations.join('\n'),
        requires_intervention: requiresIntervention
      });

      if (error) throw error;

      setResults({
        type: 'PHQ-9',
        score,
        interpretation,
        severity,
        recommendations,
        requiresIntervention,
        hasSuicidalThoughts
      });

      toast({
        title: 'Assessment Completed',
        description: 'Your results have been saved securely.'
      });
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save assessment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (results) {
    return <AssessmentResults results={results} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>PHQ-9 Depression Screening</CardTitle>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by any of the following problems?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {questions.map((question, index) => (
              <div key={index} className="space-y-3">
                <Label className="text-base font-medium">
                  {index + 1}. {question}
                </Label>
                <RadioGroup
                  value={responses[index]}
                  onValueChange={(value) => handleResponseChange(index, value)}
                >
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`q${index}-${option.value}`} />
                      <Label htmlFor={`q${index}-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(responses).length < questions.length}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

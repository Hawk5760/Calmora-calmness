import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssessmentResults } from './AssessmentResults';

interface GAD7FormProps {
  onBack: () => void;
}

const questions = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen'
];

const options = [
  { value: '0', label: 'Not at all' },
  { value: '1', label: 'Several days' },
  { value: '2', label: 'More than half the days' },
  { value: '3', label: 'Nearly every day' }
];

export function GAD7Form({ onBack }: GAD7FormProps) {
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
    return 'high';
  };

  const getInterpretation = (score: number): string => {
    if (score <= 4) return 'Minimal anxiety';
    if (score <= 9) return 'Mild anxiety';
    if (score <= 14) return 'Moderate anxiety';
    return 'Severe anxiety';
  };

  const getRecommendations = (score: number): string[] => {
    const recommendations = [];
    
    if (score >= 15) {
      recommendations.push('⚠️ Consider booking a counseling session urgently');
      recommendations.push('📞 Contact crisis hotline if needed');
      recommendations.push('🧘 Practice breathing exercises daily');
    }
    
    if (score >= 10) {
      recommendations.push('🏥 Consider professional counseling');
      recommendations.push('📚 Explore anxiety management modules');
      recommendations.push('🌱 Try our mindfulness exercises');
      recommendations.push('💬 Use Mindo for support');
    } else if (score >= 5) {
      recommendations.push('📚 Try our self-help resources');
      recommendations.push('🧘 Engage in relaxation activities');
      recommendations.push('🎯 Track your anxiety patterns');
      recommendations.push('💬 Chat with our AI wellness buddy');
    } else {
      recommendations.push('✅ Continue your wellness practices');
      recommendations.push('🌿 Maintain your self-care routine');
      recommendations.push('🎯 Use mood tracking to stay aware');
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
      const recommendations = getRecommendations(score);
      const requiresIntervention = score >= 15;

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
        assessment_type: 'gad7',
        responses: responses,
        score: score,
        severity: severity,
        recommendations: recommendations.join('\n'),
        requires_intervention: requiresIntervention
      });

      if (error) throw error;

      setResults({
        type: 'GAD-7',
        score,
        interpretation,
        severity,
        recommendations,
        requiresIntervention
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
            <CardTitle>GAD-7 Anxiety Screening</CardTitle>
            <CardDescription>
              Over the last 2 weeks, how often have you been bothered by the following problems?
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

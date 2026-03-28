import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Phone, BookOpen, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssessmentResultsProps {
  results: {
    type: string;
    score: number;
    interpretation: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    recommendations: string[];
    requiresIntervention: boolean;
    hasSuicidalThoughts?: boolean;
  };
  onBack: () => void;
}

export function AssessmentResults({ results, onBack }: AssessmentResultsProps) {
  const navigate = useNavigate();

  const getSeverityColor = () => {
    switch (results.severity) {
      case 'low': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'high': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'critical': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-muted';
    }
  };

  const maxScore = results.type === 'PHQ-9' ? 27 : 21;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>

        {(results.requiresIntervention || results.hasSuicidalThoughts) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Immediate Support Recommended</AlertTitle>
            <AlertDescription>
              Your responses indicate you may benefit from immediate professional support. 
              Please reach out to a counselor or crisis hotline.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {results.type} Results
              <Badge className={getSeverityColor()}>
                {results.interpretation}
              </Badge>
            </CardTitle>
            <CardDescription>
              Your assessment has been completed and saved securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary mb-2">
                {results.score}
              </div>
              <div className="text-muted-foreground">
                out of {maxScore} points
              </div>
              <div className="mt-4 text-lg font-medium">
                {results.interpretation}
              </div>
            </div>

            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  results.severity === 'low' ? 'bg-green-500' :
                  results.severity === 'moderate' ? 'bg-yellow-500' :
                  results.severity === 'high' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(results.score / maxScore) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your assessment, here are some steps you can take:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">{rec.charAt(0)}</div>
                <div className="flex-1">{rec.slice(2)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Take Action Now</CardTitle>
            <CardDescription>
              Access our mental wellness resources and support services
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {results.requiresIntervention && (
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => window.location.href = 'tel:988'}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Crisis Hotline (988)
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/mindfulness')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Explore Self-Help Modules
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/chat')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Talk to AI Wellness Buddy
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                navigate('/dashboard');
                // Add a small delay to allow navigation, then scroll to counseling tab
                setTimeout(() => {
                  const counselingTab = document.querySelector('[value="counseling"]') as HTMLButtonElement;
                  if (counselingTab) counselingTab.click();
                }, 300);
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Counseling Session
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Your results are stored anonymously and securely.</p>
          <p>You can retake this assessment anytime from the Assessments page.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Send, RefreshCw, AlertTriangle, Brain, Heart, Sparkles, MessageCircle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";

type Stage = "diagnostic" | "results" | "chat";

interface DiagnosticAnswers {
  symptoms: string[];
  duration: string;
  impact: string[];
  triggers: string[];
}

interface DiagnosisResult {
  primaryCondition: string;
  conditionDescription: string;
  confidence: string;
  otherConditions: string[];
  compassionateMessage: string;
  supportSuggestions: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const diagnosticQuestions = [
  {
    id: "symptoms",
    question: "What symptoms or feelings have you been experiencing?",
    description: "Select all that apply",
    icon: Heart,
    multiSelect: true,
    options: [
      "Feeling anxious or worried",
      "Persistent sadness or low mood",
      "Trouble sleeping or insomnia",
      "Racing thoughts or overthinking",
      "Feeling overwhelmed or stressed",
      "Lack of motivation or energy",
      "Feeling lonely or isolated",
      "Panic attacks or intense fear",
      "Difficulty concentrating",
      "Irritability or mood swings",
    ],
  },
  {
    id: "duration",
    question: "How long have you been experiencing these symptoms?",
    description: "Select one option",
    icon: Brain,
    multiSelect: false,
    options: [
      "Just a few days",
      "About a week",
      "2-4 weeks",
      "1-3 months",
      "More than 3 months",
      "On and off for a long time",
    ],
  },
  {
    id: "impact",
    question: "How are these symptoms affecting your daily life?",
    description: "Select all that apply",
    icon: Sparkles,
    multiSelect: true,
    options: [
      "Difficulty working or studying",
      "Trouble maintaining relationships",
      "Avoiding social situations",
      "Changes in eating habits",
      "Physical symptoms (headaches, fatigue)",
      "Difficulty making decisions",
      "Neglecting self-care",
      "Loss of interest in hobbies",
      "Affecting my sleep quality",
      "Not much impact yet",
    ],
  },
  {
    id: "triggers",
    question: "Are there any specific events or situations that trigger these feelings?",
    description: "Select all that apply",
    icon: MessageCircle,
    multiSelect: true,
    options: [
      "Work or academic stress",
      "Relationship issues",
      "Financial concerns",
      "Health worries",
      "Family problems",
      "Major life changes",
      "Trauma or past experiences",
      "Social situations",
      "No specific triggers",
      "Not sure what triggers it",
    ],
  },
];

export default function AISupportPage() {
  const [stage, setStage] = useState<Stage>("diagnostic");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({
    symptoms: [],
    duration: "",
    impact: [],
    triggers: [],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleOptionSelect = (option: string) => {
    const questionData = diagnosticQuestions[currentQuestion];
    const questionId = questionData.id as keyof DiagnosticAnswers;

    if (questionData.multiSelect) {
      setAnswers((prev) => {
        const currentSelection = prev[questionId] as string[];
        if (currentSelection.includes(option)) {
          return { ...prev, [questionId]: currentSelection.filter((o) => o !== option) };
        } else {
          return { ...prev, [questionId]: [...currentSelection, option] };
        }
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: option }));
    }
  };

  const isOptionSelected = (option: string) => {
    const questionData = diagnosticQuestions[currentQuestion];
    const questionId = questionData.id as keyof DiagnosticAnswers;
    const currentAnswer = answers[questionId];

    if (questionData.multiSelect) {
      return (currentAnswer as string[]).includes(option);
    }
    return currentAnswer === option;
  };

  const canProceed = () => {
    const questionData = diagnosticQuestions[currentQuestion];
    const questionId = questionData.id as keyof DiagnosticAnswers;
    const currentAnswer = answers[questionId];

    if (questionData.multiSelect) {
      return (currentAnswer as string[]).length > 0;
    }
    return currentAnswer !== "";
  };

  const handleNext = () => {
    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      analyzeDiagnosis();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const analyzeDiagnosis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-support-diagnosis", {
        body: { answers },
      });

      if (error) throw error;

      setDiagnosisResult(data);
      setSelectedCondition(data.primaryCondition);
      setStage("results");
    } catch (error) {
      console.error("Diagnosis error:", error);
      toast.error("Unable to analyze your responses. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startChat = (condition?: string) => {
    const conditionToUse = condition || selectedCondition;
    setSelectedCondition(conditionToUse);
    setChatMessages([
      {
        role: "assistant",
        content: `I understand you may be experiencing ${conditionToUse}. I'm here to provide compassionate support and guidance. Remember, I'm an AI assistant and not a replacement for professional mental health care. How can I help you today?`,
      },
    ]);
    setStage("chat");
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-support-chat", {
        body: {
          message: userMessage,
          condition: selectedCondition,
          history: chatMessages,
        },
      });

      if (error) throw error;

      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Unable to get a response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const startOver = () => {
    setStage("diagnostic");
    setCurrentQuestion(0);
    setAnswers({ symptoms: [], duration: "", impact: [], triggers: [] });
    setDiagnosisResult(null);
    setChatMessages([]);
    setSelectedCondition("");
  };

  const currentQuestionData = diagnosticQuestions[currentQuestion];
  const CurrentIcon = currentQuestionData?.icon;

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient-soul">AI Support Flow</h1>
          <p className="text-muted-foreground">
            {stage === "diagnostic" && "Let's understand what you're experiencing"}
            {stage === "results" && "Here's what we found"}
            {stage === "chat" && `Support for ${selectedCondition}`}
          </p>
        </div>

        {/* Stage 1: Diagnostic Q&A */}
        {stage === "diagnostic" && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CurrentIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {diagnosticQuestions.length}
                  </p>
                  <Progress value={progress} className="w-48 h-2 mt-1" />
                </div>
              </div>
              <CardTitle className="text-xl">{currentQuestionData.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{currentQuestionData.description}</p>
              <div className="grid gap-2">
                {currentQuestionData.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isOptionSelected(option)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/50 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isOptionSelected(option)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isOptionSelected(option) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm">{option}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : currentQuestion === diagnosticQuestions.length - 1 ? (
                    <>
                      Get Results
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage 2: Emotional Risk Screening Results */}
        {stage === "results" && diagnosisResult && (
          <div className="space-y-6">
            {/* Disclaimer - India-friendly */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400">Important Note / ध्यान दें</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Yeh ek emotional wellness screening hai, medical diagnosis nahi. Professional support ke liye 
                    qualified mental health expert se baat karein. This screening helps identify emotional patterns, 
                    not clinical conditions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Compassionate Message */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{diagnosisResult.compassionateMessage}</p>
                </div>
              </CardContent>
            </Card>

            {/* Primary Concern - Reworded */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Emotional Wellness Screening
                </CardTitle>
                <CardDescription>Aapke responses ke basis par</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Pattern Identified: {diagnosisResult.primaryCondition}
                  </h3>
                  <p className="text-muted-foreground">{diagnosisResult.conditionDescription}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pattern Strength: {diagnosisResult.confidence}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">Wellness Suggestions / सुझाव:</h4>
                  <ul className="space-y-2">
                    {diagnosisResult.supportSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={() => startChat()} className="w-full mt-4">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat about {diagnosisResult.primaryCondition}
                </Button>
              </CardContent>
            </Card>

            {/* Other Patterns */}
            {diagnosisResult.otherConditions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Patterns to Explore</CardTitle>
                  <CardDescription>
                    Aap in areas ko bhi explore kar sakte hain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {diagnosisResult.otherConditions.map((condition) => (
                      <Button
                        key={condition}
                        variant="outline"
                        size="sm"
                        onClick={() => startChat(condition)}
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Crisis Support Link */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">Need to talk to someone?</p>
                    <p className="text-sm text-muted-foreground">Free, confidential helplines available 24/7</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-emerald-500 text-emerald-700">
                    <a href="/crisis-support">View Helplines</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button variant="ghost" onClick={startOver} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        {/* Stage 3: Condition-Specific Chat */}
        {stage === "chat" && (
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    {selectedCondition} Support
                  </CardTitle>
                  <CardDescription>AI-powered compassionate guidance</CardDescription>
                </div>
                <div className="flex gap-2">
                  {diagnosisResult?.otherConditions.map((condition) => (
                    <Button
                      key={condition}
                      variant="ghost"
                      size="sm"
                      onClick={() => startChat(condition)}
                      className="text-xs"
                    >
                      Try {condition}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={startOver}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!chatInput.trim() || isSending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

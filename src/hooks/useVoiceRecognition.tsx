import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Add type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceRecognitionReturn {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcript: string;
  error: string | null;
}

export const useVoiceRecognition = (
  onTranscript?: (transcript: string) => void
): UseVoiceRecognitionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const errorMsg = 'Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.';
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Available",
        description: errorMsg,
      });
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      // Configure recognition settings
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can be made configurable later
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Listening...",
          description: "I'm listening to your voice. Speak clearly.",
        });
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        // Dispatch custom event for global crisis detection
        window.dispatchEvent(new CustomEvent('calmora-voice-input', { detail: { text: fullTranscript } }));

        // If we have a final result, call the callback
        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'An error occurred during speech recognition.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found or permission denied.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
        }
        
        setError(errorMessage);
        setIsRecording(false);
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: errorMessage,
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition.');
      setIsRecording(false);
      toast({
        variant: "destructive",
        title: "Recognition Failed",
        description: "Failed to start speech recognition. Please try again.",
      });
    }
  }, [onTranscript, toast]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    error,
  };
};
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface RateLimitOptions {
  featureName?: string;
}

export const useRateLimitHandler = (options: RateLimitOptions = {}) => {
  const { toast } = useToast();
  const { featureName = 'AI' } = options;

  const handleApiError = useCallback((error: any, fallbackFn?: () => void): boolean => {
    const status = error?.status || error?.context?.status || error?.code;
    const message = error?.message || error?.msg || '';

    // Rate limited
    if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
      toast({
        variant: 'destructive',
        title: `${featureName} is busy right now`,
        description: 'Too many requests. Please wait a moment and try again.',
      });
      if (fallbackFn) fallbackFn();
      return true;
    }

    // Payment required / quota exceeded
    if (status === 402 || message.includes('quota') || message.includes('billing') || message.includes('exceeded')) {
      toast({
        variant: 'destructive',
        title: `${featureName} temporarily unavailable`,
        description: 'API quota exceeded. Using offline mode.',
      });
      if (fallbackFn) fallbackFn();
      return true;
    }

    // Service unavailable
    if (status === 503 || status === 502) {
      toast({
        variant: 'destructive',
        title: `${featureName} service is down`,
        description: 'We\'re experiencing issues. Using local fallback.',
      });
      if (fallbackFn) fallbackFn();
      return true;
    }

    return false;
  }, [toast, featureName]);

  return { handleApiError };
};

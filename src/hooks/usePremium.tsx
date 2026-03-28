import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PremiumContextType {
  isPremium: boolean;
  subscription: {
    plan: 'free' | 'premium_monthly' | 'premium_yearly';
    expiresAt: Date | null;
    isActive: boolean;
  } | null;
  isLoading: boolean;
  checkFeatureAccess: (feature: PremiumFeature) => boolean;
  refetchSubscription: () => Promise<void>;
}

export type PremiumFeature = 
  | 'mood_patterns'
  | 'curated_playlists'
  | 'companion_mode'
  | 'unlimited_voice'
  | 'weekly_insights'
  | 'emotional_growth'
  | 'assessment_progress'
  | 'detailed_reports'
  | 'focus_mode'
  | 'sleep_mode'
  | 'exam_mode'
  | 'custom_breathing'
  | 'sleep_guidance'
  | 'advanced_garden'
  | 'unlimited_puzzles'
  | 'smart_reminders'
  | 'long_term_trends'
  | 'all_languages'
  | 'smart_nudges';

const PREMIUM_FEATURES: PremiumFeature[] = [
  'mood_patterns',
  'curated_playlists',
  'companion_mode',
  'unlimited_voice',
  'weekly_insights',
  'emotional_growth',
  'assessment_progress',
  'detailed_reports',
  'focus_mode',
  'sleep_mode',
  'exam_mode',
  'custom_breathing',
  'sleep_guidance',
  'advanced_garden',
  'unlimited_puzzles',
  'smart_reminders',
  'long_term_trends',
  'all_languages',
  'smart_nudges',
];

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<PremiumContextType['subscription']>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setIsPremium(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isActive = data.is_active && 
          (!data.expires_at || new Date(data.expires_at) > new Date());
        
        setSubscription({
          plan: data.plan as 'free' | 'premium_monthly' | 'premium_yearly',
          expiresAt: data.expires_at ? new Date(data.expires_at) : null,
          isActive,
        });
        setIsPremium(isActive && data.plan !== 'free');
      } else {
        setSubscription({
          plan: 'free',
          expiresAt: null,
          isActive: true,
        });
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const checkFeatureAccess = (feature: PremiumFeature): boolean => {
    if (isPremium) return true;
    return !PREMIUM_FEATURES.includes(feature);
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        subscription,
        isLoading,
        checkFeatureAccess,
        refetchSubscription: fetchSubscription,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

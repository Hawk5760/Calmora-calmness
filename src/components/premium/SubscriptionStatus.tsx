import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Calendar, Sparkles, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { PremiumBadge } from './PremiumBadge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SubscriptionStatus = () => {
  const { isPremium, subscription, isLoading, refetchSubscription } = usePremium();
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          plan: 'free',
          is_active: false,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchSubscription();
      toast.success('Subscription cancelled', {
        description: 'Your premium features will remain active until the end of your billing period.',
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-soft animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  if (isPremium && subscription) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Calmora Premium</h3>
                <PremiumBadge size="sm" />
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.plan === 'premium_yearly' ? 'Yearly' : 'Monthly'} Plan
              </span>
            </div>
            {subscription.expiresAt && (
              <p className="text-muted-foreground">
                Renews on {format(subscription.expiresAt, 'MMM dd, yyyy')}
              </p>
            )}
          </div>

          <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
            ✨ All premium features are unlocked!
          </p>

          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Premium Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your Calmora Premium subscription? 
                    You'll lose access to premium features like emotional patterns, detailed reports, 
                    and unlimited access. Your data will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Premium</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Free Plan</h3>
              <p className="text-sm text-muted-foreground">Basic features</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade to Premium for emotional patterns, detailed reports, and unlimited access.
        </p>

        <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
          <Link to="/pricing">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

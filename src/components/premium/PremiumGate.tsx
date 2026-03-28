import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';
import { cn } from '@/lib/utils';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  blurContent?: boolean;
}

export const PremiumGate = ({ 
  feature, 
  children, 
  fallback,
  className,
  blurContent = false 
}: PremiumGateProps) => {
  const { checkFeatureAccess, isLoading } = usePremium();

  if (isLoading) {
    return <div className={className}>{children}</div>;
  }

  if (checkFeatureAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (blurContent) {
    return (
      <div className={cn('relative', className)}>
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <Card className="border-amber-500/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock this feature with Calmora Premium
              </p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                <Link to="/pricing">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/10 dark:to-yellow-950/10', className)}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/20">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <h3 className="font-semibold mb-2">Unlock Premium</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This feature is available with Calmora Premium
        </p>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
          <Link to="/pricing">
            <Crown className="h-4 w-4 mr-2" />
            View Plans
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

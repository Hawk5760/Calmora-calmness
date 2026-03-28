import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumBadge = ({ className, size = 'sm' }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge 
      className={cn(
        'bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 font-medium',
        sizeClasses[size],
        className
      )}
    >
      <Crown className={cn(
        'mr-1',
        size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
      )} />
      Premium
    </Badge>
  );
};

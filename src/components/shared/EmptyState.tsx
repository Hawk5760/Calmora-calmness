import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"
    >
      {icon}
    </motion.div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
    {actionLabel && (
      actionHref ? (
        <Link to={actionHref}>
          <Button className="gap-2 rounded-full">
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ) : onAction ? (
        <Button onClick={onAction} className="gap-2 rounded-full">
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      ) : null
    )}
  </motion.div>
);

import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[300] bg-amber-500 text-amber-950"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>You're offline — some features may not work</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

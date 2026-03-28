import { motion } from 'framer-motion';
import mindoMascotBlue from '@/assets/mindo-mascot-blue.png';

export const EmergencySOSButton = () => {
  const handleClick = () => {
    window.location.href = '/chat?prompt=' + encodeURIComponent("I'm not feeling great right now. Can you help me feel better?");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Talk to Mindo"
    >
      <img src={mindoMascotBlue} alt="Mindo" className="w-6 h-6 object-contain" />
      <span className="text-sm font-semibold hidden sm:inline">Talk to Mindo</span>
      {/* Online pulse */}
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background">
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
      </span>
    </motion.button>
  );
};

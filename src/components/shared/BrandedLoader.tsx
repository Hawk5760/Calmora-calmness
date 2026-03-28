import { motion } from 'framer-motion';

export const BrandedLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="relative"
      >
        <img
          src="/lovable-uploads/12d2bf45-5f26-4fad-a79d-fce873b1aa64.png"
          alt="Calmora"
          className="w-16 h-16 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
        />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Calmora</p>
        <p className="text-xs text-muted-foreground mt-0.5">Loading your safe space…</p>
      </div>
    </div>
  </div>
);

export default BrandedLoader;

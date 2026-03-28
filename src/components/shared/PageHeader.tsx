import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  icon: ReactNode;
  badge: string;
  title: string;
  subtitle?: string;
}

export const PageHeader = ({ icon, badge, title, subtitle }: PageHeaderProps) => (
  <motion.header className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
      {icon}
      <span className="text-xs font-medium text-primary">{badge}</span>
    </div>
    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
    {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{subtitle}</p>}
  </motion.header>
);

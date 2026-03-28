import { PageLayout } from "@/components/layout/PageLayout";
import { SelfHelpModules } from "@/components/selfhelp/SelfHelpModules";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SelfHelpPage() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Evidence-Based Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gradient-soul">Self-Help Modules</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Learn practical techniques to manage your mental health with guided, evidence-based modules
          </p>
        </motion.div>
        <SelfHelpModules />
      </div>
    </PageLayout>
  );
}

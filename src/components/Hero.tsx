import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-bg-new.png";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const features = ["AI-powered mood insights", "Guided journaling", "Mindfulness exercises", "24/7 crisis support"];
  
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Peaceful mountain lake landscape" 
          className="w-full h-full object-cover blur-[2px] scale-[1.02]" 
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/30 to-background" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20 sm:pt-16 pb-16 sm:pb-[130px]">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 rounded-full bg-primary/10 backdrop-blur-sm text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in border-none py-1.5 sm:py-[6px] text-foreground">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Your calm space in a noisy world  
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight text-foreground animate-fade-in text-center">
          {t("app.name")}
        </h1>

        {/* Hindi tagline — dark mode safe */}
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 animate-fade-in font-sans text-foreground/90 pb-6 sm:pb-[60px]">
          "Yahan thoda halka lagta hai"
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 mb-6 sm:mb-8 animate-fade-in px-2">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs sm:text-sm text-foreground whitespace-nowrap"
            >
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in px-4 sm:px-0">
          <Button size="lg" className="w-full sm:w-auto gap-2 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base" asChild>
            <Link to={user ? "/mood" : "/auth"}>
              {user ? "Check In Now" : "Start Your Journey"}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 h-11 sm:h-12 px-6 sm:px-8 bg-card/50 backdrop-blur-sm text-sm sm:text-base" asChild>
            <Link to={user ? "/dashboard" : "/features"}>
              {user ? "View Dashboard" : "Explore Features"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden sm:block" aria-hidden="true" />
    </section>
  );
};

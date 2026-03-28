import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
  comingSoon?: boolean;
  href?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient = "gradient-calm",
  className,
  comingSoon = false,
  href
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "relative group p-8 rounded-3xl shadow-soft hover:shadow-magical transition-gentle bg-card/80 backdrop-blur-sm border border-border/50",
      className
    )}>
      {/* Background Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 rounded-3xl opacity-5 group-hover:opacity-10 transition-gentle",
        gradient
      )} />
      
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-soft">
          Coming Soon
        </div>
      )}
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-bounce">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
        
        {/* Action Button */}
        {href && !comingSoon ? (
          <Link to={href}>
            <Button 
              variant="ghost" 
              className="group-hover:bg-primary/10 transition-gentle"
            >
              Explore
            </Button>
          </Link>
        ) : (
          <Button 
            variant="ghost" 
            className="group-hover:bg-primary/10 transition-gentle"
            disabled={comingSoon}
          >
            {comingSoon ? "Coming Soon" : "Explore"}
          </Button>
        )}
      </div>
    </div>
  );
};
import { ReactNode } from "react";
import { Header } from "./Header";
import { AnimatedPage } from "./AnimatedPage";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmergencySOSButton } from "@/components/EmergencySOSButton";
import pageBg from "@/assets/page-bg.png";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  showBackButton?: boolean;
}

export const PageLayout = ({
  children,
  className,
  fullWidth = false,
  noPadding = false,
  showBackButton = true,
}: PageLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background relative overflow-x-hidden">
      {/* Background Image for feature pages (not home) */}
      {!isHomePage && (
        <>
          <div 
            className="fixed top-0 left-0 w-screen h-screen h-[100dvh] z-0"
            style={{
              backgroundImage: `url(${pageBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              transform: 'scale(1.05)',
            }}
          />
          {/* Blur overlay */}
          <div className="fixed top-0 left-0 w-screen h-screen h-[100dvh] z-0 backdrop-blur-sm bg-background/70" />
        </>
      )}
      
      <Header />
      <main
        className={cn(
          "flex-1 relative z-10",
          !noPadding && "pt-20 md:pt-24 pb-8 md:pb-12",
          !fullWidth && "px-4 sm:px-6 lg:px-8",
          className
        )}
      >
        {!fullWidth ? (
          <div className="max-w-7xl mx-auto w-full">
            {/* Back Button */}
            {showBackButton && !isHomePage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-4 gap-2 text-muted-foreground hover:text-foreground rounded-full border-border/50 backdrop-blur-sm bg-background/40 hover:bg-background/60 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            {children}
          </div>
        ) : (
          <>
            {/* Back Button for full width pages */}
            {showBackButton && !isHomePage && (
              <div className="px-4 sm:px-6 lg:px-8 pt-4">
                <div className="max-w-7xl mx-auto">
                   <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4 gap-2 text-muted-foreground hover:text-foreground rounded-full border-border/50 backdrop-blur-sm bg-background/40 hover:bg-background/60 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>
              </div>
            )}
            {children}
          </>
        )}
      </main>
      <EmergencySOSButton />
    </div>
  );
};

export default PageLayout;

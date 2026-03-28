import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Heart, BookOpen, Wind, Brain, Leaf, MessageCircle, BarChart3, Moon, Menu, Home, LogIn, ClipboardList, Phone, Crown, Search, Calendar, Lightbulb } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Wellness",
    items: [
      { path: "/mood", icon: Heart, label: "navigation.mood" },
      { path: "/journal", icon: BookOpen, label: "navigation.journal" },
      { path: "/mindfulness", icon: Wind, label: "navigation.mindfulness" },
      { path: "/sleep", icon: Moon, label: "navigation.sleepzone" },
    ],
  },
  {
    label: "Activities",
    items: [
      { path: "/sounds", icon: Brain, label: "navigation.wordpuzzle" },
      { path: "/garden", icon: Leaf, label: "navigation.garden" },
      { path: "/chat", icon: MessageCircle, label: "navigation.aibuddy" },
      { path: "/cbt", icon: Lightbulb, label: "CBT Exercises" },
    ],
  },
  {
    label: "Support",
    items: [
      { path: "/dashboard", icon: BarChart3, label: "navigation.dashboard" },
      { path: "/mood-calendar", icon: Calendar, label: "Mood Calendar" },
      { path: "/assessments", icon: ClipboardList, label: "Assessments" },
      { path: "/crisis-support", icon: Phone, label: "Crisis Support" },
    ],
  },
];

const allNavItems = [
  { path: "/", icon: Home, label: "navigation.home" },
  ...navGroups.flatMap(g => g.items),
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { t } = useTranslation();

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const getLabel = (label: string) => {
    if (label.includes('.')) return t(label);
    return label;
  };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !searchQuery || getLabel(item.label).toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.items.length > 0);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Calmora Home">
            <img src="/lovable-uploads/ee0eb6bb-a68f-41e8-8f2a-26c1cf1eee0e.png" alt="Calmora Logo" className="w-8 h-8 rounded-full" />
            <span className={cn(
              "font-bold text-lg hidden sm:inline transition-colors",
              scrolled ? "text-foreground" : "text-foreground"
            )}>Calmora</span>
          </Link>

          {/* Desktop Navigation */}
          <TooltipProvider delayDuration={0}>
            <div className="hidden md:flex items-center gap-0.5">
              {allNavItems.map(item => {
                const Icon = item.icon;
                if (item.path !== "/" && item.path !== "/auth" && !user) return null;
                const label = getLabel(item.label);
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link to={item.path} aria-label={label}>
                        <Button
                          variant={isActive(item.path) ? "soul" : "ghost"}
                          size="sm"
                          className={cn("gap-1.5 px-2.5 py-2 h-9", isActive(item.path) && "font-semibold")}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs hidden lg:inline">{label}</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="lg:hidden">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Premium Button */}
              {user && !isPremium && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/pricing" aria-label="Upgrade to Premium">
                      <Button variant="ghost" size="sm" className="gap-1.5 px-2.5 h-9 bg-gradient-to-r from-status-warning/10 to-status-warning/5 hover:from-status-warning/20 hover:to-status-warning/10">
                        <Crown className="w-4 h-4 text-status-warning" />
                        <span className="text-xs hidden lg:inline text-status-warning">Premium</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upgrade to Premium</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Auth Button or User Menu */}
              {user ? (
                <div className="ml-2">
                  <UserMenu />
                </div>
              ) : (
                <Link to="/auth" aria-label="Sign in">
                  <Button variant="default" size="sm" className="ml-2 gap-1.5 h-9 px-4">
                    <LogIn className="w-4 h-4" />
                    <span className="text-xs">{t('navigation.signIn')}</span>
                  </Button>
                </Link>
              )}
            </div>
          </TooltipProvider>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="p-2.5 min-h-[44px] min-w-[44px]" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] max-w-[320px] overflow-y-auto">
              <div className="flex flex-col gap-3 mt-6 pb-8">
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-full bg-muted/30 border-border/50"
                    aria-label="Search features"
                  />
                </div>

                {/* Home */}
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive("/") ? "soul" : "ghost"}
                    size="lg"
                    className="w-full justify-start gap-3 h-12 text-base"
                  >
                    <Home className="w-5 h-5" />
                    {t('navigation.home')}
                  </Button>
                </Link>

                {/* Grouped Navigation */}
                {filteredGroups.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Badge variant="outline" className="text-[10px] rounded-full font-medium text-muted-foreground">
                        {group.label}
                      </Badge>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      if (item.path !== "/" && item.path !== "/auth" && !user) return null;
                      return (
                        <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                          <Button
                            variant={isActive(item.path) ? "soul" : "ghost"}
                            size="lg"
                            className="w-full justify-start gap-3 h-12 text-base"
                          >
                            <Icon className="w-5 h-5" />
                            {getLabel(item.label)}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                {/* Premium Button in Mobile */}
                {user && !isPremium && (
                  <Link to="/pricing" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full justify-start gap-3 h-12 text-base bg-gradient-to-r from-status-warning/10 to-status-warning/5"
                    >
                      <Crown className="w-5 h-5 text-status-warning" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
                
                {!user && (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="soul" size="lg" className="w-full justify-start gap-3 mt-4 h-12 text-base">
                      <LogIn className="w-5 h-5" />
                      {t('navigation.signIn')}
                    </Button>
                  </Link>
                )}
                
                {user && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <UserMenu />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

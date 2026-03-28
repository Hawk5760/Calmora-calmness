import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle } from
"@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Home,
  Heart,
  BookOpen,
  Wind,
  Brain,
  Leaf,
  MessageCircle,
  BarChart3,
  Moon,
  ClipboardList,
  Phone,
  Crown,
  LogIn,
  ChevronDown,
  Sparkles,
  Users,
  Lightbulb,
  Calendar } from
"lucide-react";
import { cn } from "@/lib/utils";
import calmoraLogo from "@/assets/calmora-logo.png";

const getNavGroups = (t: (key: string) => string) => ({
  wellness: {
    label: t('header.wellness'),
    items: [
    { path: "/mood", icon: Heart, label: t('header.moodDetector'), description: t('header.moodDescription') },
    { path: "/journal", icon: BookOpen, label: t('header.journal'), description: t('header.journalDescription') },
    { path: "/mindfulness", icon: Wind, label: t('header.mindfulness'), description: t('header.mindfulnessDescription') }]

  },
  activities: {
    label: t('header.activities'),
    items: [
    { path: "/sounds", icon: Brain, label: t('header.mindPuzzle'), description: t('header.mindPuzzleDescription') },
    { path: "/sleep", icon: Moon, label: t('header.sleepZone'), description: t('header.sleepZoneDescription') },
    { path: "/garden", icon: Leaf, label: t('header.soulGarden'), description: t('header.soulGardenDescription') },
    { path: "/cbt", icon: Lightbulb, label: "CBT Exercises", description: "Guided cognitive behavioral therapy worksheets" },
    { path: "/dashboard", icon: BarChart3, label: t('navigation.dashboard'), description: "Track your wellness journey" }]

  },
  support: {
    label: t('header.support'),
    items: [
    { path: "/chat", icon: MessageCircle, label: "Mindo", description: "Your supportive AI companion" },
    { path: "/community", icon: Users, label: "Community", description: "Share experiences & support each other" },
    { path: "/self-help", icon: Sparkles, label: "Self-Help Modules", description: "Evidence-based lessons for anxiety, stress & more" },
    { path: "/mood-calendar", icon: Calendar, label: "Mood Calendar", description: "View your mood history as a heatmap" },
    { path: "/assessments", icon: ClipboardList, label: t('header.assessments'), description: t('header.assessmentsDescription') },
    { path: "/crisis-support", icon: Phone, label: t('header.crisisSupport'), description: t('header.crisisSupportDescription') }]

  }
});

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ?
        "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" :
        "bg-transparent"
      )}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img

              alt="Calmora"
              className="h-10 w-10 rounded-full object-cover group-hover:scale-105 transition-transform" src="/lovable-uploads/12d2bf45-5f26-4fad-a79d-fce873b1aa64.png" />

            <span className="text-xl font-bold text-foreground hidden sm:block">
              Calmora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2">
                <Home className="w-4 h-4" />
                {t('navigation.home')}
              </Button>
            </Link>

            {!user &&
            <Link to="/features">
                <Button
                variant={isActive("/features") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Features
                </Button>
              </Link>
            }

            {user &&
            <NavigationMenu>
                <NavigationMenuList>
                  {Object.entries(getNavGroups(t)).map(([key, group]) =>
                <NavigationMenuItem key={key}>
                      <NavigationMenuTrigger className="h-9 px-3 gap-1">
                        {group.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[320px] gap-1 p-2">
                          {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.path}>
                                <NavigationMenuLink asChild>
                                  <Link
                                to={item.path}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
                                  isActive(item.path) && "bg-accent"
                                )}>

                                    <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                                      <Icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">{item.label}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.description}
                                      </div>
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>);

                      })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                )}
                </NavigationMenuList>
              </NavigationMenu>
            }

          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {user && !isPremium &&
            <Link to="/pricing" className="hidden sm:block">
                <Button
                variant="outline"
                size="sm"
                className="gap-2 border-amber-400/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20">

                  <Crown className="w-4 h-4" />
                  <span className="hidden md:inline">{t('header.upgrade')}</span>
                </Button>
              </Link>
            }

            {user ?
            <UserMenu /> :

            <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  {t('navigation.signIn')}
                </Button>
              </Link>
            }

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <MobileNav
                  user={user}
                  isPremium={isPremium}
                  isActive={isActive}
                  onClose={() => setIsOpen(false)} />

              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>);

};

interface MobileNavProps {
  user: any;
  isPremium: boolean;
  isActive: (path: string) => boolean;
  onClose: () => void;
}

const MobileNav = ({ user, isPremium, isActive, onClose }: MobileNavProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { t } = useTranslation();
  const navGroups = getNavGroups(t);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <img

            alt="Calmora"
            className="h-8 w-8 rounded-full object-cover" src="/lovable-uploads/2f5c3001-266d-41dd-bf41-93d53bb53741.png" />

          <span className="text-lg font-bold">{t('app.name')}</span>
        </Link>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
        </SheetClose>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          <Link to="/" onClick={onClose}>
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-11">

              <Home className="w-5 h-5" />
              {t('navigation.home')}
            </Button>
          </Link>

          {!user &&
          <Link to="/features" onClick={onClose}>
              <Button
              variant={isActive("/features") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-11">
                <Sparkles className="w-5 h-5" />
                Features
              </Button>
            </Link>
          }

          {user &&
          <>
              {Object.entries(navGroups).map(([key, group]) =>
            <div key={key} className="pt-2">
                  <button
                onClick={() =>
                setExpandedGroup(expandedGroup === key ? null : key)
                }
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">

                    {group.label}
                    <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    expandedGroup === key && "rotate-180"
                  )} />

                  </button>
                  {expandedGroup === key &&
              <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={onClose}>
                            <Button
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11 pl-6">

                              <Icon className="w-5 h-5" />
                              {item.label}
                            </Button>
                          </Link>);

                })}
                    </div>
              }
                </div>
            )}
            </>
          }
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="p-4 border-t border-border space-y-2">
        {user && !isPremium &&
        <Link to="/pricing" onClick={onClose}>
            <Button
            variant="outline"
            className="w-full gap-2 border-amber-400/50 text-amber-600">

              <Crown className="w-4 h-4" />
              {t('header.upgradeToPremium')}
            </Button>
          </Link>
        }
        {!user &&
        <Link to="/auth" onClick={onClose}>
            <Button variant="default" className="w-full gap-2">
              <LogIn className="w-4 h-4" />
              {t('navigation.signIn')}
            </Button>
          </Link>
        }
        {user &&
        <div className="pt-2">
            <UserMenu />
          </div>
        }
      </div>
    </div>);

};

export default Header;
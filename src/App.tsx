import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PremiumProvider } from "@/hooks/usePremium";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { CrisisDetectionProvider } from "@/components/CrisisDetectionProvider";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { BrandedLoader } from "@/components/shared/BrandedLoader";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const MoodPage = lazy(() => import("./pages/MoodPage").then(m => ({ default: m.MoodPage })));
const JournalPage = lazy(() => import("./pages/JournalPage").then(m => ({ default: m.JournalPage })));
const MindfulnessPage = lazy(() => import("./pages/MindfulnessPage").then(m => ({ default: m.MindfulnessPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const WordPuzzleGame = lazy(() => import("./pages/WordPuzzleGame").then(m => ({ default: m.WordPuzzleGame })));
const GardenPage = lazy(() => import("./pages/GardenPage").then(m => ({ default: m.GardenPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIBuddyPage = lazy(() => import("./pages/AIBuddyPage"));
const SleepZonePage = lazy(() => import("./pages/SleepZonePage"));
const AffirmationsPage = lazy(() => import("./pages/AffirmationsPage").then(m => ({ default: m.AffirmationsPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const AssessmentsPage = lazy(() => import("./pages/AssessmentsPage"));
const CrisisSupportPage = lazy(() => import("./pages/CrisisSupportPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const SelfHelpPage = lazy(() => import("./pages/SelfHelpPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const MoodCalendarPage = lazy(() => import("./pages/MoodCalendarPage").then(m => ({ default: m.MoodCalendarPage })));
const CBTPage = lazy(() => import("./pages/CBTPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => <BrandedLoader />;

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <PremiumProvider>
              <ErrorBoundary>
                <OfflineBanner />
                <Toaster />
                <Sonner />
                <OnboardingFlow />
                <PWAInstallPrompt />
                <CrisisDetectionProvider />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/self-help" element={<ProtectedRoute><SelfHelpPage /></ProtectedRoute>} />
                    <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/mindfulness" element={<ProtectedRoute><MindfulnessPage /></ProtectedRoute>} />
                    <Route path="/sounds" element={<ProtectedRoute><WordPuzzleGame /></ProtectedRoute>} />
                    <Route path="/garden" element={<ProtectedRoute><GardenPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><AIBuddyPage /></ProtectedRoute>} />
                    <Route path="/sleep" element={<ProtectedRoute><SleepZonePage /></ProtectedRoute>} />
                    <Route path="/affirmations" element={<ProtectedRoute><AffirmationsPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                    <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
                    <Route path="/crisis-support" element={<CrisisSupportPage />} />
                    <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                    <Route path="/mood-calendar" element={<ProtectedRoute><MoodCalendarPage /></ProtectedRoute>} />
                    <Route path="/cbt" element={<ProtectedRoute><CBTPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </PremiumProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;

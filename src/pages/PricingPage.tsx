import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown, Check, Sparkles, Heart, Shield, ArrowLeft, Zap, Star,
  Brain, Wind, BookOpen, MessageCircle, BarChart3, Moon, Leaf, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { isPremium, refetchSubscription } = usePremium();
  const navigate = useNavigate();

  const monthlyPrice = 99;
  const yearlyPrice = 899;
  const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
  const savingsPercent = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  const handleSubscribe = async (plan: 'premium_monthly' | 'premium_yearly') => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const expiresAt = new Date();
      if (plan === 'premium_monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
      else expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const amount = plan === 'premium_monthly' ? monthlyPrice : yearlyPrice;

      const { data: existing } = await supabase
        .from('user_subscriptions').select('id').eq('user_id', user.id).maybeSingle();

      const payload = {
        plan, is_active: true, started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(), payment_id: `mock_${Date.now()}`, amount_paid: amount,
      };

      if (existing) {
        const { error } = await supabase.from('user_subscriptions').update(payload).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_subscriptions').insert({ user_id: user.id, ...payload });
        if (error) throw error;
      }

      await refetchSubscription();
      toast.success('🎉 Welcome to Calmora Premium!');
      navigate('/dashboard');
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  const premiumPerks = [
    { icon: Brain, label: 'Mood Patterns & Triggers', desc: 'AI detects emotional trends over time' },
    { icon: Sparkles, label: 'Companion Mode', desc: 'Deep, contextual conversations with Mindo' },
    { icon: BookOpen, label: 'AI Growth Insights', desc: 'Weekly & monthly emotional intelligence reports' },
    { icon: Wind, label: 'Focus, Sleep & Exam Modes', desc: 'Specialized mindfulness for every need' },
    { icon: BarChart3, label: '90-Day Detailed Reports', desc: 'Long-term trends, triggers & progress' },
    { icon: Globe, label: 'All Indian Languages', desc: '10+ languages including regional ones' },
    { icon: Leaf, label: 'Advanced Soul Garden', desc: 'Rare plants, seasons & reward stages' },
    { icon: Moon, label: 'Personalized Sleep Guidance', desc: 'AI-tailored wind-down routines' },
  ];

  const comparisonRows = [
    { feature: 'Mood Detection', free: 'Basic', premium: 'Patterns & Triggers' },
    { feature: 'Mindo AI Chat', free: 'Short replies', premium: 'Full Companion Mode' },
    { feature: 'Journaling', free: 'Daily entries', premium: 'AI Insights & Growth Tips' },
    { feature: 'Assessments', free: 'Score only', premium: 'Progress tracking & explanations' },
    { feature: 'Reports', free: '7-day view', premium: '90-day detailed analytics' },
    { feature: 'Mindfulness', free: 'Calm mode only', premium: 'Focus, Sleep & Exam modes' },
    { feature: 'Breathing', free: 'Fixed duration', premium: 'Custom & guided sessions' },
    { feature: 'Soul Garden', free: 'Basic growth', premium: 'Advanced stages & rewards' },
    { feature: 'Mind Puzzles', free: '1 game/day', premium: 'Unlimited + streaks' },
    { feature: 'Languages', free: 'English & Hindi', premium: 'All 10+ Indian languages' },
    { feature: 'Song Suggestions', free: '1 per mood', premium: 'Curated playlists' },
    { feature: 'Notifications', free: 'Basic reminders', premium: 'Smart emotional nudges' },
  ];

  const alwaysFree = [
    { icon: Shield, label: 'Crisis Support & Helplines' },
    { icon: Heart, label: 'Grounding Exercises' },
    { icon: Star, label: 'Data Privacy & Control' },
    { icon: Zap, label: '2FA Security' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-14 items-center px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <Crown className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Premium</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* ─── Hero ─── */}
        <section className="pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
          <motion.div {...fadeUp(0)}>
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs border-primary/30 text-primary mb-6 gap-1.5">
              <Sparkles className="w-3 h-3" /> Trusted by 10,000+ users
            </Badge>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4 sm:mb-6">
            Free keeps you <span className="text-primary">safe</span>.
            <br />
            Premium helps you <span className="text-primary">grow</span>.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Unlock AI-powered insights, deep emotional tracking, and personalized wellness tools.
          </motion.p>

          {/* ─── Billing Toggle ─── */}
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-primary" />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] rounded-full">
                Save {savingsPercent}%
              </Badge>
            )}
          </motion.div>

          {/* ─── Pricing Cards ─── */}
          <motion.div {...fadeUp(0.3)} className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Free Card */}
            <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Free</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Support in the moment</p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-foreground">₹0</span>
                <span className="text-sm text-muted-foreground ml-1">/forever</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Basic Mood Detection', 'Daily Journaling', 'Mindo (short replies)', '7-day Dashboard', 'Crisis Support'].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl h-11" disabled>
                Current Plan
              </Button>
            </div>

            {/* Premium Card */}
            <div className="relative rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 text-left overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-primary-foreground text-[10px] rounded-full px-2.5 gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> POPULAR
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Premium</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Understand yourself over time</p>

              <div className="mb-6">
                {isYearly ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-extrabold text-foreground">₹{yearlyPrice}</span>
                    <span className="text-sm text-muted-foreground ml-1">/year</span>
                    <p className="text-xs text-muted-foreground mt-1">≈ ₹{yearlyMonthlyEquivalent}/month</p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-extrabold text-foreground">₹{monthlyPrice}</span>
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {['Everything in Free', 'AI emotional patterns', 'Companion Mode chat', '90-day analytics', 'All Indian languages', 'Curated playlists'].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <Button variant="outline" className="w-full rounded-xl h-11 border-primary/30 text-primary" disabled>
                  <Crown className="w-4 h-4 mr-2" /> You're Premium
                </Button>
              ) : (
                <Button
                  className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleSubscribe(isYearly ? 'premium_yearly' : 'premium_monthly')}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {isYearly ? `Get Premium — ₹${yearlyPrice}/yr` : `Get Premium — ₹${monthlyPrice}/mo`}
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </section>

        {/* ─── Premium Perks Grid ─── */}
        <section className="py-12 sm:py-16">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">What Premium Unlocks</h2>
            <p className="text-sm text-muted-foreground">Deeper insights, smarter tools, better you.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {premiumPerks.map((perk, i) => (
              <motion.div
                key={perk.label}
                {...fadeUp(0.05 * i)}
                className="p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <perk.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{perk.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Feature Comparison Table ─── */}
        <section className="py-12 sm:py-16">
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Side-by-Side Comparison</h2>
            <p className="text-sm text-muted-foreground">See exactly what you get with each plan.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-border overflow-hidden bg-card">
            {/* Header Row */}
            <div className="grid grid-cols-3 bg-muted/50 px-4 sm:px-6 py-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Free</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider text-center flex items-center justify-center gap-1">
                <Crown className="w-3 h-3" /> Premium
              </span>
            </div>

            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-4 sm:px-6 py-3.5 ${i < comparisonRows.length - 1 ? 'border-b border-border/50' : ''} hover:bg-muted/20 transition-colors`}>
                <span className="text-sm font-medium text-foreground">{row.feature}</span>
                <span className="text-xs text-muted-foreground text-center self-center">{row.free}</span>
                <span className="text-xs text-primary font-medium text-center self-center">{row.premium}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ─── Always Free ─── */}
        <section className="py-12 sm:py-16">
          <motion.div {...fadeUp(0)} className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Always Free — Safety First</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We never lock emotional relief, safety, or crisis support behind a paywall.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {alwaysFree.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
                  <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Final CTA ─── */}
        {!isPremium && (
          <section className="py-12 sm:py-16">
            <motion.div {...fadeUp(0)} className="text-center rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

              <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Start understanding yourself better
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Join thousands of users who've transformed their mental wellness journey with Calmora Premium.
              </p>
              <Button
                size="lg"
                className="rounded-xl h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                onClick={() => handleSubscribe(isYearly ? 'premium_yearly' : 'premium_monthly')}
                disabled={isProcessing}
              >
                <Zap className="w-4 h-4" />
                {isProcessing ? 'Processing...' : (isYearly ? `Get Premium — ₹${yearlyPrice}/year` : `Get Premium — ₹${monthlyPrice}/month`)}
              </Button>
              <p className="text-[10px] text-muted-foreground mt-4">Cancel anytime · No hidden fees · Demo mode</p>
            </motion.div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PricingPage;

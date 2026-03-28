import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { Loader2, Mail, Lock, User, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import mindoMascot from '@/assets/mindo-mascot.png';
import pageBg from '@/assets/page-bg.png';

type AuthView = 'main' | 'email-signup' | 'email-signin' | 'reset';

export const AuthPage = () => {
  const { user, loading, signIn, signUp, signInWithGoogle, signInAnonymously, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [view, setView] = useState<AuthView>('main');

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [resetEmail, setResetEmail] = useState('');

  if (user && !loading) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) return;
    setIsLoading(true);
    await signIn(signInData.email, signInData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.email || !signUpData.password || !signUpData.confirmPassword) return;
    if (signUpData.password !== signUpData.confirmPassword) return;
    setIsLoading(true);
    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    if (!error) setView('email-signin');
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
    setResetEmail('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    await signInAnonymously();
    setIsLoading(false);
  };

  const isPasswordMatch = signUpData.password && signUpData.confirmPassword && signUpData.password === signUpData.confirmPassword;

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>);

  }

  const GoogleIcon = () =>
  <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>;


  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      {/* Dark cosmic background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${pageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(1.2)'
        }} />

      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[hsl(200,40%,8%)]/80 via-[hsl(200,30%,12%)]/60 to-[hsl(200,40%,8%)]/80" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl border border-white/10 bg-[hsl(200,30%,12%)]/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Close / back */}
          {view !== 'main' &&
          <button
            onClick={() => setView('main')}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors">

              <X className="w-5 h-5" />
            </button>
          }

          {/* Main View */}
          {view === 'main' &&
          <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Create an Account</h1>
                <p className="text-white/60 text-sm">Your chats remain confidential even after signup.</p>
              </div>

              {/* Mascot Video */}
              <div className="flex justify-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.2)] relative">
                  <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover translate-x-[8%]" src="/videos/calmora-buddy.mp4" />
                </div>
              </div>

              {/* Google Button */}
              <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-white hover:bg-white/90 text-gray-800 font-medium text-base gap-3 shadow-lg">

                <GoogleIcon />
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/50 text-sm">Or</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Sign Up with Email */}
              <Button
              onClick={() => setView('email-signup')}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg">

                Sign Up with Email
              </Button>

              {/* Login link */}
              <div className="text-center space-y-2">
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <button onClick={() => setView('email-signin')} className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Login
                  </button>
                </p>
                <button onClick={handleAnonymousSignIn} className="text-primary/80 hover:text-primary text-sm font-medium transition-colors">
                  Anonymous Sign Up
                </button>
              </div>

              {/* Terms */}
              <p className="text-white/40 text-xs text-center leading-relaxed">
                By creating an account, you confirm that you are 18+ or between 13–17 with parental consent, and agree to the{' '}
                <a href="/privacy" className="underline hover:text-white/60">Terms of Service</a> and{' '}
                <a href="/privacy" className="underline hover:text-white/60">Privacy Policy</a>.
              </p>
            </>
          }

          {/* Email Sign Up */}
          {view === 'email-signup' &&
          <form onSubmit={handleSignUp} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Sign Up with Email</h2>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Full Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input value={signUpData.fullName} onChange={(e) => setSignUpData((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your name" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type="email" value={signUpData.email} onChange={(e) => setSignUpData((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type={showPassword ? 'text' : 'password'} value={signUpData.password} onChange={(e) => setSignUpData((p) => ({ ...p, password: e.target.value }))} placeholder="Create a password" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={signUpData.password} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type={showConfirmPassword ? 'text' : 'password'} value={signUpData.confirmPassword} onChange={(e) => setSignUpData((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm password" className={cn("pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30", signUpData.confirmPassword && !isPasswordMatch && "border-destructive")} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-white/40 hover:text-white/70">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signUpData.confirmPassword && !isPasswordMatch && <p className="text-sm text-destructive">Passwords do not match</p>}
              </div>
              <Button type="submit" className="w-full h-11 rounded-full" disabled={isLoading || !signUpData.email || !signUpData.password || !isPasswordMatch}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Account'}
              </Button>
            </form>
          }

          {/* Email Sign In */}
          {view === 'email-signin' &&
          <form onSubmit={handleSignIn} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type="email" value={signInData.email} onChange={(e) => setSignInData((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type={showPassword ? 'text' : 'password'} value={signInData.password} onChange={(e) => setSignInData((p) => ({ ...p, password: e.target.value }))} placeholder="Your password" className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-full" disabled={isLoading || !signInData.email || !signInData.password}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : 'Sign In'}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => setView('reset')} className="text-sm text-primary/80 hover:text-primary transition-colors">
                  Forgot your password?
                </button>
              </div>
            </form>
          }

          {/* Password Reset */}
          {view === 'reset' &&
          <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-white/50 text-sm mt-1">We'll send you a reset link</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-full" disabled={isLoading || !resetEmail}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Link'}
              </Button>
            </form>
          }
        </div>
      </div>
    </div>);

};

export default AuthPage;
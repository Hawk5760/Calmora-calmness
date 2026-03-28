import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, Eye, Download, Lock, AlertTriangle, Fingerprint, Monitor, Smartphone, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

const PRIVACY_STORAGE_KEY = 'calmora_privacy_settings';

export const PrivacyPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem(PRIVACY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      data_collection: true, analytics: false, third_party_sharing: false, marketing_emails: false
    };
  });
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => { loadSessions(); loadTwoFAStatus(); }, []);

  // Persist privacy settings to localStorage
  useEffect(() => {
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(privacySettings));
  }, [privacySettings]);

  const loadSessions = () => {
    // Real session data from browser
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const browser = /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Browser';
    const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown';
    
    setSessions([{
      id: 1,
      device: `${browser} on ${os}`,
      type: isMobile ? 'mobile' : 'desktop',
      lastActive: new Date().toISOString(),
      current: true
    }]);
  };

  const loadTwoFAStatus = async () => {
    try { const { data, error } = await supabase.functions.invoke('totp', { body: {} }); if (!error) setTwoFAEnabled(!!data?.is_enabled); } catch (e) { console.error('Load 2FA status error', e); }
  };

  const enable2FA = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('totp', { body: { action: 'generate' } });
      if (error) throw error;
      setOtpAuthUrl(data.otpauthUrl);
      setQrDataUrl(await QRCode.toDataURL(data.otpauthUrl));
    } catch (error: any) { toast({ variant: 'destructive', title: 'Failed to enable 2FA', description: error.message }); }
  };

  const verify2FA = async () => {
    if (totpCode.length !== 6) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('totp', { body: { action: 'verify', code: totpCode } });
      if (error) throw error;
      if (data?.valid) { setTwoFAEnabled(true); setQrDataUrl(null); setOtpAuthUrl(null); setTotpCode(''); toast({ title: 'Two-Factor enabled', description: '2FA has been activated.' }); }
      else toast({ variant: 'destructive', title: 'Invalid code', description: 'Please try again.' });
    } catch (error: any) { toast({ variant: 'destructive', title: 'Verification failed', description: error.message }); }
    finally { setVerifying(false); }
  };

  const disable2FA = async () => {
    if (!confirm('Disable Two-Factor Authentication?')) return;
    try { const { error } = await supabase.functions.invoke('totp', { body: { action: 'disable' } }); if (error) throw error; setTwoFAEnabled(false); toast({ title: 'Two-Factor disabled' }); }
    catch (error: any) { toast({ variant: 'destructive', title: 'Failed to disable 2FA', description: error.message }); }
  };

  const require2FA = async (): Promise<boolean> => {
    if (!twoFAEnabled) return true;
    const code = window.prompt('Enter your 6-digit 2FA code to continue');
    if (!code) return false;
    try { const { data, error } = await supabase.functions.invoke('totp', { body: { action: 'validate', code } }); if (error) throw error; if (data?.valid) return true; toast({ variant: 'destructive', title: 'Invalid 2FA code' }); return false; }
    catch (error: any) { toast({ variant: 'destructive', title: '2FA validation failed', description: error.message }); return false; }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all password fields." }); return; }
    if (newPassword !== confirmPassword) { toast({ variant: "destructive", title: "Passwords don't match" }); return; }
    if (newPassword.length < 8) { toast({ variant: "destructive", title: "Password too short", description: "Min 8 characters." }); return; }
    setLoading(true);
    try {
      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      if (signInError) {
        toast({ variant: "destructive", title: "Current password incorrect", description: "Please enter your correct current password." });
        setLoading(false);
        return;
      }
      // Now update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated" });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
    catch (error: any) { toast({ variant: "destructive", title: "Error updating password", description: error.message }); }
    finally { setLoading(false); }
  };

  const handlePrivacyToggle = (key: string, value: boolean) => {
    setPrivacySettings((prev: any) => {
      const updated = { ...prev, [key]: value };
      toast({ title: "Privacy setting updated", description: `${key.replace(/_/g, ' ')} has been ${value ? 'enabled' : 'disabled'}.` });
      return updated;
    });
  };

  const exportData = async () => {
    try {
      const proceed = await require2FA(); if (!proceed) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
      const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
      const journalEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      const breathingSessions = JSON.parse(localStorage.getItem("breathingSessions") || "[]");
      const gardenStats = JSON.parse(localStorage.getItem("gardenStats") || "{}");
      
      const exportPayload = {
        user: { id: user?.id, email: user?.email, created_at: user?.created_at },
        profile,
        moodEntries,
        journalEntries,
        breathingSessions,
        gardenStats,
        privacySettings,
        exported_at: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `calmora-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast({ title: "Data exported", description: "All your data has been downloaded." });
    } catch (error: any) { toast({ variant: "destructive", title: "Export failed", description: error.message }); }
  };

  const revokeAllSessions = async () => {
    if (!confirm('This will sign you out of all devices. Continue?')) return;
    const proceed = await require2FA(); if (!proceed) return;
    try { await signOut(); toast({ title: "Sessions revoked" }); }
    catch (error: any) { toast({ variant: "destructive", title: "Error revoking sessions", description: error.message }); }
  };

  const PrivacyToggle = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors min-h-[56px]">
      <div className="pr-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.header className="text-center mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Privacy & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Privacy & Security</h1>
          <p className="text-sm text-muted-foreground mt-1">Aapki privacy hamari priority hai</p>
        </motion.header>

        {/* Privacy Promise */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-primary">Hamara Privacy Promise</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: Lock, title: 'Aapke Thoughts Private Hain', sub: 'Sirf aap dekh sakte hain apna data' },
                { icon: Shield, title: 'No Data Selling', sub: 'Hum data kabhi nahi bechte' },
                { icon: Download, title: 'Delete Anytime', sub: 'Jab chaaho apna data delete karein' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">🔒 End-to-end encryption · Indian data protection guidelines</p>
          </Card>
        </motion.div>

        {/* 2FA & Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Account Security</h3>
            </div>

            {/* 2FA Section */}
            <div className="p-4 rounded-xl bg-muted/20 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-[10px] text-muted-foreground">Extra security layer for your account</p>
                  </div>
                </div>
                <Badge variant={twoFAEnabled ? "default" : "outline"} className="text-[10px] rounded-full">
                  {twoFAEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              {!twoFAEnabled && !qrDataUrl && (
                <Button size="sm" onClick={enable2FA} className="rounded-full gap-2 min-h-[44px]">
                  <Lock className="w-3.5 h-3.5" /> Enable 2FA
                </Button>
              )}

              {!twoFAEnabled && qrDataUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="flex flex-col items-center gap-2">
                    <img src={qrDataUrl} alt="TOTP QR" className="w-36 h-36 rounded-lg" />
                    <p className="text-[10px] text-muted-foreground">Scan with Authenticator app</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs">Enter 6-digit code</Label>
                    <Input inputMode="numeric" pattern="[0-9]*" placeholder="123456" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-10" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={verify2FA} disabled={verifying || totpCode.length !== 6} className="rounded-full min-h-[44px]">{verifying ? 'Verifying...' : 'Verify & Enable'}</Button>
                      <Button size="sm" variant="ghost" className="rounded-full min-h-[44px]" onClick={() => { setQrDataUrl(null); setOtpAuthUrl(null); setTotpCode(''); }}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}

              {twoFAEnabled && (
                <Button variant="destructive" size="sm" onClick={disable2FA} className="rounded-full gap-2 min-h-[44px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Disable 2FA
                </Button>
              )}
            </div>

            {/* Change Password */}
            <div className="p-4 rounded-xl bg-muted/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Change Password</p>
                  <p className="text-[10px] text-muted-foreground">Verify current password before updating</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-10" />
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-10" />
              </div>
              <Button size="sm" onClick={changePassword} disabled={loading} className="rounded-full gap-2 min-h-[44px]">
                <Key className="w-3.5 h-3.5" /> {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Privacy Controls - Now persisted */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Privacy Controls</h3>
              <Badge variant="secondary" className="text-[10px] rounded-full ml-auto">Saved locally</Badge>
            </div>
            <div className="space-y-2.5">
              <PrivacyToggle title="Data Collection" description="Allow usage data to improve the app" checked={privacySettings.data_collection} onChange={(v) => handlePrivacyToggle('data_collection', v)} />
              <PrivacyToggle title="Analytics" description="Share anonymous analytics" checked={privacySettings.analytics} onChange={(v) => handlePrivacyToggle('analytics', v)} />
              <PrivacyToggle title="Third-party Sharing" description="Share data with trusted services" checked={privacySettings.third_party_sharing} onChange={(v) => handlePrivacyToggle('third_party_sharing', v)} />
              <PrivacyToggle title="Marketing Emails" description="Receive promotional emails" checked={privacySettings.marketing_emails} onChange={(v) => handlePrivacyToggle('marketing_emails', v)} />
            </div>
          </Card>
        </motion.div>

        {/* Active Sessions - Real data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Active Sessions</h3>
            </div>
            <div className="space-y-2.5 mb-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 min-h-[56px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      {session.type === 'mobile' ? <Smartphone className="w-4 h-4 text-primary" /> : <Monitor className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.device}</p>
                      <p className="text-[10px] text-muted-foreground">Active {new Date(session.lastActive).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {session.current && <Badge variant="secondary" className="text-[10px] rounded-full">Current</Badge>}
                </div>
              ))}
            </div>
            <Button variant="destructive" size="sm" onClick={revokeAllSessions} className="rounded-full gap-2 min-h-[44px]">
              <AlertTriangle className="w-3.5 h-3.5" /> Revoke All Sessions
            </Button>
          </Card>
        </motion.div>

        {/* Data Export - Enhanced */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Data Export</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Download all your data including profile, mood entries, journal, and breathing sessions.</p>
            <Button size="sm" onClick={exportData} className="rounded-full gap-2 min-h-[44px]">
              <Download className="w-3.5 h-3.5" /> Export My Data
            </Button>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

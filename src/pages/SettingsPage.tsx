import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, User, Save, Moon, Sun, Globe, Trash2, Sparkles, BellRing, Mail, Clock } from 'lucide-react';
import { useNotificationReminder } from '@/hooks/useNotificationReminder';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';
import { ToggleRow } from '@/components/shared/ToggleRow';
import { AvatarUploader } from '@/components/shared/AvatarUploader';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });
  const [preferences, setPreferences] = useState({ notifications: true, email_updates: false, dark_mode: false, language: i18n.language || 'en' });
  const { settings: reminderSettings, permission, enableReminder, disableReminder, updateTime, isSupported } = useNotificationReminder();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && resolvedTheme) setPreferences(prev => ({ ...prev, dark_mode: resolvedTheme === 'dark' }));
  }, [mounted, resolvedTheme]);
  useEffect(() => { if (user) loadProfile(); }, [user]);

  // Load persisted preferences
  useEffect(() => {
    const saved = localStorage.getItem('calmoraPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, notifications: parsed.notifications ?? prev.notifications, email_updates: parsed.email_updates ?? prev.email_updates }));
      } catch {}
    }
  }, []);

  const persistPreferences = (updated: typeof preferences) => {
    localStorage.setItem('calmoraPreferences', JSON.stringify({ notifications: updated.notifications, email_updates: updated.email_updates }));
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
      if (error) throw error;
      if (data) setProfile({ full_name: data.full_name || '', avatar_url: data.avatar_url || '' });
    } catch (error: any) { toast({ variant: "destructive", title: "Error loading profile", description: error.message }); }
  };

  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ user_id: user.id, full_name: profile.full_name, avatar_url: profile.avatar_url, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
    } catch (error: any) { toast({ variant: "destructive", title: "Error updating profile", description: error.message }); }
    finally { setLoading(false); }
  };

  const handleThemeChange = (isDark: boolean) => { setTheme(isDark ? 'dark' : 'light'); setPreferences(prev => ({ ...prev, dark_mode: isDark })); };

  const handleToggleChange = (key: 'notifications' | 'email_updates', value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    persistPreferences(updated);
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await supabase.from('profiles').delete().eq('user_id', user?.id);
      toast({ title: "Account deletion requested", description: "Please contact support to complete account deletion." });
    } catch (error: any) { toast({ variant: "destructive", title: "Error deleting account", description: error.message }); }
  };

  const languages = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' },
    { code: 'bn', label: 'বাংলা' }, { code: 'te', label: 'తెలుగు' },
    { code: 'mr', label: 'मराठी' }, { code: 'ta', label: 'தமிழ்' },
    { code: 'gu', label: 'ગુજરાતી' }, { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  const fallbackText = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.header className="text-center mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.description')}</p>
        </motion.header>

        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
              <h3 className="font-semibold text-sm">{t('settings.profileInformation')}</h3>
            </div>

            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/20 mb-4">
              <AvatarUploader
                userId={user?.id || ''}
                currentUrl={profile.avatar_url}
                fallbackText={fallbackText}
                size="sm"
                onUploaded={(url) => {
                  setProfile(prev => ({ ...prev, avatar_url: url }));
                  supabase.from('profiles').upsert({ user_id: user!.id, avatar_url: url, full_name: profile.full_name, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
                }}
              />
              <div>
                <h4 className="font-medium text-sm text-foreground">{t('settings.profilePicture')}</h4>
                <p className="text-[10px] text-muted-foreground">{t('settings.profilePictureDescription')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('settings.fullName')}</Label>
                <Input value={profile.full_name} onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Enter your full name" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('settings.email')}</Label>
                <Input value={user?.email || ''} disabled className="bg-muted/30 h-10" />
              </div>
            </div>

            <Button onClick={updateProfile} disabled={loading} className="rounded-full gap-2 shadow-sm">
              <Save className="w-4 h-4" />
              {loading ? t('settings.updating') : t('settings.updateProfile')}
            </Button>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Sparkles className="w-4 h-4 text-primary" /></div>
              <h3 className="font-semibold text-sm">{t('settings.preferences')}</h3>
            </div>
            <div className="space-y-2.5">
              <ToggleRow
                icon={preferences.dark_mode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                title={t('settings.darkMode')}
                description={t('settings.darkModeDescription')}
                checked={mounted ? preferences.dark_mode : false}
                onChange={handleThemeChange}
                disabled={!mounted}
              />
              <ToggleRow icon={<BellRing className="w-4 h-4 text-primary" />} title={t('settings.pushNotifications')} description={t('settings.pushNotificationsDescription')} checked={preferences.notifications} onChange={(v) => handleToggleChange('notifications', v)} />
              <ToggleRow icon={<Mail className="w-4 h-4 text-primary" />} title={t('settings.emailUpdates')} description={t('settings.emailUpdatesDescription')} checked={preferences.email_updates} onChange={(v) => handleToggleChange('email_updates', v)} />
            </div>

            {/* Daily Reminder */}
            {isSupported && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-semibold text-foreground">Daily Check-in Reminder</h4>
                </div>
                <ToggleRow
                  icon={<BellRing className="w-4 h-4 text-status-warning" />}
                  title="Daily Reminder"
                  description={reminderSettings.enabled ? `Reminds you at ${String(reminderSettings.hour).padStart(2, '0')}:${String(reminderSettings.minute).padStart(2, '0')}` : 'Get a Hinglish nudge to check in daily'}
                  checked={reminderSettings.enabled}
                  onChange={async (v) => {
                    if (v) {
                      const ok = await enableReminder(reminderSettings.hour, reminderSettings.minute);
                      if (!ok) toast({ title: 'Permission denied', description: 'Please allow notifications in your browser settings.', variant: 'destructive' });
                      else toast({ title: 'Reminder set! 🔔', description: `You'll get a daily nudge at ${String(reminderSettings.hour).padStart(2, '0')}:${String(reminderSettings.minute).padStart(2, '0')}` });
                    } else {
                      disableReminder();
                      toast({ title: 'Reminder disabled' });
                    }
                  }}
                />
                {reminderSettings.enabled && (
                  <div className="flex items-center gap-2 mt-2 ml-10">
                    <Label className="text-[10px] text-muted-foreground">Time:</Label>
                    <Input
                      type="time"
                      value={`${String(reminderSettings.hour).padStart(2, '0')}:${String(reminderSettings.minute).padStart(2, '0')}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(':').map(Number);
                        updateTime(h, m);
                      }}
                      className="w-28 h-8 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="w-4 h-4 text-primary" /></div>
              <h3 className="font-semibold text-sm">{t('settings.languageAndRegion')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {languages.map((lang) => (
                <Button key={lang.code} variant={preferences.language === lang.code ? 'default' : 'outline'} size="sm" className="rounded-full text-xs" onClick={() => {
                  setPreferences(prev => ({ ...prev, language: lang.code }));
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('i18nextLng', lang.code);
                  toast({ title: t('toast.languageChanged'), description: t('toast.languageChangedDescription') });
                }}>{lang.label}</Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="w-4 h-4 text-destructive" /></div>
              <h3 className="font-semibold text-sm text-destructive">{t('settings.dangerZone')}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t('settings.deleteAccountDescription')}</p>
            <Button variant="destructive" size="sm" onClick={deleteAccount} className="rounded-full gap-2">
              <Trash2 className="w-3.5 h-3.5" /> {t('settings.deleteAccount')}
            </Button>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

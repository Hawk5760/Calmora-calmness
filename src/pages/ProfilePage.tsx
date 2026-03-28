import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User, Mail, Calendar, MapPin, Phone, Globe, Camera,
  Shield, Activity, Clock, Edit3, Check, X, Sparkles
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: '', avatar_url: '', bio: '', location: '',
    phone: '', website: '', birthday: '', joined_date: '', last_active: ''
  });
  const [tempValue, setTempValue] = useState('');
  const [stats, setStats] = useState({
    days_active: 0, mood_entries: 0, journal_entries: 0, meditation_sessions: 0
  });

  useEffect(() => { if (user) { loadProfile(); loadStats(); } }, [user]);

  const resolveAvatarUrl = async (currentUrl?: string | null) => {
    if (!user) return '';
    const googleAvatarUrl = (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined;
    const currentFileName = currentUrl ? currentUrl.split('/').pop() : null;
    if (currentFileName) {
      const { data: matches } = await supabase.storage.from('avatars').list(user.id, { limit: 1, search: currentFileName });
      if (matches?.some((m) => m.name === currentFileName)) return currentUrl;
    }
    const { data: files } = await supabase.storage.from('avatars').list(user.id, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
    if (files?.length) {
      const latest = files[files.length - 1];
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/${latest.name}`);
      return publicUrl;
    }
    return googleAvatarUrl || '';
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user?.id).maybeSingle();
      if (error) throw error;
      if (data) {
        const resolvedAvatarUrl = await resolveAvatarUrl(data.avatar_url);
        setProfile({
          full_name: data.full_name || '', avatar_url: resolvedAvatarUrl,
          bio: data.bio || '', location: data.location || '',
          phone: data.phone || '', website: data.website || '',
          birthday: data.birthday || '',
          joined_date: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '',
          last_active: new Date().toLocaleDateString(),
        });
        if (resolvedAvatarUrl && resolvedAvatarUrl !== (data.avatar_url || '')) {
          await updateProfileField('avatar_url', resolvedAvatarUrl, { silent: true });
        }
      } else {
        setProfile(prev => ({
          ...prev,
          joined_date: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '',
          last_active: new Date().toLocaleDateString()
        }));
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error loading profile", description: error.message });
    }
  };

  const loadStats = () => {
    const gardenStats = JSON.parse(localStorage.getItem("gardenStats") || "{}");
    const moodEntries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    const journalEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const breathingSessions = JSON.parse(localStorage.getItem("breathingSessions") || "[]");

    // Calculate real active days
    const allDates = [
      ...moodEntries.map((e: any) => new Date(e.timestamp).toDateString()),
      ...journalEntries.map((e: any) => new Date(e.timestamp).toDateString()),
      ...breathingSessions.map((s: any) => new Date(s.timestamp).toDateString()),
    ];
    const uniqueDays = new Set(allDates);

    setStats({
      days_active: uniqueDays.size || 0,
      mood_entries: gardenStats.moodEntries || moodEntries.length || 0,
      journal_entries: gardenStats.journalEntries || journalEntries.length || 0,
      meditation_sessions: breathingSessions.length || 0
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
      }
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfileField('avatar_url', publicUrl);
      toast({ title: "Avatar updated", description: "Your profile picture has been updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    } finally { setUploadingAvatar(false); }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ variant: "destructive", title: "Invalid file type", description: "Please select an image file." }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ variant: "destructive", title: "File too large", description: "Please select an image smaller than 5MB." }); return; }
    uploadAvatar(file);
  };

  const updateProfileField = async (field: string, value: string, options?: { silent?: boolean }) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ user_id: user.id, [field]: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      setProfile((prev) => ({ ...prev, [field]: value }));
      if (!options?.silent) toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error updating profile", description: error.message });
    } finally { setLoading(false); }
  };

  const startEditing = (field: string, currentValue: string) => { setEditingField(field); setTempValue(currentValue); };
  const saveEdit = async () => { if (editingField) { await updateProfileField(editingField, tempValue); setEditingField(null); setTempValue(''); } };
  const cancelEdit = () => { setEditingField(null); setTempValue(''); };
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const EditableField = ({ field, label, icon: Icon, placeholder, value }: { field: string; label: string; icon: any; placeholder: string; value: string }) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {editingField === field ? (
          <div className="flex items-center gap-2 flex-1">
            {field === 'bio' ? (
              <Textarea value={tempValue} onChange={(e) => setTempValue(e.target.value)} placeholder={placeholder} rows={2} autoFocus className="text-sm flex-1" />
            ) : (
              <Input value={tempValue} onChange={(e) => setTempValue(e.target.value)} placeholder={placeholder} autoFocus className="text-sm flex-1 h-9" />
            )}
            <Button size="icon" className="h-8 w-8 rounded-full flex-shrink-0" onClick={saveEdit} disabled={loading}><Check className="w-3.5 h-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full flex-shrink-0" onClick={cancelEdit}><X className="w-3.5 h-3.5" /></Button>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm text-foreground truncate">{value || 'Not set'}</p>
          </div>
        )}
      </div>
      {editingField !== field && (
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full flex-shrink-0" onClick={() => startEditing(field, value)}>
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  const statItems = [
    { label: 'Days Active', value: stats.days_active, icon: Calendar, color: 'text-primary' },
    { label: 'Mood Entries', value: stats.mood_entries, icon: Activity, color: 'text-primary' },
    { label: 'Journal Entries', value: stats.journal_entries, icon: Edit3, color: 'text-primary' },
    { label: 'Meditation', value: stats.meditation_sessions, icon: Sparkles, color: 'text-primary' },
  ];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.header className="text-center mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Your Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
        </motion.header>

        {/* Avatar & Name Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden relative">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatar_url} alt="Profile" loading="lazy" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full shadow-lg" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {editingField === 'full_name' ? (
                    <div className="flex items-center gap-2">
                      <Input value={tempValue} onChange={(e) => setTempValue(e.target.value)} className="text-lg font-bold h-9" autoFocus />
                      <Button size="icon" className="h-8 w-8 rounded-full" onClick={saveEdit} disabled={loading}><Check className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={cancelEdit}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">{profile.full_name || user?.user_metadata?.full_name || 'Soul Gardener'}</h2>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => startEditing('full_name', profile.full_name)}><Edit3 className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm">
                  <Mail className="w-3.5 h-3.5" /><span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-xs">
                  <Calendar className="w-3.5 h-3.5" /><span>Joined {profile.joined_date}</span>
                </div>
                <div className="flex gap-2 justify-center sm:justify-start pt-1">
                  <Badge variant="secondary" className="text-[10px] rounded-full">Active User</Badge>
                  <Badge variant="outline" className="text-[10px] rounded-full">Verified</Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map((stat, i) => (
            <Card key={i} className="p-4 bg-card/80 backdrop-blur-sm border-border/50 text-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Personal Information</h3>
            </div>
            <div className="space-y-2.5">
              <EditableField field="bio" label="Bio" icon={Edit3} placeholder="Tell us about yourself..." value={profile.bio} />
              <EditableField field="location" label="Location" icon={MapPin} placeholder="City, Country" value={profile.location} />
              <EditableField field="phone" label="Phone" icon={Phone} placeholder="+91 98765 43210" value={profile.phone} />
              <EditableField field="website" label="Website" icon={Globe} placeholder="https://example.com" value={profile.website} />
            </div>
          </Card>
        </motion.div>

        {/* Security Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Security Overview</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: Mail, title: 'Email Verified', sub: 'Your email is confirmed' },
                { icon: Shield, title: '2FA Available', sub: 'Enable in Privacy settings' },
                { icon: Clock, title: 'Last Login', sub: 'Today' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

import { useState, useEffect, useCallback } from 'react';

interface ReminderSettings {
  enabled: boolean;
  hour: number; // 0-23
  minute: number;
}

const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, hour: 9, minute: 0 };

const HINGLISH_MESSAGES = [
  "Hey! 🌿 Aaj ka mood check-in baaki hai. Thoda waqt apne liye nikalo.",
  "Namaste! 🧘 Calmora pe aao, mann halka karo.",
  "Reminder: Apna khayal rakhna bhi zaroori hai. 💚 Check in karo!",
  "Tera streak tod mat! 🔥 Aaj ka mood log kar le.",
  "Calmora misses you! 🌸 2 minute mein apna mood share karo.",
  "Breathe in... breathe out... 🌬️ Aaj mindfulness try karo!",
  "Journal likh ke dekho — mann halka hota hai. ✍️",
  "Aaj ka din kaisa raha? Calmora ko batao! 💙",
];

export const useNotificationReminder = () => {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem('calmora_reminder_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    localStorage.setItem('calmora_reminder_settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const enableReminder = useCallback(async (hour: number, minute: number) => {
    const perm = await requestPermission();
    if (perm === 'granted') {
      setSettings({ enabled: true, hour, minute });
      return true;
    }
    return false;
  }, [requestPermission]);

  const disableReminder = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: false }));
  }, []);

  const updateTime = useCallback((hour: number, minute: number) => {
    setSettings(prev => ({ ...prev, hour, minute }));
  }, []);

  // Schedule checker — runs every minute
  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === settings.hour && now.getMinutes() === settings.minute) {
        const lastShown = localStorage.getItem('calmora_last_notification');
        const today = now.toDateString();
        if (lastShown !== today) {
          const msg = HINGLISH_MESSAGES[Math.floor(Math.random() * HINGLISH_MESSAGES.length)];
          new Notification('Calmora 🌿', {
            body: msg,
            icon: '/lovable-uploads/12d2bf45-5f26-4fad-a79d-fce873b1aa64.png',
            badge: '/lovable-uploads/12d2bf45-5f26-4fad-a79d-fce873b1aa64.png',
            tag: 'calmora-daily',
          });
          localStorage.setItem('calmora_last_notification', today);
        }
      }
    };

    const interval = setInterval(checkTime, 60_000);
    checkTime(); // Check immediately
    return () => clearInterval(interval);
  }, [settings, permission]);

  return {
    settings,
    permission,
    enableReminder,
    disableReminder,
    updateTime,
    requestPermission,
    isSupported: typeof Notification !== 'undefined',
  };
};

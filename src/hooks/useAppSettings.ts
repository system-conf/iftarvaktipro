import { useEffect, useState } from 'react';

export type AppSettings = {
  language: string;
  waterReminder: boolean;
  prayerNotifications: boolean;
  fontSize?: 'small' | 'medium' | 'large';
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'tr',
  waterReminder: true,
  prayerNotifications: false,
  fontSize: 'medium',
};

export const useAppSettings = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as AppSettings;
        setAppSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } catch {
        // ignore invalid stored settings
      }
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (appSettings.fontSize === 'small') {
      html.style.fontSize = '14px';
    } else if (appSettings.fontSize === 'large') {
      html.style.fontSize = '18px';
    } else {
      html.style.fontSize = '16px';
    }
  }, [appSettings.fontSize]);

  return { appSettings, setAppSettings };
};


import { useCallback, useEffect, useRef, useState } from 'react';
import type { PrayerData } from '@/lib/api';
import { requestNotificationPermission, scheduleAllNotifications } from '@/lib/notifications';

type NotificationOptions = {
  waterReminder: boolean;
  prayerNotifications: boolean;
};

export const useNotifications = (data: PrayerData | null, options: NotificationOptions) => {
  const [notifEnabled, setNotifEnabled] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const clearScheduledNotifications = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      setNotifEnabled(true);
    }

    return () => {
      clearScheduledNotifications();
    };
  }, [clearScheduledNotifications]);

  useEffect(() => {
    if (!notifEnabled || !data) return;

    clearScheduledNotifications();
    timeoutsRef.current = scheduleAllNotifications(data, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifEnabled, data, options.waterReminder, options.prayerNotifications, clearScheduledNotifications]);

  const handleNotifToggle = useCallback(async () => {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifEnabled(true);
      }
    } else {
      clearScheduledNotifications();
      setNotifEnabled(false);
    }
  }, [notifEnabled, clearScheduledNotifications]);

  return { notifEnabled, handleNotifToggle };
};


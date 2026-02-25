import { useEffect, useState } from 'react';
import type { PrayerData } from '@/lib/api';
import { getCountdown, normalizeTimeString } from '@/lib/utils-time';
import { MAIN_PRAYERS } from '@/lib/prayer-names';

export type ViewMode = 'iftar' | 'sahur';

export const getActivePrayerFromData = (data: PrayerData | null, now: Date = new Date()): string => {
  if (!data) return '';

  for (let i = MAIN_PRAYERS.length - 1; i >= 0; i--) {
    const prayer = MAIN_PRAYERS[i];
    const [h, m] = normalizeTimeString(data.timings[prayer]).split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);
    if (now >= prayerDate) return prayer;
  }

  return MAIN_PRAYERS[0];
};

export const useCountdown = (data: PrayerData | null, viewMode: ViewMode) => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    if (!data) return;

    const targetKey = viewMode === 'iftar' ? 'Maghrib' : 'Imsak';

    const timer = setInterval(() => {
      const now = new Date();
      const targetTimeStr = data.timings[targetKey];
      const target = new Date();
      const [h, m] = normalizeTimeString(targetTimeStr).split(':').map(Number);
      target.setHours(h, m, 0, 0);

      const diffMs = now.getTime() - target.getTime();
      if (diffMs >= 0 && diffMs < 30 * 60 * 1000) {
        setIsCelebrating(true);
      } else {
        setIsCelebrating(false);
      }

      const diff = getCountdown(targetTimeStr, now);
      setCountdown(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [data, viewMode]);

  const activePrayer = getActivePrayerFromData(data);

  return { countdown, isCelebrating, activePrayer };
};


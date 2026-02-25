import type { PrayerData } from '@/lib/api';
import { getActivePrayerFromData } from './useCountdown';

const baseData: PrayerData = {
  timings: {
    Fajr: '05:00',
    Sunrise: '06:30',
    Dhuhr: '13:00',
    Asr: '16:30',
    Sunset: '18:30',
    Maghrib: '18:45',
    Isha: '20:00',
    Imsak: '04:45',
    Midnight: '00:00',
  },
  date: {
    readable: '',
    timestamp: '',
    gregorian: {} as any,
    hijri: {} as any,
  },
  meta: {
    latitude: 0,
    longitude: 0,
    timezone: 'Europe/Istanbul',
    method: {
      id: 0,
      name: '',
    },
  },
};

describe('getActivePrayerFromData', () => {
  it('en son giren vakti aktif olarak döndürür', () => {
    const now = new Date();
    now.setHours(17, 0, 0, 0); // 17:00, Asr girmiş, Maghrib henüz değil

    const active = getActivePrayerFromData(baseData, now);
    expect(active).toBe('Asr');
  });

  it('henüz vakit girmediyse ilk ana vakti döndürür', () => {
    const now = new Date();
    now.setHours(3, 0, 0, 0); // tüm vakitlerden önce

    const active = getActivePrayerFromData(baseData, now);
    expect(active).toBe('Imsak');
  });
});


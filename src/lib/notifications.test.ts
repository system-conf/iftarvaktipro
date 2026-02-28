import type { PrayerData } from './api';
import { scheduleAllNotifications } from './notifications';

describe('scheduleAllNotifications', () => {
  let setTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00'));
    setTimeoutSpy = jest.spyOn(window, 'setTimeout');
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
    jest.useRealTimers();
  });

  it('tüm bildirimler için timeout oluşturur', () => {
    const data: PrayerData = {
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
        gregorian: {} as unknown as PrayerData['date']['gregorian'],
        hijri: {} as unknown as PrayerData['date']['hijri'],
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

    const ids = scheduleAllNotifications(data, {
      waterReminder: true,
      prayerNotifications: true,
    });

    // 2 iftar + 2 sahur + 1 su + 5 vakit = 10 timeout beklenir
    expect(ids.length).toBe(10);
    expect(setTimeoutSpy.mock.calls.length).toBe(10);
  });
});


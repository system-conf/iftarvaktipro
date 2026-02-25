import { PrayerData } from './api';
import { normalizeTimeString } from './utils-time';

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('Bu tarayıcı bildirimleri desteklemiyor.');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = async (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                if (registrations.length > 0) {
                    await registrations[0].showNotification(title, {
                        body,
                        icon: icon || '/icon-192.png',
                        badge: '/icon-192.png',
                        vibrate: [200, 100, 200],
                        tag: 'iftar-notification',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any);
                    return;
                }
            }

            // Fallback
             
            const notification = new Notification(title, {
                body,
                icon: icon || '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [200, 100, 200],
                tag: 'iftar-notification',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('Bildirim hatası:', error);
        }
    }
};

const scheduleNotificationAtTime = (
    time: string,
    offsetMs: number,
    title: string,
    body: string
): number | null => {
    const now = new Date();
    const [hours, minutes] = normalizeTimeString(time).split(':').map(Number);

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    const alertTime = new Date(target.getTime() + offsetMs);
    const diff = alertTime.getTime() - now.getTime();

    if (diff <= 0) return null;

    const timeoutId = window.setTimeout(async () => {
        await sendNotification(title, body);
    }, diff);

    return timeoutId;
};

export const scheduleIftarNotification = (iftarTime: string): number[] => {
    const ids: number[] = [];

    const beforeId = scheduleNotificationAtTime(
        iftarTime,
        -15 * 60 * 1000,
        '🌙 İftar Yaklaşıyor!',
        'İftara 15 dakika kaldı. Hazırlıklarınızı yapın!'
    );
    if (beforeId !== null) ids.push(beforeId);

    const atTimeId = scheduleNotificationAtTime(
        iftarTime,
        0,
        '🕌 İftar Vakti!',
        'Hayırlı iftarlar! Oruçlarınız kabul olsun.'
    );
    if (atTimeId !== null) ids.push(atTimeId);

    return ids;
};

export const scheduleSahurNotification = (fajrTime: string): number[] => {
    const ids: number[] = [];

    const beforeId = scheduleNotificationAtTime(
        fajrTime,
        -30 * 60 * 1000,
        '🌅 Sahur Bitiyor!',
        'İmsak vaktine 30 dakika kaldı. Son lokmalarınızı alın!'
    );
    if (beforeId !== null) ids.push(beforeId);

    const atTimeId = scheduleNotificationAtTime(
        fajrTime,
        0,
        '🕌 İmsak Vakti!',
        'Hayırlı sahurlar! Oruçlarınız kabul olsun.'
    );
    if (atTimeId !== null) ids.push(atTimeId);

    return ids;
};

export const scheduleWaterReminder = (fajrTime: string): number[] => {
    const ids: number[] = [];

    const id = scheduleNotificationAtTime(
        fajrTime,
        -45 * 60 * 1000,
        '💧 Su İçmeyi Unutmayın!',
        'İmsak vaktine 45 dakika kaldı. Bol su içmeyi ihmal etmeyin.'
    );

    if (id !== null) ids.push(id);

    return ids;
};

export const schedulePrayerNotifications = (timings: Record<string, string>): number[] => {
    const ids: number[] = [];
    const prayers = [
        { key: 'Fajr', name: 'Sabah Namazı' },
        { key: 'Dhuhr', name: 'Öğle Namazı' },
        { key: 'Asr', name: 'İkindi Namazı' },
        { key: 'Maghrib', name: 'Akşam Namazı' },
        { key: 'Isha', name: 'Yatsı Namazı' },
    ];

    prayers.forEach((prayer) => {
        if (!timings[prayer.key]) return;

        const id = scheduleNotificationAtTime(
            timings[prayer.key],
            0,
            `🕌 ${prayer.name} Vakti`,
            `${prayer.name} vakti girdi. Hayırlı ibadetler.`
        );

        if (id !== null) ids.push(id);
    });

    return ids;
};

export const scheduleAllNotifications = (
    data: PrayerData,
    options: { waterReminder: boolean; prayerNotifications: boolean }
): number[] => {
    const ids: number[] = [];

    ids.push(...scheduleIftarNotification(data.timings.Maghrib));
    ids.push(...scheduleSahurNotification(data.timings.Fajr));

    if (options.waterReminder) {
        ids.push(...scheduleWaterReminder(data.timings.Fajr));
    }

    if (options.prayerNotifications) {
        ids.push(...schedulePrayerNotifications(data.timings));
    }

    return ids;
};

export const sendTestNotification = async () => {
    await sendNotification(
        '🔔 Bildirim Testi',
        'Bu bir test bildirimidir. İftar Vakti Pro bildirimleri başarıyla çalışıyor!'
    );
};

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

export const scheduleIftarNotification = (iftarTime: string) => {
    const now = new Date();
    const [hours, minutes] = iftarTime.split(':').map(Number);

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // 15 minutes before iftar
    const alertTime = new Date(target.getTime() - 15 * 60 * 1000);

    const diff = alertTime.getTime() - now.getTime();

    if (diff > 0) {
        setTimeout(async () => {
            await sendNotification(
                '🌙 İftar Yaklaşıyor!',
                `İftara 15 dakika kaldı. Hazırlıklarınızı yapın!`
            );
        }, diff);
    }

    // At iftar time
    const iftarDiff = target.getTime() - now.getTime();
    if (iftarDiff > 0) {
        setTimeout(async () => {
            await sendNotification(
                '🕌 İftar Vakti!',
                'Hayırlı iftarlar! Oruçlarınız kabul olsun.'
            );
        }, iftarDiff);
    }
};

export const scheduleSahurNotification = (fajrTime: string) => {
    const now = new Date();
    const [hours, minutes] = fajrTime.split(':').map(Number);

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // 30 minutes before sahur ends
    const alertTime = new Date(target.getTime() - 30 * 60 * 1000);

    const diff = alertTime.getTime() - now.getTime();

    if (diff > 0) {
        setTimeout(async () => {
            await sendNotification(
                '🌅 Sahur Bitiyor!',
                `İmsak vaktine 30 dakika kaldı. Son lokmalarınızı alın!`
            );
        }, diff);
    }

    // At sahur time
    const sahurDiff = target.getTime() - now.getTime();
    if (sahurDiff > 0) {
        setTimeout(async () => {
            await sendNotification(
                '🕌 İmsak Vakti!',
                'Hayırlı sahurlar! Oruçlarınız kabul olsun.'
            );
        }, sahurDiff);
    }
};

export const scheduleWaterReminder = (fajrTime: string) => {
    const now = new Date();
    const [hours, minutes] = fajrTime.split(':').map(Number);

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // 45 minutes before sahur ends for water reminder
    const alertTime = new Date(target.getTime() - 45 * 60 * 1000);
    const diff = alertTime.getTime() - now.getTime();

    if (diff > 0) {
        setTimeout(async () => {
            await sendNotification(
                '💧 Su İçmeyi Unutmayın!',
                'İmsak vaktine 45 dakika kaldı. Bol su içmeyi ihmal etmeyin.'
            );
        }, diff);
    }
};

export const schedulePrayerNotifications = (timings: Record<string, string>) => {
    const now = new Date();
    const prayers = [
        { key: 'Fajr', name: 'Sabah Namazı' },
        { key: 'Dhuhr', name: 'Öğle Namazı' },
        { key: 'Asr', name: 'İkindi Namazı' },
        { key: 'Maghrib', name: 'Akşam Namazı' },
        { key: 'Isha', name: 'Yatsı Namazı' },
    ];

    prayers.forEach((prayer) => {
        if (!timings[prayer.key]) return;

        const [hours, minutes] = timings[prayer.key].split(':').map(Number);
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);

        const diff = target.getTime() - now.getTime();

        if (diff > 0) {
            setTimeout(async () => {
                await sendNotification(
                    `🕌 ${prayer.name} Vakti`,
                    `${prayer.name} vakti girdi. Hayırlı ibadetler.`
                );
            }, diff);
        }
    });
};

export const sendTestNotification = async () => {
    await sendNotification(
        '🔔 Bildirim Testi',
        'Bu bir test bildirimidir. İftar Vakti Pro bildirimleri başarıyla çalışıyor!'
    );
};

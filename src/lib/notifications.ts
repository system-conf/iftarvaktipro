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

export const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'iftar-notification',
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
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
        setTimeout(() => {
            sendNotification(
                '🌙 İftar Yaklaşıyor!',
                `İftara 15 dakika kaldı. Hazırlıklarınızı yapın!`
            );
        }, diff);
    }

    // At iftar time
    const iftarDiff = target.getTime() - now.getTime();
    if (iftarDiff > 0) {
        setTimeout(() => {
            sendNotification(
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
        setTimeout(() => {
            sendNotification(
                '🌅 Sahur Bitiyor!',
                `İmsak vaktine 30 dakika kaldı. Son lokmalarınızı alın!`
            );
        }, diff);
    }
};

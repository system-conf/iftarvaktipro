import { parse, differenceInSeconds, addDays, isAfter } from 'date-fns';

export const normalizeTimeString = (time: string): string => {
    if (!time) return time;

    const match = time.match(/\d{1,2}:\d{2}/);
    return match ? match[0] : time;
};

export const getCountdown = (targetTime: string, now: Date = new Date()) => {
    const normalized = normalizeTimeString(targetTime);
    const target = parse(normalized, 'HH:mm', now);

    if (isAfter(now, target)) {
        // If time has passed today, target is tomorrow
        return differenceInSeconds(addDays(target, 1), now);
    }

    return differenceInSeconds(target, now);
};

export const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
};

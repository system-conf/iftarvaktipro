import {
    Moon,
    Sunrise,
    Sun,
    SunMedium,
    CloudSun,
    Sunset,
    Star,
} from 'lucide-react';
import { ComponentType } from 'react';

export const prayerNamesTr: Record<string, string> = {
    Imsak: 'İmsak',
    Fajr: 'Sabah',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Sunset: 'Gün Batımı',
    Maghrib: 'Akşam (İftar)',
    Isha: 'Yatsı',
};

export const prayerIconComponents: Record<string, ComponentType<{ size?: number; className?: string }>> = {
    Imsak: Moon,
    Fajr: Sunrise,
    Sunrise: Sun,
    Dhuhr: SunMedium,
    Asr: CloudSun,
    Maghrib: Sunset,
    Isha: Star,
};

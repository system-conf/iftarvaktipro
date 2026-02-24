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
export const MAIN_PRAYERS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

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

export const prayerNamesEn: Record<string, string> = {
    Imsak: 'Imsak',
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Sunset: 'Sunset',
    Maghrib: 'Maghrib (Iftar)',
    Isha: 'Isha',
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

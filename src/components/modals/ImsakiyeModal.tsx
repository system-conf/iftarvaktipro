import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PrayerData } from '@/lib/api';
import { normalizeTimeString } from '@/lib/utils-time';

const TURKISH_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TURKISH_DAYS: { [key: string]: string } = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma',
    'Saturday': 'Cumartesi',
    'Sunday': 'Pazar'
};

interface ImsakiyeModalProps {
    showImsakiyeModal: boolean;
    setShowImsakiyeModal: (show: boolean) => void;
    appSettings: { language: string };
    cityName: string;
    imsakiyeData: PrayerData[];
}

export default function ImsakiyeModal({
    showImsakiyeModal,
    setShowImsakiyeModal,
    appSettings,
    cityName,
    imsakiyeData,
}: ImsakiyeModalProps) {
    if (!showImsakiyeModal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-emerald-deep/95 backdrop-blur-3xl flex items-end justify-center"
            onClick={() => setShowImsakiyeModal(false)}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="w-full max-w-2xl max-h-[95vh] bg-sacred-bg border-t border-sacred-gold/30 rounded-t-[40px] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center p-5">
                    <div className="w-10 h-1.5 rounded-full bg-sacred-gold/20" />
                </div>

                <div className="px-8 pb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gold-gradient tracking-tight">
                            {appSettings.language === 'tr' ? 'İmsakiye' : 'Calendar'}
                        </h2>
                        <p className="text-xs text-sacred-gold/60 font-black uppercase tracking-[0.2em]">
                            {cityName} {appSettings.language === 'tr' ? 'için Ramazan Takvimi' : 'Ramadan Calendar'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowImsakiyeModal(false)}
                        className="w-12 h-12 rounded-full sacred-glass flex items-center justify-center border-sacred-gold/20 shadow-lg active:scale-90 transition-all"
                    >
                        <X size={24} className="text-sacred-gold" />
                    </button>
                </div>

                {/* Imsakiye Table */}
                <div className="flex-1 overflow-x-auto overflow-y-auto px-4 pb-12 no-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead className="sticky top-0 z-20 bg-sacred-bg/80 backdrop-blur-md">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-sacred-gold/40">
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'Gün' : 'Day'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'İmsak' : 'Imsak'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'Güneş' : 'Sunrise'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'Öğle' : 'Dhuhr'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'İkindi' : 'Asr'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'Akşam' : 'Maghrib'}</th>
                                <th className="px-4 py-3">{appSettings.language === 'tr' ? 'Yatsı' : 'Isha'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {imsakiyeData.map((day, idx) => {
                                const isToday = new Date().getDate() === parseInt(day.date.gregorian.day);
                                // Translate Month
                                const monthNum = day.date.gregorian.month.number - 1;
                                const turkishMonth = TURKISH_MONTHS[monthNum] || day.date.gregorian.month.en;
                                // Translate Day
                                const turkishDay = TURKISH_DAYS[day.date.gregorian.weekday.en] || day.date.gregorian.weekday.en;

                                return (
                                    <tr
                                        key={idx}
                                        className={`sacred-glass group text-sm font-bold transition-colors ${isToday ? 'bg-sacred-gold/20 border-sacred-gold' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <td className="px-4 py-4 rounded-l-2xl border-l border-t border-b border-sacred-gold/10">
                                            <div className="flex flex-col">
                                                <span className={isToday ? 'text-sacred-gold' : 'text-white'}>
                                                    {day.date.gregorian.day} {appSettings.language === 'tr' ? turkishMonth : day.date.gregorian.month.en}
                                                </span>
                                                <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter">
                                                    {appSettings.language === 'tr' ? turkishDay : day.date.gregorian.weekday.en}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                                            <span className={isToday ? 'text-sacred-gold' : 'text-white/60'}>
                                                {normalizeTimeString(day.timings.Imsak)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                                            <span className="text-white/40">
                                                {normalizeTimeString(day.timings.Sunrise)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums text-white/40">
                                            {normalizeTimeString(day.timings.Dhuhr)}
                                        </td>
                                        <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums text-white/40">
                                            {normalizeTimeString(day.timings.Asr)}
                                        </td>
                                        <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                                            <span className={isToday ? 'text-sacred-gold' : 'text-white font-black'}>
                                                {normalizeTimeString(day.timings.Maghrib)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 rounded-r-2xl border-r border-t border-b border-sacred-gold/10 tabular-nums text-white/40">
                                            {normalizeTimeString(day.timings.Isha)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

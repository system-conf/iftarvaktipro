import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { prayerNamesTr, prayerNamesEn, prayerIconComponents, MAIN_PRAYERS } from '@/lib/prayer-names';
import { PrayerData } from '@/lib/api';
import { normalizeTimeString } from '@/lib/utils-time';

interface PrayerTimesListProps {
    appSettings: { language: string };
    activePrayer: string;
    data: PrayerData | null;
}

export default function PrayerTimesList({ appSettings, activePrayer, data }: PrayerTimesListProps) {
    return (
        <section className="relative z-10 px-6 lg:px-0">
            <div className="flex items-center gap-4 mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-sacred-gold/40">
                    {appSettings.language === 'tr' ? 'Günün Vakitleri' : 'Prayer Times'}
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-sacred-gold/20 to-transparent" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {MAIN_PRAYERS.map((prayer, index) => {
                    const Icon = prayerIconComponents[prayer] || Clock;
                    const isActive = activePrayer === prayer;
                    return (
                        <motion.div
                            key={prayer}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`sacred-card p-4 flex justify-between items-center ${isActive ? 'active' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-sacred-gold text-emerald-deep' : 'bg-white/5 text-sacred-gold/40'
                                        }`}
                                >
                                    <Icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
                                        {appSettings.language === 'tr' ? prayerNamesTr[prayer] : prayerNamesEn[prayer]}
                                    </span>
                                    {isActive && (
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-sacred-gold">
                                            {appSettings.language === 'tr' ? 'Şu An Geçerli' : 'Active'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className={`text-xl font-black tabular-nums ${isActive ? 'text-sacred-gold' : 'text-white/40'}`}>
                                {data ? normalizeTimeString(data.timings[prayer]) : '--:--'}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

import { motion } from 'framer-motion';
import { X, Languages, Bell, Droplets, Clock, Type } from 'lucide-react';

interface AppSettings {
    language: string;
    waterReminder: boolean;
    prayerNotifications: boolean;
    fontSize?: 'small' | 'medium' | 'large';
}

interface SettingsModalProps {
    showSettingsModal: boolean;
    setShowSettingsModal: (show: boolean) => void;
    appSettings: AppSettings;
    setAppSettings: (settings: AppSettings) => void;
    notifEnabled: boolean;
}

export default function SettingsModal({
    showSettingsModal,
    setShowSettingsModal,
    appSettings,
    setAppSettings,
    notifEnabled,
}: SettingsModalProps) {
    if (!showSettingsModal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-emerald-deep/95 backdrop-blur-3xl flex items-end justify-center"
            onClick={() => setShowSettingsModal(false)}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="w-full max-w-lg max-h-[85vh] bg-sacred-bg border-t border-sacred-gold/30 rounded-t-[40px] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center p-5">
                    <div className="w-10 h-1.5 rounded-full bg-sacred-gold/20" />
                </div>

                <div className="px-8 pb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gold-gradient tracking-tight">
                            {appSettings.language === 'tr' ? 'Ayarlar' : 'Settings'}
                        </h2>
                        <p className="text-xs text-sacred-gold/60 font-black uppercase tracking-[0.2em]">
                            {appSettings.language === 'tr' ? 'Tercihlerinizi Yönetin' : 'Manage your preferences'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSettingsModal(false)}
                        className="w-12 h-12 rounded-full sacred-glass flex items-center justify-center border-sacred-gold/20 shadow-lg active:scale-90 transition-all"
                    >
                        <X size={24} className="text-sacred-gold" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-12 no-scrollbar flex flex-col gap-8">
                    {/* Language Settings */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center">
                                <Languages size={16} className="text-sacred-gold" />
                            </div>
                            <h3 className="text-lg font-black text-white">
                                {appSettings.language === 'tr' ? 'Dil Seçimi' : 'Language'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    const newSettings = { ...appSettings, language: 'tr' };
                                    setAppSettings(newSettings);
                                    localStorage.setItem('appSettings', JSON.stringify(newSettings));
                                }}
                                className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${appSettings.language === 'tr'
                                    ? 'bg-sacred-gold text-emerald-deep shadow-lg'
                                    : 'sacred-glass text-white/60 hover:text-white'
                                    }`}
                            >
                                Türkçe
                            </button>
                            <button
                                onClick={() => {
                                    const newSettings = { ...appSettings, language: 'en' };
                                    setAppSettings(newSettings);
                                    localStorage.setItem('appSettings', JSON.stringify(newSettings));
                                }}
                                className={`p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${appSettings.language === 'en'
                                    ? 'bg-sacred-gold text-emerald-deep shadow-lg'
                                    : 'sacred-glass text-white/60 hover:text-white'
                                    }`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Text Size Settings */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center">
                                <Type size={16} className="text-sacred-gold" />
                            </div>
                            <h3 className="text-lg font-black text-white">
                                {appSettings.language === 'tr' ? 'Yazı Boyutu' : 'Text Size'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        const newSettings = { ...appSettings, fontSize: size };
                                        setAppSettings(newSettings);
                                        localStorage.setItem('appSettings', JSON.stringify(newSettings));

                                        const html = document.documentElement;
                                        if (size === 'small') html.style.fontSize = '14px';
                                        else if (size === 'large') html.style.fontSize = '18px';
                                        else html.style.fontSize = '16px';
                                    }}
                                    className={`p-3 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${(appSettings.fontSize || 'medium') === size
                                            ? 'bg-sacred-gold text-emerald-deep shadow-lg'
                                            : 'sacred-glass text-white/60 hover:text-white'
                                        }`}
                                >
                                    {size === 'small' ? (appSettings.language === 'tr' ? 'Küçük' : 'Small') :
                                        size === 'large' ? (appSettings.language === 'tr' ? 'Büyük' : 'Large') :
                                            (appSettings.language === 'tr' ? 'Normal' : 'Normal')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sacred-gold/10 flex items-center justify-center">
                                <Bell size={16} className="text-sacred-gold" />
                            </div>
                            <h3 className="text-lg font-black text-white">
                                {appSettings.language === 'tr' ? 'Bildirim Tercihleri' : 'Notifications'}
                            </h3>
                        </div>

                        {!notifEnabled && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex flex-col gap-2">
                                {appSettings.language === 'tr'
                                    ? 'Bildirimleri kullanabilmeniz için önce sayfanın üstünden izin vermeniz gerekiyor.'
                                    : 'You must allow notifications from the top bar first.'}
                            </div>
                        )}

                        <div className={`flex flex-col gap-3 ${!notifEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Water Reminder */}
                            <div className="sacred-glass p-5 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Droplets size={20} className="text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">
                                            {appSettings.language === 'tr' ? 'Su İç Hatırlatıcısı' : 'Water Reminder'}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {appSettings.language === 'tr' ? 'Sahurdan 45 dk önce' : '45 mins before Sahur'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const newSettings = { ...appSettings, waterReminder: !appSettings.waterReminder };
                                        setAppSettings(newSettings);
                                        localStorage.setItem('appSettings', JSON.stringify(newSettings));
                                    }}
                                    className={`w-14 h-8 rounded-full relative transition-colors ${appSettings.waterReminder ? 'bg-sacred-gold' : 'bg-white/10'
                                        }`}
                                >
                                    <motion.div
                                        layout
                                        initial={false}
                                        animate={{ x: appSettings.waterReminder ? 26 : 4 }}
                                        className={`w-6 h-6 rounded-full absolute top-1 shadow-lg ${appSettings.waterReminder ? 'bg-sacred-bg' : 'bg-white/40'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Prayer Times Notifications */}
                            <div className="sacred-glass p-5 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Clock size={20} className="text-emerald-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">
                                            {appSettings.language === 'tr' ? 'Namaz Vakitleri' : 'Prayer Times'}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {appSettings.language === 'tr' ? 'Her vakitte bildirim' : 'Notify for all prayers'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const newSettings = { ...appSettings, prayerNotifications: !appSettings.prayerNotifications };
                                        setAppSettings(newSettings);
                                        localStorage.setItem('appSettings', JSON.stringify(newSettings));
                                    }}
                                    className={`w-14 h-8 rounded-full relative transition-colors ${appSettings.prayerNotifications ? 'bg-sacred-gold' : 'bg-white/10'
                                        }`}
                                >
                                    <motion.div
                                        layout
                                        initial={false}
                                        animate={{ x: appSettings.prayerNotifications ? 26 : 4 }}
                                        className={`w-6 h-6 rounded-full absolute top-1 shadow-lg ${appSettings.prayerNotifications ? 'bg-sacred-bg' : 'bg-white/40'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

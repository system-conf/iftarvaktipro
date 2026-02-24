import { motion } from 'framer-motion';
import { Info, BellRing, Globe, X } from 'lucide-react';

interface AboutModalProps {
    showAboutModal: boolean;
    setShowAboutModal: (show: boolean) => void;
    appSettings: { language: string };
    notifEnabled: boolean;
    sendTestNotification: () => void;
    version: string;
}

export default function AboutModal({
    showAboutModal,
    setShowAboutModal,
    appSettings,
    notifEnabled,
    sendTestNotification,
    version,
}: AboutModalProps) {
    if (!showAboutModal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-emerald-deep/95 backdrop-blur-3xl flex items-end justify-center"
            onClick={() => setShowAboutModal(false)}
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
                            {appSettings.language === 'tr' ? 'Hakkında' : 'About'}
                        </h2>
                        <p className="text-xs text-sacred-gold/60 font-black uppercase tracking-[0.2em] underline decoration-sacred-gold/30 underline-offset-4">
                            İftar Vakti Pro {version}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAboutModal(false)}
                        className="w-12 h-12 rounded-full sacred-glass flex items-center justify-center border-sacred-gold/20 shadow-lg active:scale-90 transition-all"
                    >
                        <X size={24} className="text-sacred-gold" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-12 no-scrollbar flex flex-col items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-sacred-gold/20 flex items-center justify-center">
                        <Info size={40} className="text-sacred-gold" />
                    </div>

                    <p className="text-sm text-white/60 leading-relaxed text-center font-medium px-4">
                        {appSettings.language === 'tr'
                            ? 'Bu uygulama, Ramazan ayında namaz ve iftar vakitlerini modern bir arayüzle sunmak amacıyla systemconf tarafından açık kaynak kodlu olarak geliştirilmiştir.'
                            : 'This application is an open-source project developed by systemconf to provide prayer and iftar times with a modern interface during Ramadan.'}
                    </p>

                    <div className="flex flex-col gap-4 w-full">
                        {notifEnabled && (
                            <button
                                onClick={sendTestNotification}
                                className="w-full py-4 bg-white/5 text-sacred-gold rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border border-sacred-gold/20 active:scale-95 transition-all shadow-lg"
                            >
                                <BellRing size={20} />
                                {appSettings.language === 'tr' ? 'Test Bildirimi Gönder' : 'Send Test Notification'}
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <a
                                href="http://systemconf.online/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-sacred-gold text-emerald-deep rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Globe size={16} />
                                systemconf
                            </a>
                            <a
                                href="https://www.mustafacem.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-sacred-gold text-emerald-deep rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Globe size={16} />
                                mustafacem
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

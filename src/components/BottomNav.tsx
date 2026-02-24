import { Settings, Calendar, Moon, Info } from 'lucide-react';

interface BottomNavProps {
    appSettings: { language: string };
    setShowSettingsModal: (show: boolean) => void;
    setShowImsakiyeModal: (show: boolean) => void;
    viewMode: 'iftar' | 'sahur';
    setViewMode: (mode: 'iftar' | 'sahur') => void;
    setShowAboutModal: (show: boolean) => void;
}

export default function BottomNav({
    appSettings,
    setShowSettingsModal,
    setShowImsakiyeModal,
    viewMode,
    setViewMode,
    setShowAboutModal,
}: BottomNavProps) {
    return (
        <nav className="sacred-nav">
            <button
                onClick={() => setShowAboutModal(true)}
                className="flex flex-col items-center gap-1 text-white/20 hover:text-sacred-gold transition-all"
            >
                <Info size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {appSettings.language === 'tr' ? 'Hakkında' : 'About'}
                </span>
            </button>

            <button
                onClick={() => setShowImsakiyeModal(true)}
                className="flex flex-col items-center gap-1 text-white/20 hover:text-sacred-gold transition-all"
            >
                <Calendar size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {appSettings.language === 'tr' ? 'İmsakiye' : 'Calendar'}
                </span>
            </button>

            <button
                onClick={() => setViewMode(viewMode === 'iftar' ? 'sahur' : 'iftar')}
                className="nav-center-sacred"
            >
                <Moon size={28} />
            </button>

            <button
                onClick={() => setShowSettingsModal(true)}
                className="flex flex-col items-center gap-1 text-white/20 hover:text-sacred-gold transition-all"
            >
                <Settings size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {appSettings.language === 'tr' ? 'Ayarlar' : 'Settings'}
                </span>
            </button>
        </nav>
    );
}

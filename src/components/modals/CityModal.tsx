import { motion } from 'framer-motion';
import { Navigation, Search, MapPin, X } from 'lucide-react';
import { City } from '@/lib/cities';

interface CityModalProps {
    showCityModal: boolean;
    setShowCityModal: (show: boolean) => void;
    appSettings: { language: string };
    getCurrentGeolocation: () => void;
    citySearch: string;
    setCitySearch: (val: string) => void;
    filteredCities: City[];
    selectedCity: City | null;
    handleCitySelect: (city: City) => void;
}

export default function CityModal({
    showCityModal,
    setShowCityModal,
    appSettings,
    getCurrentGeolocation,
    citySearch,
    setCitySearch,
    filteredCities,
    selectedCity,
    handleCitySelect,
}: CityModalProps) {
    if (!showCityModal) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-emerald-deep/90 backdrop-blur-3xl flex items-end justify-center"
            onClick={() => setShowCityModal(false)}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-lg max-h-[90vh] bg-sacred-bg border-t border-sacred-gold/20 rounded-t-[40px] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center p-5">
                    <div className="w-10 h-1 rounded-full bg-sacred-gold/10" />
                </div>

                <div className="px-10 pb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-sacred-gold">
                            {appSettings.language === 'tr' ? 'Şehir Seçin' : 'Select City'}
                        </h2>
                        <p className="text-xs text-white/20 font-bold uppercase tracking-widest">
                            {appSettings.language === 'tr' ? 'Türkiye İlleri Listesi' : 'Cities in Turkey'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCityModal(false)}
                        className="w-10 h-10 rounded-full sacred-glass flex items-center justify-center border-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-10 pb-6">
                    <button
                        onClick={() => {
                            getCurrentGeolocation();
                            setShowCityModal(false);
                        }}
                        className="w-full bg-sacred-gold text-emerald-deep p-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                    >
                        <Navigation size={18} />
                        {appSettings.language === 'tr' ? 'Konumumu Otomatik Belirle' : 'Locate Me Automatically'}
                    </button>

                    <div className="relative mt-4">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sacred-gold/30" />
                        <input
                            type="text"
                            placeholder={appSettings.language === 'tr' ? 'Şehir ara...' : 'Search city...'}
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-sacred-gold/40 transition-all font-medium"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 pb-20 no-scrollbar">
                    <div className="grid gap-2">
                        {filteredCities.map((city) => {
                            const isSelected = selectedCity?.name === city.name;
                            return (
                                <button
                                    key={city.name}
                                    onClick={() => handleCitySelect(city)}
                                    className={`flex items-center gap-4 p-5 rounded-3xl transition-all ${isSelected ? 'bg-sacred-gold/10 border border-sacred-gold/20' : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <MapPin size={18} className={isSelected ? 'text-sacred-gold' : 'text-white/10'} />
                                    <span className={`text-xl font-bold ${isSelected ? 'text-sacred-gold' : 'text-white/60'}`}>
                                        {city.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

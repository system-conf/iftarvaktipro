'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getPrayerTimesByCoords } from '@/lib/api';
import { getCountdown, formatDuration } from '@/lib/utils-time';
import { prayerNamesTr, prayerIconComponents } from '@/lib/prayer-names';
import { turkishCities, City } from '@/lib/cities';
import {
  requestNotificationPermission,
  scheduleIftarNotification,
  scheduleSahurNotification,
} from '@/lib/notifications';
import {
  Moon,
  Sun,
  MapPin,
  Bell,
  BellRing,
  Search,
  X,
  ChevronDown,
  Clock,
  Sunrise,
  Sunset,
  Star,
  CloudMoon,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'iftar' | 'sahur';

const MAIN_PRAYERS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('Konum alınıyor...');
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('iftar');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDate(formatter.format(now));
  }, []);

  const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
    try {
      const result = await getPrayerTimesByCoords(lat, lng);
      setData(result);
      setLoading(false);

      if (notifEnabled) {
        scheduleIftarNotification(result.timings.Maghrib);
        scheduleSahurNotification(result.timings.Fajr);
      }
    } catch (error) {
      console.error('Namaz vakitleri alınamadı:', error);
      setLoading(false);
    }
  }, [notifEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      const city = JSON.parse(saved) as City;
      setSelectedCity(city);
      setCityName(city.name);
      fetchPrayerTimes(city.lat, city.lng);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await getPrayerTimesByCoords(latitude, longitude);
            setData(result);
            const tz = result.meta?.timezone || 'Türkiye';
            const parts = tz.split('/');
            setCityName(parts[parts.length - 1].replace(/_/g, ' '));
            setLoading(false);
          } catch {
            setCityName('Bilinmiyor');
            setLoading(false);
          }
        },
        () => {
          setCityName('İstanbul');
          fetchPrayerTimes(41.0082, 28.9784);
        }
      );
    } else {
      setCityName('İstanbul');
      fetchPrayerTimes(41.0082, 28.9784);
    }
  }, [fetchPrayerTimes]);

  useEffect(() => {
    if (!data) return;

    const targetKey = viewMode === 'iftar' ? 'Maghrib' : 'Fajr';
    const timer = setInterval(() => {
      const diff = getCountdown(data.timings[targetKey]);
      setCountdown(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [data, viewMode]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityName(city.name);
    setLoading(true);
    setShowCityModal(false);
    setCitySearch('');
    localStorage.setItem('selectedCity', JSON.stringify(city));
    fetchPrayerTimes(city.lat, city.lng);
  };

  const handleNotifToggle = async () => {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifEnabled(true);
        if (data) {
          scheduleIftarNotification(data.timings.Maghrib);
          scheduleSahurNotification(data.timings.Fajr);
        }
      }
    } else {
      setNotifEnabled(false);
    }
  };

  const filteredCities = useMemo(
    () =>
      turkishCities.filter((c) =>
        c.name.toLocaleLowerCase('tr').includes(citySearch.toLocaleLowerCase('tr'))
      ),
    [citySearch]
  );

  const getActivePrayer = () => {
    if (!data) return '';
    const now = new Date();
    for (let i = MAIN_PRAYERS.length - 1; i >= 0; i--) {
      const prayer = MAIN_PRAYERS[i];
      const [h, m] = data.timings[prayer].split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);
      if (now >= prayerDate) return prayer;
    }
    return MAIN_PRAYERS[0];
  };

  const activePrayer = getActivePrayer();
  const time = formatDuration(countdown);

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center gap-6">
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <CloudMoon size={56} className="text-primary animate-float" />
          <h2 className="text-xl font-medium text-white/80">Yükleniyor...</h2>
          <Loader2 size={28} className="text-primary animate-spin" />
          <div className="flex gap-3">
            <div className="shimmer w-20 h-20 rounded-2xl" />
            <div className="shimmer w-20 h-20 rounded-2xl" />
            <div className="shimmer w-20 h-20 rounded-2xl" />
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[30%] h-[30%] bg-amber/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10"
      >
        <button
          onClick={() => setShowCityModal(true)}
          className="flex items-center gap-2 glass-card rounded-full px-4 py-2.5 active:scale-95 transition-transform"
        >
          <MapPin size={16} className="text-primary" />
          <span className="font-medium text-sm">{cityName}</span>
          <ChevronDown size={14} className="text-white/40" />
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleNotifToggle}
            className="relative p-2.5 glass-card rounded-full active:scale-95 transition-transform"
          >
            {notifEnabled ? (
              <BellRing size={18} className="text-primary" />
            ) : (
              <Bell size={18} className="text-white/60" />
            )}
            {notifEnabled && <div className="notif-badge" />}
          </button>
        </div>
      </motion.header>

      {/* Date */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-2 mb-1"
      >
        <p className="text-xs text-white/40 tracking-wider uppercase">{currentDate}</p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mt-4 mb-6 px-6"
      >
        <div className="glass-card rounded-full p-1 flex gap-1">
          <button
            onClick={() => setViewMode('iftar')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${viewMode === 'iftar'
                ? 'bg-primary text-dark shadow-lg'
                : 'text-white/50 hover:text-white/80'
              }`}
          >
            <span className="flex items-center gap-2">
              <Sunset size={16} />
              İftar
            </span>
          </button>
          <button
            onClick={() => setViewMode('sahur')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${viewMode === 'sahur'
                ? 'bg-accent text-dark shadow-lg'
                : 'text-white/50 hover:text-white/80'
              }`}
          >
            <span className="flex items-center gap-2">
              <Sunrise size={16} />
              Sahur
            </span>
          </button>
        </div>
      </motion.div>

      {/* Countdown Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
        className="flex flex-col items-center text-center px-6 mb-8"
      >
        <div className="text-sm font-bold tracking-[0.2em] uppercase mb-5 text-white/40">
          {viewMode === 'iftar' ? 'İftara Kalan Süre' : 'Sahura Kalan Süre'}
        </div>

        {/* Countdown Display */}
        <div className="flex items-center gap-3">
          <div className="countdown-digit glow-blue">
            <div className="text-4xl font-extrabold gradient-text">{time.hours}</div>
            <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Saat</div>
          </div>
          <span className="text-3xl font-light text-primary/50 -mt-4">:</span>
          <div className="countdown-digit glow-blue">
            <div className="text-4xl font-extrabold gradient-text">{time.minutes}</div>
            <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Dakika</div>
          </div>
          <span className="text-3xl font-light text-primary/50 -mt-4">:</span>
          <div className="countdown-digit">
            <div className="text-4xl font-extrabold text-white/80">{time.seconds}</div>
            <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Saniye</div>
          </div>
        </div>

        {/* Target Time Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-full px-6 py-3 mt-6 flex items-center gap-3 pulse-glow"
        >
          {viewMode === 'iftar' ? (
            <Moon className="text-amber animate-float" size={22} />
          ) : (
            <Star className="text-accent animate-float" size={22} />
          )}
          <span className="text-base">
            {viewMode === 'iftar' ? 'İftar' : 'İmsak'}:{' '}
            <span className="font-bold text-lg gradient-text-warm">
              {viewMode === 'iftar' ? data.timings.Maghrib : data.timings.Imsak}
            </span>
          </span>
        </motion.div>
      </motion.section>

      {/* Prayer Times Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 mb-8"
      >
        <h3 className="text-sm font-semibold text-white/40 tracking-wider uppercase mb-4 px-1">
          Namaz Vakitleri
        </h3>
        <div className="flex flex-col gap-2.5">
          {MAIN_PRAYERS.map((prayer, index) => {
            const IconComponent = prayerIconComponents[prayer] || Clock;
            return (
              <motion.div
                key={prayer}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.06 }}
                className={`prayer-card flex justify-between items-center ${activePrayer === prayer ? 'active pulse-glow' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activePrayer === prayer
                      ? 'bg-primary/20'
                      : 'bg-white/5'
                    }`}>
                    <IconComponent
                      size={18}
                      className={activePrayer === prayer ? 'text-primary' : 'text-white/40'}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {prayerNamesTr[prayer] || prayer}
                    </p>
                    {activePrayer === prayer && (
                      <p className="text-[10px] text-primary font-medium uppercase tracking-wider mt-0.5">
                        Aktif Vakit
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`font-bold text-lg tabular-nums ${activePrayer === prayer ? 'gradient-text' : 'text-white/70'
                    }`}
                >
                  {data.timings[prayer]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Info Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="px-6 mb-8"
      >
        <div className="glass-card rounded-3xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber/10 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={20} className="text-amber" />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Bilgi</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Vakitler Aladhan API üzerinden Diyanet metodu ile hesaplanmaktadır.
              Bildirim almak için zil simgesine tıklayarak bildirimleri aktif edin.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Bottom Nav */}
      <nav className="nav-bar">
        <div className="max-w-md mx-auto flex justify-around items-center px-6">
          <button
            onClick={() => setViewMode('sahur')}
            className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'sahur' ? 'text-accent' : 'text-white/30'
              }`}
          >
            <Sunrise size={22} />
            <span className="text-[10px] font-medium">Sahur</span>
          </button>
          <button
            onClick={() => setViewMode('iftar')}
            className="relative -mt-6"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${viewMode === 'iftar'
                  ? 'bg-primary glow-blue'
                  : 'bg-accent glow-purple'
                }`}
            >
              <Moon size={26} className="text-dark" />
            </div>
          </button>
          <button
            onClick={() => setShowCityModal(true)}
            className="flex flex-col items-center gap-1 transition-all text-white/30 hover:text-white/60"
          >
            <MapPin size={22} />
            <span className="text-[10px] font-medium">Şehir</span>
          </button>
        </div>
      </nav>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowCityModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-3">
                <h2 className="text-lg font-bold">Şehir Seçin</h2>
                <button
                  onClick={() => setShowCityModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-2 relative">
                <Search
                  size={18}
                  className="absolute left-10 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  placeholder="Şehir ara..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="search-input"
                  autoFocus
                />
              </div>

              {/* City List */}
              <div className="mt-2 pb-6">
                {filteredCities.map((city) => (
                  <div
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className={`city-item flex items-center gap-3 ${selectedCity?.name === city.name ? 'bg-primary/10' : ''
                      }`}
                  >
                    <MapPin
                      size={16}
                      className={
                        selectedCity?.name === city.name
                          ? 'text-primary'
                          : 'text-white/20'
                      }
                    />
                    <span
                      className={`font-medium ${selectedCity?.name === city.name
                          ? 'text-primary'
                          : 'text-white/70'
                        }`}
                    >
                      {city.name}
                    </span>
                    {selectedCity?.name === city.name && (
                      <span className="ml-auto text-xs text-primary">
                        <Sun size={14} />
                      </span>
                    )}
                  </div>
                ))}
                {filteredCities.length === 0 && (
                  <div className="text-center text-white/30 py-8 text-sm">
                    Sonuç bulunamadı
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

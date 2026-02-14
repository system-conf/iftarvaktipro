'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getPrayerTimesByCoords, getCalendarByCoords, PrayerData } from '@/lib/api';
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
  Navigation,
  Calendar,
  Github,
  Globe,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'iftar' | 'sahur';

const MAIN_PRAYERS = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

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

const VERSION = 'v1.1.0';

export default function Home() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [imsakiyeData, setImsakiyeData] = useState<PrayerData[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('Konum alınıyor...');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showImsakiyeModal, setShowImsakiyeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
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
    const dateStr = formatter.format(now);
    Promise.resolve().then(() => {
      setCurrentDate(dateStr);
    });
  }, []);

  const fetchImsakiye = useCallback(async (lat: number, lng: number) => {
    try {
      const now = new Date();
      const result = await getCalendarByCoords(lat, lng, now.getMonth() + 1, now.getFullYear());
      setImsakiyeData(result);
    } catch (error) {
      console.error('İmsakiye verileri alınamadı:', error);
    }
  }, []);

  const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
    try {
      const result = await getPrayerTimesByCoords(lat, lng);
      setData(result);
      fetchImsakiye(lat, lng);
      setLoading(false);

      if (notifEnabled) {
        scheduleIftarNotification(result.timings.Maghrib);
        scheduleSahurNotification(result.timings.Fajr);
      }
    } catch (error) {
      console.error('Namaz vakitleri alınamadı:', error);
      setLoading(false);
    }
  }, [notifEnabled, fetchImsakiye]);

  const getCurrentGeolocation = useCallback(async () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await getPrayerTimesByCoords(latitude, longitude);
            setData(result);
            fetchImsakiye(latitude, longitude);
            const tz = result.meta?.timezone || 'Türkiye';
            const parts = tz.split('/');
            setCityName(parts[parts.length - 1].replace(/_/g, ' '));
            setLoading(false);
            localStorage.removeItem('selectedCity');
          } catch {
            setCityName('İstanbul');
            fetchPrayerTimes(41.0082, 28.9784);
          }
        },
        (error) => {
          console.error('Geolocation error:', error.message, 'Code:', error.code);
          setCityName('İstanbul');
          fetchPrayerTimes(41.0082, 28.9784);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setCityName('İstanbul');
      fetchPrayerTimes(41.0082, 28.9784);
    }
  }, [fetchPrayerTimes, fetchImsakiye]);

  useEffect(() => {
    async function initCity() {
      const saved = localStorage.getItem('selectedCity');
      if (saved) {
        const city = JSON.parse(saved) as City;
        setSelectedCity(city);
        setCityName(city.name);
        await fetchPrayerTimes(city.lat, city.lng);
        return;
      }
      getCurrentGeolocation();
    }

    initCity();
  }, [fetchPrayerTimes, getCurrentGeolocation]);

  useEffect(() => {
    if (!data) return;
    const targetKey = viewMode === 'iftar' ? 'Maghrib' : 'Imsak';
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

  if (loading) {
    return (
      <main className="min-h-screen bg-sacred-bg flex flex-col items-center justify-center p-6 gap-6 bg-arabesque">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="w-24 h-24 rounded-[30%] bg-sacred-emerald border border-sacred-gold/20 flex items-center justify-center shadow-2xl relative">
            <CloudMoon size={48} className="text-sacred-gold animate-float-sacred" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-sacred-gold tracking-tighter">İftar Vakti Pro</h2>
            <div className="flex items-center gap-2 text-white/40">
              <Loader2 size={16} className="animate-spin text-sacred-gold" />
              <span className="text-xs uppercase tracking-[0.2em]">Sistem Yükleniyor...</span>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-sacred-bg bg-arabesque pb-32">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-sacred-emerald rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex justify-between items-center px-6 pt-10"
      >
        <button
          onClick={() => setShowCityModal(true)}
          className="flex items-center gap-3 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full sacred-glass flex items-center justify-center border-sacred-gold/30">
            <MapPin size={18} className="text-sacred-gold" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-sacred-gold/60 font-black uppercase tracking-widest whitespace-nowrap">Şehir Seçimi</span>
            <span className="font-bold text-lg text-white leading-tight flex items-center gap-1">
              {cityName}
              <ChevronDown size={16} className="text-sacred-gold/40" />
            </span>
          </div>
        </button>

        <button
          onClick={handleNotifToggle}
          className={`w-12 h-12 rounded-full sacred-glass flex items-center justify-center active:scale-90 transition-all ${notifEnabled ? 'border-sacred-gold' : 'border-white/10'}`}
        >
          {notifEnabled ? (
            <div className="relative">
              <BellRing size={20} className="text-sacred-gold" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-sacred-gold rounded-full animate-pulse" />
            </div>
          ) : (
            <Bell size={20} className="text-white/30" />
          )}
        </button>
      </motion.header>

      {/* Date */}
      <div className="relative z-10 px-6 mt-8 flex flex-col items-center">
        <div className="px-5 py-1.5 sacred-glass rounded-full border-sacred-gold/10">
          <p className="text-[10px] font-black text-sacred-gold tracking-[0.3em] uppercase">{currentDate}</p>
        </div>
      </div>

      {/* Mode Switcher */}
      <section className="relative z-10 px-6 mt-8 flex justify-center">
        <div className="sacred-glass p-1.5 rounded-2xl flex gap-1 border-sacred-gold/10">
          <button
            onClick={() => setViewMode('iftar')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'iftar'
              ? 'bg-sacred-gold text-emerald-deep shadow-xl'
              : 'text-white/40 hover:text-white/70'}`}
          >
            <Sunset size={18} />
            İftar
          </button>
          <button
            onClick={() => setViewMode('sahur')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'sahur'
              ? 'bg-sacred-gold text-emerald-deep shadow-xl'
              : 'text-white/40 hover:text-white/70'}`}
          >
            <Sunrise size={18} />
            Sahur
          </button>
        </div>
      </section>

      {/* High-Impact Countdown */}
      <motion.section
        key={viewMode}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-12 flex flex-col items-center overflow-hidden"
      >
        <div className="flex flex-col items-center gap-8">
          <div className="text-[11px] font-black uppercase tracking-[0.5em] text-sacred-gold/40">
            {viewMode === 'iftar' ? 'İftara Kalan Vakit' : 'İmsaka Kalan Vakit'}
          </div>

          <div className="flex items-end gap-3 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                <span className="text-4xl font-black text-gold-gradient">{time.hours}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Saat</span>
            </div>
            <span className="text-3xl font-black text-sacred-gold/20 pb-10">:</span>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                <span className="text-4xl font-black text-gold-gradient">{time.minutes}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Dakika</span>
            </div>
            <span className="text-3xl font-black text-sacred-gold/20 pb-10">:</span>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-20 rounded-2xl bg-sacred-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                <span className="text-4xl font-black text-emerald-deep">{time.seconds}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Saniye</span>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mt-4 flex items-center gap-4 px-8 py-3.5 sacred-glass rounded-2xl border-white/5"
          >
            {viewMode === 'iftar' ? (
              <Moon size={22} className="text-sacred-gold animate-float-sacred" />
            ) : (
              <Star size={22} className="text-sacred-gold animate-float-sacred" />
            )}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black tracking-widest text-white/30">Hedef Vakit</span>
              <span className="text-xl font-black text-white tabular-nums">
                {viewMode === 'iftar' ? data?.timings.Maghrib : data?.timings.Imsak}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Prayer Times List */}
      <section className="relative z-10 px-6">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-sacred-gold/40">Günün Vakitleri</h3>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-sacred-gold/20 to-transparent" />
        </div>

        <div className="grid gap-3">
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-sacred-gold text-emerald-deep' : 'bg-white/5 text-sacred-gold/40'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>{prayerNamesTr[prayer]}</span>
                    {isActive && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-sacred-gold">Şu An Geçerli</span>}
                  </div>
                </div>
                <span className={`text-xl font-black tabular-nums ${isActive ? 'text-sacred-gold' : 'text-white/40'}`}>
                  {data?.timings[prayer]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Developer Attribution Section */}
      <section className="px-6 py-12 relative z-10">
        <div className="sacred-glass p-8 rounded-[40px] border-sacred-gold/10 flex flex-col items-center gap-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-sacred-gold/10 flex items-center justify-center">
            <CloudMoon size={32} className="text-sacred-gold" />
          </div>
          <div>
            <h4 className="font-black text-xl text-white mb-2 tracking-tight">İftar Vakti Pro</h4>
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-6">./systemconf tarafından geliştirilmiştir</p>

            <div className="flex flex-col gap-3 w-full">
              <a
                href="http://systemconf.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
              >
                <Globe size={18} className="text-sacred-gold group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-white/70">systemconf.online</span>
              </a>

              <a
                href="https://github.com/system-conf/iftarvaktipro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-sacred-gold/5 hover:bg-sacred-gold/10 rounded-2xl border border-sacred-gold/10 transition-all group"
              >
                <Github size={18} className="text-sacred-gold group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-sacred-gold">GitHub (Açık Kaynak)</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-white/5" />
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <span className="text-[10px] font-black text-white/20 tracking-widest">{VERSION}</span>
            </div>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
        </div>
      </section>

      {/* Bottom Nav Dock */}
      <nav className="sacred-nav">
        <button
          onClick={() => setShowImsakiyeModal(true)}
          className="flex flex-col items-center gap-1 text-white/20 hover:text-sacred-gold transition-all"
        >
          <Calendar size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">İmsakiye</span>
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'iftar' ? 'sahur' : 'iftar')}
          className="nav-center-sacred"
        >
          <Moon size={28} />
        </button>

        <button
          onClick={() => setShowAboutModal(true)}
          className="flex flex-col items-center gap-1 text-white/20 hover:text-sacred-gold transition-all"
        >
          <Info size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Hakkında</span>
        </button>
      </nav>

      {/* City Modal */}
      <AnimatePresence>
        {showCityModal && (
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
                  <h2 className="text-2xl font-black text-sacred-gold">Şehir Seçin</h2>
                  <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Türkiye İlleri Listesi</p>
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
                  Konumumu Otomatik Belirle
                </button>

                <div className="relative mt-4">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sacred-gold/30" />
                  <input
                    type="text"
                    placeholder="Şehir ara..."
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
                        className={`flex items-center gap-4 p-5 rounded-3xl transition-all ${isSelected ? 'bg-sacred-gold/10 border border-sacred-gold/20' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <MapPin size={18} className={isSelected ? 'text-sacred-gold' : 'text-white/10'} />
                        <span className={`text-xl font-bold ${isSelected ? 'text-sacred-gold' : 'text-white/60'}`}>{city.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Imsakiye Modal */}
      <AnimatePresence>
        {showImsakiyeModal && (
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
                  <h2 className="text-3xl font-black text-gold-gradient tracking-tight">İmsakiye</h2>
                  <p className="text-xs text-sacred-gold/60 font-black uppercase tracking-[0.2em]">{cityName} için Ramazan Takvimi</p>
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
                      <th className="px-4 py-3">Gün</th>
                      <th className="px-4 py-3">İmsak</th>
                      <th className="px-4 py-3">Güneş</th>
                      <th className="px-4 py-3">Öğle</th>
                      <th className="px-4 py-3">İkindi</th>
                      <th className="px-4 py-3">Akşam</th>
                      <th className="px-4 py-3">Yatsı</th>
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
                        <tr key={idx} className={`sacred-glass group text-sm font-bold transition-colors ${isToday ? 'bg-sacred-gold/20 border-sacred-gold' : 'hover:bg-white/5'}`}>
                          <td className="px-4 py-4 rounded-l-2xl border-l border-t border-b border-sacred-gold/10">
                            <div className="flex flex-col">
                              <span className={isToday ? 'text-sacred-gold' : 'text-white'}>{day.date.gregorian.day} {turkishMonth}</span>
                              <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter">{turkishDay}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                            <span className={isToday ? 'text-sacred-gold' : 'text-white/60'}>{day.timings.Imsak}</span>
                          </td>
                          <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                            <span className="text-white/40">{day.timings.Sunrise}</span>
                          </td>
                          <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums text-white/40">{day.timings.Dhuhr}</td>
                          <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums text-white/40">{day.timings.Asr}</td>
                          <td className="px-4 py-4 border-t border-b border-sacred-gold/10 tabular-nums">
                            <span className={isToday ? 'text-sacred-gold' : 'text-white font-black'}>{day.timings.Maghrib}</span>
                          </td>
                          <td className="px-4 py-4 rounded-r-2xl border-r border-t border-b border-sacred-gold/10 tabular-nums text-white/40">{day.timings.Isha}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-emerald-deep/90 backdrop-blur-3xl flex items-center justify-center p-6"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm sacred-glass p-8 rounded-[40px] border-sacred-gold/20 flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-3xl bg-sacred-gold/20 flex items-center justify-center">
                <Info size={32} className="text-sacred-gold" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <h3 className="text-2xl font-black text-white">Hakkında</h3>
                <p className="text-xs text-white/30 font-bold uppercase tracking-widest underline decoration-sacred-gold/30 underline-offset-4">İftar Vakti Pro {VERSION}</p>
              </div>

              <p className="text-sm text-white/60 leading-relaxed text-center font-medium">
                Bu uygulama, Ramazan ayında namaz ve iftar vakitlerini modern bir arayüzle sunmak amacıyla <span className="text-sacred-gold font-bold">systemconf</span> tarafından açık kaynak kodlu olarak geliştirilmiştir.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <a href="http://systemconf.online/" target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-sacred-gold text-emerald-deep rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Globe size={18} />
                  systemconf.online
                </a>
                <button onClick={() => setShowAboutModal(false)} className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-bold text-sm uppercase tracking-widest active:scale-95 transition-all">
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

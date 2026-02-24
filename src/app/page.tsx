'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getPrayerTimesByCoords, getCalendarByCoords, PrayerData } from '@/lib/api';
import { getCountdown, formatDuration } from '@/lib/utils-time';
import { prayerNamesTr, prayerNamesEn, prayerIconComponents, MAIN_PRAYERS } from '@/lib/prayer-names';
import { turkishCities, City } from '@/lib/cities';
import {
  requestNotificationPermission,
  scheduleIftarNotification,
  scheduleSahurNotification,
  sendTestNotification,
  scheduleWaterReminder,
  schedulePrayerNotifications
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
  Navigation,
  Calendar,
  Github,
  Globe,
  Info,
  Settings,
  Droplets,
  Languages,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutModal from '@/components/modals/AboutModal';
import SettingsModal from '@/components/modals/SettingsModal';
import CityModal from '@/components/modals/CityModal';
import ImsakiyeModal from '@/components/modals/ImsakiyeModal';
import BottomNav from '@/components/BottomNav';
import PrayerTimesList from '@/components/PrayerTimesList';


type ViewMode = 'iftar' | 'sahur';

const VERSION = 'v1.1.0';

export default function Home() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [imsakiyeData, setImsakiyeData] = useState<PrayerData[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);
  const [cityName, setCityName] = useState('Konum alınıyor...');
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Minimum splash time to ensure UX quality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) setSplashLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [loading]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showImsakiyeModal, setShowImsakiyeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('iftar');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [appSettings, setAppSettings] = useState<{
    language: string;
    waterReminder: boolean;
    prayerNotifications: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  }>({
    language: 'tr',
    waterReminder: true,
    prayerNotifications: false,
    fontSize: 'medium'
  });

  useEffect(() => {
    const html = document.documentElement;
    if (appSettings.fontSize === 'small') {
      html.style.fontSize = '14px';
    } else if (appSettings.fontSize === 'large') {
      html.style.fontSize = '18px';
    } else {
      html.style.fontSize = '16px';
    }
  }, [appSettings.fontSize]);

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

            let minDistance = Infinity;
            let closestCityName = 'Konum';

            if (turkishCities && turkishCities.length > 0) {
              for (const city of turkishCities) {
                const dLat = city.lat - latitude;
                const dLng = city.lng - longitude;
                const distance = dLat * dLat + dLng * dLng;
                if (distance < minDistance) {
                  minDistance = distance;
                  closestCityName = city.name;
                }
              }
            }

            if (minDistance > 10) {
              const tz = result.meta?.timezone || 'Türkiye';
              const parts = tz.split('/');
              closestCityName = parts[parts.length - 1].replace(/_/g, ' ');
            }

            setCityName(closestCityName);
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

    const loadSettings = () => {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setAppSettings(JSON.parse(savedSettings));
      }
    };

    initCity();
    loadSettings();
  }, [fetchPrayerTimes, getCurrentGeolocation]);

  useEffect(() => {
    if (!data) return;
    const targetKey = viewMode === 'iftar' ? 'Maghrib' : 'Imsak';
    const timer = setInterval(() => {
      const now = new Date();
      const targetTimeStr = data.timings[targetKey];
      const target = new Date();
      const [h, m] = targetTimeStr.split(':').map(Number);
      target.setHours(h, m, 0, 0);

      const diffMs = now.getTime() - target.getTime();
      if (diffMs >= 0 && diffMs < 30 * 60 * 1000) {
        setIsCelebrating(true);
      } else {
        setIsCelebrating(false);
      }

      const diff = getCountdown(targetTimeStr);
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
          if (appSettings.waterReminder) scheduleWaterReminder(data.timings.Fajr);
          if (appSettings.prayerNotifications) schedulePrayerNotifications(data.timings);
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


  return (
    <div className="min-h-screen bg-sacred-bg bg-arabesque pb-32">
      <AnimatePresence>
        {splashLoading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-sacred-bg flex flex-col items-center justify-center p-6 bg-arabesque"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-[280px] aspect-[4/5] rounded-[50px] overflow-hidden shadow-[0_0_50px_rgba(2,44,34,0.5)] border border-sacred-gold/20"
            >
              <img
                src="/kapak.png"
                alt="İftar Vakti Pro"
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlays for a premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-sacred-bg via-transparent to-sacred-bg/40 opacity-80" />
              <div className="absolute inset-0 ring-1 ring-inset ring-sacred-gold/30 rounded-[50px]" />

              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <h1 className="text-2xl font-black text-white tracking-tighter gold-glow-text">İftar Vakti Pro</h1>
                  <p className="text-[9px] text-sacred-gold font-black uppercase tracking-[0.4em]">systemconf</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <div className="w-40 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-sacred-gold shadow-[0_0_10px_#d4af37]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-sacred-emerald rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 px-6 pt-8 pb-4 flex justify-between items-center max-w-6xl mx-auto"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">{appSettings.language === 'tr' ? 'Konum' : 'Location'}</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-sacred-gold animate-pulse" />
          </div>
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-black text-white group-hover:text-sacred-gold transition-colors">{cityName === 'Konum alınıyor...' && appSettings.language === 'en' ? 'Locating...' : cityName}</span>
            <ChevronDown size={20} className="text-sacred-gold group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        <button
          onClick={handleNotifToggle}
          className="w-12 h-12 rounded-2xl sacred-glass border-white/5 flex items-center justify-center active:scale-95 transition-all relative"
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

      <div className="max-w-6xl mx-auto w-full">
        {/* Date */}
        <div className="relative z-10 px-6 mt-8 flex flex-col items-center md:items-start">
          <div className="px-5 py-1.5 sacred-glass rounded-full border-sacred-gold/10">
            <p className="text-[10px] font-black text-sacred-gold tracking-[0.3em] uppercase">{currentDate}</p>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start lg:mt-4">

          {/* Left Column: Countdown & Mode Switch */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            {/* Mode Switcher */}
            <section className="relative z-10 px-6 mt-8 flex justify-center lg:justify-start">
              <div className="sacred-glass p-1.5 rounded-2xl flex gap-1 border-sacred-gold/10">
                <button
                  onClick={() => setViewMode('iftar')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'iftar'
                    ? 'bg-sacred-gold text-emerald-deep shadow-xl'
                    : 'text-white/40 hover:text-white/70'}`}
                >
                  <Sunset size={18} />
                  {appSettings.language === 'tr' ? 'İftar' : 'Iftar'}
                </button>
                <button
                  onClick={() => setViewMode('sahur')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'sahur'
                    ? 'bg-sacred-gold text-emerald-deep shadow-xl'
                    : 'text-white/40 hover:text-white/70'}`}
                >
                  <Sunrise size={18} />
                  {appSettings.language === 'tr' ? 'Sahur' : 'Suhoor'}
                </button>
              </div>
            </section>

            {/* High-Impact Countdown */}
            <motion.section
              key={viewMode}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 px-6 py-8 md:py-12 flex flex-col items-center lg:items-start overflow-hidden"
            >
              {isCelebrating ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 py-8 w-full lg:items-start"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-sacred-gold/10 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.2)] relative border border-sacred-gold/30">
                    {viewMode === 'iftar' ? (
                      <Moon size={48} className="text-sacred-gold animate-pulse" />
                    ) : (
                      <Sunrise size={48} className="text-sacred-gold animate-pulse" />
                    )}
                  </div>
                  <div className="text-center lg:text-left flex flex-col gap-2">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gold-gradient tracking-tight">
                      {viewMode === 'iftar' ? 'Hayırlı İftarlar' : 'Hayırlı Sahurlar'}
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] md:text-lg">
                      {viewMode === 'iftar' ? 'Allah Kabul Etsin' : 'Bereketli Olsun'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center lg:items-start gap-8">
                  <div className="text-[11px] font-black uppercase tracking-[0.5em] text-sacred-gold/40">
                    {appSettings.language === 'tr'
                      ? (viewMode === 'iftar' ? 'İftara Kalan Vakit' : 'İmsaka Kalan Vakit')
                      : (viewMode === 'iftar' ? 'Time left for Iftar' : 'Time left for Suhoor')}
                  </div>

                  <div className="flex items-end gap-3 text-white">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-black text-gold-gradient">{time.hours}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">{appSettings.language === 'tr' ? 'Saat' : 'Hours'}</span>
                    </div>
                    <span className="text-3xl font-black text-sacred-gold/20 pb-10">:</span>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-black text-gold-gradient">{time.minutes}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">{appSettings.language === 'tr' ? 'Dakika' : 'Minutes'}</span>
                    </div>
                    <span className="text-3xl font-black text-sacred-gold/20 pb-10">:</span>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl bg-sacred-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        <span className="text-4xl md:text-5xl font-black text-emerald-deep">{time.seconds}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">{appSettings.language === 'tr' ? 'Saniye' : 'Seconds'}</span>
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
                      <span className="text-[9px] uppercase font-black tracking-widest text-white/30">{appSettings.language === 'tr' ? 'Hedef Vakit' : 'Target Time'}</span>
                      <span className="text-xl font-black text-white tabular-nums text-center lg:text-left">
                        {viewMode === 'iftar' ? data?.timings.Maghrib : data?.timings.Imsak}
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.section>
          </div>

          <div className="lg:col-span-7 lg:mt-8">
            <PrayerTimesList
              appSettings={appSettings}
              activePrayer={activePrayer}
              data={data}
            />
          </div>
        </div>

        {/* Developer Attribution Section */}
        <section className="px-6 py-12 relative z-10 max-w-2xl mx-auto lg:max-w-6xl">
          <div className="sacred-glass p-8 rounded-[40px] border-sacred-gold/10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-16 h-16 rounded-3xl bg-sacred-gold/10 flex items-center justify-center shrink-0">
              <CloudMoon size={32} className="text-sacred-gold" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-end md:gap-4 mb-2">
                <h4 className="font-black text-xl text-white tracking-tight">İftar Vakti Pro</h4>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4 md:mb-1">{appSettings.language === 'tr' ? './systemconf tarafından geliştirilmiştir' : 'Developed by ./systemconf'}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <a
                  href="http://systemconf.online/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <Globe size={18} className="text-sacred-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white/70">systemconf</span>
                </a>

                <a
                  href="https://www.mustafacem.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <Globe size={18} className="text-sacred-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white/70">mustafacem</span>
                </a>

                <a
                  href="https://github.com/system-conf/iftarvaktipro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-sacred-gold/5 hover:bg-sacred-gold/10 rounded-2xl border border-sacred-gold/10 transition-all group"
                >
                  <Github size={18} className="text-sacred-gold group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-sacred-gold">{appSettings.language === 'tr' ? 'GitHub (Açık Kaynak)' : 'GitHub (Open Source)'}</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <span className="text-[10px] font-black text-white/20 tracking-widest">{VERSION}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Nav Dock */}
      <BottomNav
        appSettings={appSettings}
        setShowSettingsModal={setShowSettingsModal}
        setShowImsakiyeModal={setShowImsakiyeModal}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setShowAboutModal={setShowAboutModal}
      />

      <CityModal
        showCityModal={showCityModal}
        setShowCityModal={setShowCityModal}
        appSettings={appSettings}
        getCurrentGeolocation={getCurrentGeolocation}
        citySearch={citySearch}
        setCitySearch={setCitySearch}
        filteredCities={filteredCities}
        selectedCity={selectedCity}
        handleCitySelect={handleCitySelect}
      />

      <ImsakiyeModal
        showImsakiyeModal={showImsakiyeModal}
        setShowImsakiyeModal={setShowImsakiyeModal}
        appSettings={appSettings}
        cityName={cityName}
        imsakiyeData={imsakiyeData}
      />

      <AboutModal
        showAboutModal={showAboutModal}
        setShowAboutModal={setShowAboutModal}
        appSettings={appSettings}
        notifEnabled={notifEnabled}
        sendTestNotification={sendTestNotification}
        version={VERSION}
      />

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        appSettings={appSettings}
        setAppSettings={setAppSettings}
        notifEnabled={notifEnabled}
      />
    </div>
  );
}

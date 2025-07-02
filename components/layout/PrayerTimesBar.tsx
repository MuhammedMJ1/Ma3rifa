

import React, { useState, useEffect } from 'react';
import { IRAQI_CITIES, SHIA_PRAYER_METHOD, PRAYER_NAMES_ARABIC } from '../../constants';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MapPin, CalendarDays, Clock, Sunrise, Sun, CloudSun, Sunset, Moon } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string; // To allow indexing with PRAYER_NAMES_ARABIC keys
}

interface AladhanResponseData {
  timings: PrayerTimes;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: AladhanResponseData;
}

const PrayerIcon: React.FC<{ prayerName: keyof typeof PRAYER_NAMES_ARABIC }> = ({ prayerName }: { prayerName: keyof typeof PRAYER_NAMES_ARABIC }) => {
  switch (prayerName) {
    case 'Fajr': return <Sunrise size={18} className="text-sky-300" />;
    case 'Sunrise': return <Sunrise size={18} className="text-orange-300" />;
    case 'Dhuhr': return <Sun size={18} className="text-yellow-300" />;
    case 'Asr': return <CloudSun size={18} className="text-amber-400" />;
    case 'Maghrib': return <Sunset size={18} className="text-red-400" />;
    case 'Isha': return <Moon size={18} className="text-indigo-300" />;
    default: return <Clock size={18} className="text-gray-300" />;
  }
};

export const PrayerTimesBar: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>(IRAQI_CITIES[0].apiValue);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setIsLoading(true);
      setError(null);
      setPrayerTimes(null);
      const today = new Date();
      const dateString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${selectedCity}&country=IQ&method=${SHIA_PRAYER_METHOD}`);
        if (!response.ok) {
          throw new Error(`خطأ في الشبكة: ${response.status}`);
        }
        const data: AladhanResponse = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        } else {
          throw new Error(data.status || "خطأ غير معروف من الواجهة البرمجية لمواقيت الصلاة");
        }
      } catch (err) {
        console.error("Failed to fetch prayer times:", err);
        setError(err instanceof Error ? err.message : "فشل في جلب مواقيت الصلاة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  const formatTime12Hour = (time24?: string): string => {
    if (!time24) return '--:--';
    const [hour, minute] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };

  const displayedPrayers: (keyof typeof PRAYER_NAMES_ARABIC)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-16 bg-slate-800/90 backdrop-blur-md text-white shadow-lg flex items-center justify-between px-3 sm:px-4 text-xs sm:text-sm">
      {/* Left Section: City & Date */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-teal-300" />
          <select
            value={selectedCity}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
            className="bg-transparent border-none outline-none text-white appearance-none cursor-pointer p-1 rounded hover:bg-slate-700/50 focus:bg-slate-700/50"
            aria-label="اختر المدينة"
          >
            {IRAQI_CITIES.map(city => (
              <option key={city.apiValue} value={city.apiValue} className="bg-slate-800 text-white">
                {city.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <CalendarDays size={16} className="text-purple-300" />
          <span>{currentDateTime.toLocaleDateString('ar-IQ-u-nu-arab', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Middle Section: Prayer Times */}
      {isLoading && <div className="flex-grow flex justify-center items-center"><LoadingSpinner size={20} className="text-white"/></div>}
      {error && <div className="flex-grow flex justify-center items-center text-red-400 text-xs px-2 truncate" title={error}><span className="truncate">{error}</span></div>}
      {!isLoading && !error && prayerTimes && (
        <div className="flex-grow flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto hide-scrollbar px-1">
          {displayedPrayers.map(prayerKey => (
            <div key={prayerKey} className="flex flex-col items-center text-center p-1 rounded hover:bg-slate-700/50 transition-colors cursor-default" title={PRAYER_NAMES_ARABIC[prayerKey]}>
              <div className="flex items-center gap-1">
                <PrayerIcon prayerName={prayerKey} />
                <span className="hidden md:inline">{PRAYER_NAMES_ARABIC[prayerKey]}</span>
              </div>
              <span className="font-mono tracking-wider text-teal-200">{formatTime12Hour(prayerTimes[prayerKey])}</span>
            </div>
          ))}
        </div>
      )}

      {/* Right Section: Live Time */}
      <div className="flex items-center gap-1">
        <Clock size={16} className="text-green-300" />
        <span className="font-mono tracking-wider">{currentDateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
      </div>
      {/* Styles for .hide-scrollbar are now in index.html */}
    </div>
  );
};
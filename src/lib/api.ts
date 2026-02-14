import axios from 'axios';

const BASE_URL = 'https://api.aladhan.com/v1';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  [key: string]: string;
}

export interface DateInfo {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar?: string;
  };
  month: {
    number: number;
    en: string;
    ar?: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    timestamp: string;
    gregorian: DateInfo;
    hijri: DateInfo;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
    };
  };
}

export const getPrayerTimesByCity = async (city: string, country: string = 'Turkey') => {
  try {
    const response = await axios.get(`${BASE_URL}/timingsByAddress`, {
      params: {
        address: `${city},${country}`,
        method: 13, // Diyanet method (often method 13 or similar in Aladhan for Turkey)
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

export const getPrayerTimesByCoords = async (lat: number, lng: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/timings`, {
      params: {
        latitude: lat,
        longitude: lng,
        method: 13,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching prayer times by coords:', error);
    throw error;
  }
};

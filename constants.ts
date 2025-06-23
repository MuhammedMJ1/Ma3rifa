
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; // Not used in this version but good to have

export const DEFAULT_FONT_SIZE = 100; // 100%
export const FONT_SIZE_STEP = 10;
export const MIN_FONT_SIZE = 50;
export const MAX_FONT_SIZE = 200;

export const DEFAULT_BACKGROUND_COLOR = '#FFFFFF'; // White
export const DEFAULT_TEXT_COLOR = '#000000'; // Black

export const AVAILABLE_FONTS = [
  { name: 'افتراضي (Noto Sans Arabic)', value: 'Noto Sans Arabic, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
];

export const DEFAULT_FONT_FAMILY = AVAILABLE_FONTS[0].value; // Use the default from AVAILABLE_FONTS

export const AVAILABLE_BACKGROUND_COLORS = [
  { name: 'أبيض', value: '#FFFFFF' },
  { name: 'بيج فاتح', value: '#F5F5DC' },
  { name: 'رمادي فاتح', value: '#E0E0E0' },
  { name: 'وضع ليلي (داكن)', value: '#121212' },
];

// For dark mode background, text color should change
export const DARK_MODE_TEXT_COLOR = '#FFFFFF';

export const TTS_DEFAULT_SPEED = 1;
export const TTS_SPEED_STEP = 0.1;
export const TTS_MIN_SPEED = 0.5;
export const TTS_MAX_SPEED = 2;

// Placeholder links for religious texts
export const QURAN_LINK = "https://quran.com";
export const SAHIFA_SAJJADIYA_LINK = "https://www.duas.org/sajjadiya/";
export const NAHJ_AL_BALAGHA_LINK = "https://www.nahj.org/";

export const DEBOUNCE_DELAY = 500; // ms for search input

// For PrayerTimesBar
export const IRAQI_CITIES = [
  { apiValue: "Baghdad", displayName: "بغداد" },
  { apiValue: "Karbala", displayName: "كربلاء" },
  { apiValue: "Najaf", displayName: "النجف" },
  { apiValue: "Basra", displayName: "البصرة" },
  { apiValue: "Mosul", displayName: "الموصل" },
  { apiValue: "Erbil", displayName: "أربيل" },
  { apiValue: "Kirkuk", displayName: "كركوك" },
  { apiValue: "Sulaymaniyah", displayName: "السليمانية" },
  { apiValue: "Hillah", displayName: "الحلة" },
  { apiValue: "Ramadi", displayName: "الرمادي" },
  { apiValue: "Fallujah", displayName: "الفلوجة" },
  { apiValue: "Kut", displayName: "الكوت" },
  { apiValue: "Diwaniyah", displayName: "الديوانية" },
  { apiValue: "Samawah", displayName: "السماوة" },
  { apiValue: "Nasiriyah", displayName: "الناصرية" },
  { apiValue: "Amarah", displayName: "العمارة" },
  { apiValue: "Baqubah", displayName: "بعقوبة" },
  { apiValue: "Tikrit", displayName: "تكريت" },
];

export const SHIA_PRAYER_METHOD = 4; // Value for Jafari (Ithna Ashari) in Aladhan API
export const PRAYER_NAMES_ARABIC = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
  Imsak: "الإمساك",
  Midnight: "منتصف الليل"
};

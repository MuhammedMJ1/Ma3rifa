
import { DisplaySettings } from '../types';
import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY, DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '../constants';

const DISPLAY_SETTINGS_KEY = 'pdfReaderDisplaySettings';
const LAST_PDF_NAME_KEY = 'lastPdfFileName'; // Store only name as File object cannot be stored
const LAST_READ_PAGE_KEY_PREFIX = 'lastReadPage_'; // Per PDF

export const storageService = {
  loadDisplaySettings: (): DisplaySettings => {
    const settingsStr = localStorage.getItem(DISPLAY_SETTINGS_KEY);
    if (settingsStr) {
      try {
        return JSON.parse(settingsStr) as DisplaySettings;
      } catch (e) {
        console.error("Failed to parse display settings from localStorage", e);
      }
    }
    return {
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: DEFAULT_FONT_FAMILY,
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      textColor: DEFAULT_TEXT_COLOR,
    };
  },

  saveDisplaySettings: (settings: DisplaySettings): void => {
    localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(settings));
  },

  saveLastPdfName: (fileName: string): void => {
    localStorage.setItem(LAST_PDF_NAME_KEY, fileName);
  },

  loadLastPdfName: (): string | null => {
    return localStorage.getItem(LAST_PDF_NAME_KEY);
  },

  saveLastReadPage: (pdfName: string, pageNum: number): void => {
    if (!pdfName) return;
    localStorage.setItem(`${LAST_READ_PAGE_KEY_PREFIX}${pdfName}`, pageNum.toString());
  },

  loadLastReadPage: (pdfName: string): number | null => {
    if (!pdfName) return null;
    const pageStr = localStorage.getItem(`${LAST_READ_PAGE_KEY_PREFIX}${pdfName}`);
    return pageStr ? parseInt(pageStr, 10) : null;
  },
};

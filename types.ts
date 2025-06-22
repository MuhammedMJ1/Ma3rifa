
export interface ChapterIndexItem {
  id: string; // Unique ID for the chapter, e.g., generated from title
  title: string;
  // We will try to find this title in the text to scroll to it.
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum DisplayMode {
  Translated = 'translated',
  Original = 'original',
  SideBySide = 'side-by-side', // Optional
}

export interface Book {
  id: string; // UUID
  name: string; // filename or user-defined
  originalText: string;
  translatedText: string;
  chapters: ChapterIndexItem[];
  lastReadScrollPosition: number;
  currentFontFamily: string;
  currentFontSize: number;
  dateAdded: string; // ISO date string
  displayMode: DisplayMode;
}

export interface AppSettings {
  theme: Theme;
  defaultFontFamily: string;
  defaultFontSize: number;
}

export interface VoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

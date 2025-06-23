import { TtsState } from '../types';

export const ttsService = {
  getVoices: (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      // Ensure speechSynthesis is available
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve([]);
        return;
      }
      let voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
        return;
      }
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    });
  },

  speak: (
    text: string, 
    voice: SpeechSynthesisVoice | null, 
    speed: number, 
    lang: string = 'ar-SA',
    onend?: () => void,
    onerror?: (event: SpeechSynthesisErrorEvent) => void
  ): void => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return;

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = voice?.lang || lang; // Prefer voice's lang, fallback to specified
    utterance.rate = speed; // Speed (0.1 to 10, default 1)
    utterance.pitch = 1; // Pitch (0 to 2, default 1)
    utterance.volume = 1; // Volume (0 to 1, default 1)

    if (onend) {
      utterance.onend = onend;
    }
    if (onerror) {
      utterance.onerror = onerror;
    } else {
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
      };
    }

    window.speechSynthesis.speak(utterance);
  },

  pause: (): void => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  },

  resume: (): void => {
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  },

  stop: (): void => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeaking: (): boolean => {
    return typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false;
  },

  isPaused: (): boolean => {
    return typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.paused : false;
  }
};
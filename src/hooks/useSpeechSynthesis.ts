
import { useState, useEffect, useCallback } from 'react';
import { VoiceOption } from '../types';

interface SpeechSynthesisControls {
  speak: (text: string, lang?: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  voices: VoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  isSpeaking: boolean;
  isPaused: boolean;
}

const useSpeechSynthesis = (): SpeechSynthesisControls => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = window.speechSynthesis;

  const populateVoiceList = useCallback(() => {
    const availableVoices = synth.getVoices();
    const voiceOptions = availableVoices.map(v => ({ name: v.name, lang: v.lang, voice: v }));
    setVoices(voiceOptions);

    // Try to auto-select an Arabic voice
    const arabicVoice = voiceOptions.find(v => v.lang.startsWith('ar'))?.voice;
    if (arabicVoice) {
      setSelectedVoice(arabicVoice);
    } else if (voiceOptions.length > 0) {
      setSelectedVoice(voiceOptions[0].voice); // Fallback to first available
    }
  }, [synth]);

  useEffect(() => {
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
    return () => {
      synth.cancel(); // Cancel any ongoing speech when component unmounts
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // populateVoiceList has synth dependency which is stable.

  const speak = (text: string, lang: string = 'ar-SA') => {
    if (synth.speaking) {
      console.warn('SpeechSynthesis is already speaking.');
      synth.cancel(); // Cancel previous before starting new
    }
    if (text !== '') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
        setIsPaused(false);
      };
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
         utterance.lang = lang;
      }
      utterance.rate = 0.9; // Slightly slower for clarity
      synth.speak(utterance);
    }
  };

  const pause = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const cancel = () => {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return { speak, pause, resume, cancel, voices, selectedVoice, setSelectedVoice, isSpeaking, isPaused };
};

export default useSpeechSynthesis;
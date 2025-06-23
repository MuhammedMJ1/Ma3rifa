import { useState, useEffect, useCallback } from 'react';
import { ttsService } from '../services/ttsService';
import { TtsState } from '../types';
import { TTS_DEFAULT_SPEED } from '../constants';

export const useSpeechSynthesis = () => {
  const [ttsState, setTtsState] = useState<TtsState>({
    isPlaying: false,
    speed: TTS_DEFAULT_SPEED,
    availableVoices: [],
    selectedVoice: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech Synthesis API not available.");
      return;
    }
    const fetchVoices = async () => {
      const voices = await ttsService.getVoices();
      const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
      setTtsState(prev => ({
        ...prev,
        availableVoices: arabicVoices,
        selectedVoice: arabicVoices.find(v => v.default && v.lang === 'ar-SA') || 
                       arabicVoices.find(v => v.lang === 'ar-SA') || // Fallback to any ar-SA
                       arabicVoices[0] || 
                       null,
      }));
    };
    fetchVoices();
  }, []);

  const play = useCallback((text: string) => {
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    const handleSpeechEnd = () => {
      setTtsState(prev => ({ ...prev, isPlaying: false }));
    };
  
    const handleSpeechError = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error in hook:', event.error);
      setTtsState(prev => ({ ...prev, isPlaying: false }));
    };

    ttsService.speak(
        text, 
        ttsState.selectedVoice, 
        ttsState.speed, 
        ttsState.selectedVoice?.lang || 'ar-SA',
        handleSpeechEnd,
        handleSpeechError
    );
    setTtsState(prev => ({ ...prev, isPlaying: true }));

  }, [ttsState.selectedVoice, ttsState.speed]);

  const pause = useCallback(() => {
    ttsService.pause();
    // SpeechSynthesis API's 'paused' state is true, 'speaking' becomes false after pause.
    // Our 'isPlaying' should reflect intent; if paused, it's not "actively playing".
    // The 'isSynthesisPaused' function will reflect the actual paused state of the API.
    setTtsState(prev => ({ ...prev, isPlaying: false })); 
  }, []);

  const resume = useCallback(() => {
    ttsService.resume();
    // After resume, 'speaking' becomes true, 'paused' becomes false.
    setTtsState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stop = useCallback(() => {
    ttsService.stop();
    setTtsState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setTtsState(prev => ({ ...prev, speed }));
  }, []);

  const setSelectedVoice = useCallback((voiceName: string) => {
    const voice = ttsState.availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setTtsState(prev => ({ ...prev, selectedVoice: voice }));
    }
  }, [ttsState.availableVoices]);

  // This effect synchronizes the isPlaying state if speech ends unexpectedly
  // or if state changes are missed by callbacks (e.g. browser specific issues).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const intervalId = setInterval(() => {
      const speaking = window.speechSynthesis.speaking;
      const paused = window.speechSynthesis.paused;

      setTtsState(prev => {
        if (prev.isPlaying && !speaking && !paused) { // Ended or stopped externally
          return { ...prev, isPlaying: false };
        }
        if (!prev.isPlaying && speaking && !paused) { // Started or resumed externally / state out of sync
          return { ...prev, isPlaying: true };
        }
        // If prev.isPlaying is true, but speaking is false and paused is true,
        // it means it's paused. The pause() function already sets isPlaying to false.
        // So, isPlaying reflects "actively outputting sound".
        return prev;
      });
    }, 500); // Check less frequently if callbacks are reliable

    return () => clearInterval(intervalId);
  }, []); // Run once, ttsState.isPlaying removed from deps as it caused potential loops if setter inside was not careful


  return {
    ttsState,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    setSelectedVoice,
    isSynthesisPaused: ttsService.isPaused, // Direct check for true paused state
  };
};
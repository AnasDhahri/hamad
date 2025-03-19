import { useState, useCallback, useEffect } from 'react';
import { SpeechSynthesisService } from '../services/azure/speechSynthesis';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load voices when available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().map(v => ({ name: v.name, lang: v.lang })));
      };
    }
  }, []);

  // Function to preload TTS before playing
  const preloadTTS = (text: string, language: string, onReady: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    // Detect when preloading is complete
    utterance.onend = () => {
      console.log("TTS Preloaded, now ready to play...");
      onReady();
    };

    // Fake-play to force preloading
    speechSynthesis.speak(utterance);
  };

  const speak = useCallback(async (text: string, language: string) => {
    if (!text || isSpeaking) {
      console.log('Skipping speak: No text or already speaking');
      return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      setIsSpeaking(true);
      setError(null);

      if (isMobile && 'speechSynthesis' in window) {
        console.log('Using native SpeechSynthesis on mobile for:', { text, language });

        preloadTTS(text, language, () => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          utterance.volume = 1.0;
          utterance.rate = 0.9; // Slightly slow down on mobile to prevent stuttering

          const voices = window.speechSynthesis.getVoices();
          console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));

          const shortLang = language.split('-')[0]; // e.g., "ar-SA" -> "ar"
          const matchingVoice = voices.find(v => v.lang.startsWith(shortLang)) ||
                               voices.find(v => v.lang === 'en-US'); // Fallback to English
          if (matchingVoice) {
            utterance.voice = matchingVoice;
            console.log(`Selected voice for ${language}:`, matchingVoice.name, matchingVoice.lang);
          } else {
            console.warn(`No voice found for ${language}, using default`);
          }

          utterance.onstart = () => console.log(`Native TTS started: "${text}"`);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = (event) => {
            console.error('Native TTS error:', event.error);
            setIsSpeaking(false);
          };
          
          window.speechSynthesis.speak(utterance);
        });
      } else {
        console.log('Using Azure SpeechSynthesis on PC/mobile fallback:', { text, language });
        const speechService = new SpeechSynthesisService();
        await speechService.synthesizeSpeech(text, language);
      }
    } catch (err: any) {
      console.error('Speech synthesis failed:', err);
      setError(err.message || 'Unknown error during speech synthesis');
    } finally {
      if (!isMobile || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
      }
    }
  }, [isSpeaking]);

  return {
    speak,
    isSpeaking,
    error,
  };
}

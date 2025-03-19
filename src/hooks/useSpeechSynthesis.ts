import { useState, useCallback, useEffect } from 'react';
import { SpeechSynthesisService } from '../services/azure/speechSynthesis';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Detect if device is iOS
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Load voices when available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().map(v => ({ name: v.name, lang: v.lang })));
      };
    }
  }, []);

  // ✅ **Fix: Preload without actually speaking**
  const preloadTTS = (language: string) => {
    if (isPreloaded) return; // Prevent multiple preloads

    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.lang = language;
    
    utterance.onend = () => {
      console.log("TTS Preloaded and ready.");
      setIsPreloaded(true);
    };

    speechSynthesis.speak(utterance);
  };

  const speak = useCallback(async (text: string, language: string) => {
    if (!text || isSpeaking) {
      console.log('Skipping speak: No text or already speaking');
      return;
    }

    try {
      setIsSpeaking(true);
      setError(null);

      if (!isIOS && 'speechSynthesis' in window) {
        // ✅ **Android / PC**: Use system TTS
        console.log('Using native SpeechSynthesis:', { text, language });

        preloadTTS(language); // ✅ Preload first, without speaking

        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          utterance.volume = 1.0;
          utterance.rate = 0.9; // Slightly slow down on mobile to prevent stuttering

          // Pick the best voice
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
        }, 200); // ✅ Small delay ensures preload completes

      } else {
        // ✅ **iOS**: Always use Azure Speech Synthesis
        console.log('Using Azure SpeechSynthesis on iOS:', { text, language });
        const speechService = new SpeechSynthesisService();
        await speechService.synthesizeSpeech(text, language);
      }
    } catch (err: any) {
      console.error('Speech synthesis failed:', err);
      setError(err.message || 'Unknown error during speech synthesis');
    } finally {
      if (!('speechSynthesis' in window) || isIOS) {
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

// useTranslation.ts
import { useState, useCallback, useRef } from 'react';
import { TranslationService } from '../services/azure/translationService';

type OnRecognizedFn = (text: string) => void;
type OnSpeakerTranslationFn = (translation: string) => void;
type OnLockSpeaker1LangFn = (lang: string) => void;
type SpeakTTSFn = (text: string, lang: string) => Promise<void>;
type OnQuotaExceededFn = () => void;

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const translationServiceRef = useRef(new TranslationService());

  const initRecognition = useCallback(async () => {
    await translationServiceRef.current.initRecognition();
  }, []);

  const startTranslation = useCallback(
    async (
      speaker: 'speaker1' | 'speaker2',
      speaker2Lang: string,
      speaker1LangRef: { current: string | null },
      setSpeaker1Lang: OnLockSpeaker1LangFn,
      onRecognized: OnRecognizedFn,
      onSpeaker1Translation: OnSpeakerTranslationFn,
      onSpeaker2Translation: OnSpeakerTranslationFn,
      speakTTS: SpeakTTSFn,
      onQuotaExceeded: OnQuotaExceededFn
    ) => {
      if (!isTranslating) {
        setIsTranslating(true);
        await translationServiceRef.current.toggleMicrophone(
          speaker,
          speaker2Lang,
          speaker1LangRef,
          setSpeaker1Lang,
          onRecognized,
          onSpeaker1Translation,
          onSpeaker2Translation,
          speakTTS,
          onQuotaExceeded
        );
      }
    },
    [isTranslating]
  );

  const stopTranslation = useCallback(async () => {
    if (isTranslating) {
      await translationServiceRef.current.stopTranslation();
      setIsTranslating(false);
    }
  }, [isTranslating]);

  return {
    isTranslating,
    startTranslation,
    stopTranslation,
    initRecognition
  };
};

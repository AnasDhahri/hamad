// src/hooks/useTranslation.ts
import { useState, useCallback, useEffect } from 'react';
import { TranslationService } from '../services/azure/translationService';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationService, setTranslationService] = useState<TranslationService | null>(null);

  useEffect(() => {
    const svc = new TranslationService();
    setTranslationService(svc);
    return () => {
      svc.stopTranslation().catch(() => {});
    };
  }, []);

  const startTranslation = useCallback(
    async (
      speaker2Lang: string,
      speaker1LangRef: { current: string | null },
      setSpeaker1Lang: (lang: string) => void,
      onRecognized: (text: string) => void,
      onSpeaker1Translation: (t: string) => void,
      onSpeaker2Translation: (t: string) => void,
      speakTTS: (text: string, lang: string) => Promise<void>
    ) => {
      try {
        if (!translationService) throw new Error('Translation service not ready');
        setError(null);
        await translationService.startTranslation(
          speaker2Lang,
          speaker1LangRef,
          setSpeaker1Lang,
          onRecognized,
          onSpeaker1Translation,
          onSpeaker2Translation,
          speakTTS
        );
        setIsTranslating(true);
      } catch (err: any) {
        setError(err.message);
        setIsTranslating(false);
        console.error('Translation error:', err);
      }
    },
    [translationService]
  );

  const stopTranslation = useCallback(async () => {
    if (!translationService) return;
    try {
      await translationService.stopTranslation();
    } finally {
      setIsTranslating(false);
    }
  }, [translationService]);

  return {
    isTranslating,
    error,
    startTranslation,
    stopTranslation
  };
}

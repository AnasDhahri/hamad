import { useState, useCallback, useEffect } from 'react';
import { TranslationService } from '../services/azure/translationService';

type OnQuotaExceededFn = () => void; // Define the type for the new callback

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

  const toggleTranslation = useCallback(
    async (
      speaker2Lang: string,
      speaker1LangRef: { current: string | null },
      setSpeaker1Lang: (lang: string) => void,
      onRecognized: (text: string) => void,
      onSpeaker1Translation: (t: string) => void,
      onSpeaker2Translation: (t: string) => void,
      speakTTS: (text: string, lang: string) => Promise<void>,
      onQuotaExceeded: OnQuotaExceededFn // Add the new parameter
    ) => {
      try {
        if (!translationService) throw new Error('Translation service not ready');
        setError(null);
        await translationService.toggleMicrophone(
          speaker2Lang,
          speaker1LangRef,
          setSpeaker1Lang,
          onRecognized,
          onSpeaker1Translation,
          onSpeaker2Translation,
          speakTTS,
          onQuotaExceeded // Pass the new callback to TranslationService
        );
        setIsTranslating(translationService.isActive());
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
      setIsTranslating(translationService.isActive());
    } catch (err: any) {
      console.error('Stop translation error:', err);
      setIsTranslating(false);
    }
  }, [translationService]);

  return {
    isTranslating,
    error,
    startTranslation: toggleTranslation, // Alias for backward compatibility
    stopTranslation,
    toggleTranslation,
  };
}
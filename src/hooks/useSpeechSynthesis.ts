import { useState, useCallback } from 'react';
import { SpeechSynthesisService } from '../services/azure/speechSynthesis';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string, language: string) => {
    if (!text || isSpeaking) return;

    try {
      setIsSpeaking(true);
      setError(null);
      
      const speechService = new SpeechSynthesisService();
      await speechService.synthesizeSpeech(text, language);
    } catch (err: any) {
      setError(err.message);
      console.error('Speech synthesis error:', err);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    speak,
    isSpeaking,
    error
  };
}
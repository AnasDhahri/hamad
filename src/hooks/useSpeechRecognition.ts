import { useState, useCallback, useEffect } from 'react';
import { SpeechRecognitionService } from '../services/azure/speechRecognition';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognitionService, setRecognitionService] = useState<SpeechRecognitionService | null>(null);

  useEffect(() => {
    setRecognitionService(new SpeechRecognitionService());
    return () => {
      recognitionService?.stopRecognition();
    };
  }, []);

  const startListening = useCallback(async (
    language: string,
    onRecognized: (text: string) => void,
    onInterim: (text: string) => void
  ) => {
    try {
      if (!recognitionService) {
        throw new Error('Speech recognition service not initialized');
      }

      setError(null);
      await recognitionService.startRecognition(language, onRecognized, onInterim);
      setIsListening(true);
    } catch (err: any) {
      setError(err.message);
      setIsListening(false);
      console.error('Speech recognition error:', err);
    }
  }, [recognitionService]);

  const stopListening = useCallback(async () => {
    try {
      await recognitionService?.stopRecognition();
    } finally {
      setIsListening(false);
    }
  }, [recognitionService]);

  return {
    isListening,
    error,
    startListening,
    stopListening
  };
}
import { useState, useEffect, useRef, useCallback } from 'react';
import { TranslationService } from '../services/translationService';

export function useTranslationService() {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<TranslationService | null>(null);

  useEffect(() => {
    try {
      serviceRef.current = new TranslationService();
    } catch (err: any) {
      setError(err.message);
    }

    return () => {
      if (isListening) {
        serviceRef.current?.stopTranslation().catch(console.error);
      }
    };
  }, []);

  const startTranslation = useCallback(async (
    fromLanguage: string,
    toLanguage: string,
    onInterimResult: (text: string) => void,
    onTranslation: (translation: string) => void
  ) => {
    if (!serviceRef.current) {
      throw new Error('Translation service not initialized. Please refresh the page and try again.');
    }

    try {
      await serviceRef.current.startTranslation(
        fromLanguage,
        toLanguage,
        onInterimResult,
        onTranslation
      );
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      console.error('Translation error:', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const stopTranslation = useCallback(async () => {
    try {
      await serviceRef.current?.stopTranslation();
    } catch (error: any) {
      console.error('Error stopping translation:', error);
      throw error;
    }
  }, []);

  const synthesizeSpeech = useCallback(async (
    text: string,
    language: string
  ) => {
    if (!serviceRef.current) {
      throw new Error('Translation service not initialized');
    }
    
    try {
      await serviceRef.current.synthesizeSpeech(text, language);
    } catch (error: any) {
      console.error('Speech synthesis error:', error);
      throw error;
    }
  }, []);

  return {
    isListening,
    isInitializing,
    error,
    setIsListening,
    setIsInitializing,
    setError,
    startTranslation,
    stopTranslation,
    synthesizeSpeech
  };
}
import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/config';

interface ConversationEntry {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
}

export function useConversationHistory() {
  const [history, setHistory] = useState<ConversationEntry[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addEntry = useCallback((entry: Omit<ConversationEntry, 'id' | 'timestamp'>) => {
    const newEntry: ConversationEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }, []);

  return {
    history,
    addEntry,
    clearHistory
  };
}
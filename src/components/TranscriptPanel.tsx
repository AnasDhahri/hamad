import React from 'react';
import { RepeatIcon } from 'lucide-react';
import LanguageDisplay from './LanguageDisplay';

interface TranscriptPanelProps {
  transcript: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  onRepeatTranslation?: () => void;
  isRepeating?: boolean;
}

export default function TranscriptPanel({
  transcript,
  translation,
  sourceLanguage,
  targetLanguage,
  onRepeatTranslation,
  isRepeating = false
}: TranscriptPanelProps) {
  return (
    <div className="w-full space-y-4">
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Original</h2>
          <LanguageDisplay languageCode={sourceLanguage} />
        </div>
        <p className="text-text-secondary">
          {transcript || 'Waiting for speech...'}
        </p>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">Translation</h2>
            {translation && (
              <button
                onClick={onRepeatTranslation}
                disabled={isRepeating}
                className={`p-2 rounded-full transition-all ${
                  isRepeating 
                    ? 'bg-primary/20 text-primary animate-pulse cursor-wait' 
                    : 'hover:bg-surface/80 text-text-secondary hover:text-text-primary'
                }`}
                title="Repeat translation"
              >
                <RepeatIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <LanguageDisplay languageCode={targetLanguage} />
        </div>
        <p className="text-text-secondary">
          {translation || 'Translation will appear here...'}
        </p>
      </div>
    </div>
  );
}
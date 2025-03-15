import React from 'react';
import LanguageDisplay from './LanguageDisplay';

interface TranscriptDisplayProps {
  text: string;
  language: string;
  label: string;
}

const TranscriptDisplay = ({ text, language, label }: TranscriptDisplayProps) => {
  return (
    <div className="bg-gray-100/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-[#333] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h2>
        <LanguageDisplay languageCode={language} />
      </div>
      <div className="prose dark:prose-invert max-w-none">
        {text || <span className="text-gray-500">Waiting for speech...</span>}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
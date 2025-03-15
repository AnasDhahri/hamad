import React from 'react';
import { languages } from '../utils/languageData';

interface LanguageDisplayProps {
  languageCode: string;
  className?: string;
}

const LanguageDisplay: React.FC<LanguageDisplayProps> = ({ languageCode, className = '' }) => {
  const language = languages.find(lang => lang.code === languageCode);
  
  if (!language) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={`https://flagcdn.com/24x18/${language.flag}.png`}
        alt={`${language.name} flag`}
        className="w-6 h-4 object-cover rounded"
      />
      <span className="text-sm text-gray-400">{language.name}</span>
    </div>
  );
};

export default LanguageDisplay;
import React, { useState, useEffect, useRef } from 'react';
import { languages } from '../utils/languageData';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export default function LanguageSelector({ value, onChange, label, disabled = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languages.find(lang => lang.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex flex-col relative" ref={dropdownRef}>
      {label && <label className="text-sm text-text-secondary mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-surface/40 text-text-primary border border-white/5 rounded-lg pl-12 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] min-w-[200px] backdrop-blur-sm flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span>{selectedLanguage?.name || 'Select a language'}</span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        {selectedLanguage && selectedLanguage.flag && selectedLanguage.flag !== 'un' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <img
              src={`https://flagcdn.com/24x18/${selectedLanguage.flag}.png`}
              alt={`${selectedLanguage.name} flag`}
              className="w-6 h-4 object-cover rounded"
            />
          </div>
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-blue-900 backdrop-blur-md border border-white/5 rounded-lg shadow-lg overflow-hidden z-50 ">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-surface/80 transition-colors ${lang.code === value ? 'bg-surface/60' : ''}`}
            >
              <img
                src={`https://flagcdn.com/24x18/${lang.flag}.png`}
                alt={`${lang.name} flag`}
                className="w-6 h-4 object-cover rounded"
              />
              <span className="text-text-primary text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

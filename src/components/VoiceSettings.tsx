// VoiceSettings.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { getVoicesForLanguage } from '../services/azure/voiceMap';
import { voiceStyles } from '../services/azure/voiceStyles';

interface VoiceSettingsProps {
  language: string;
  onVoiceChange: (voice: string) => void;
  onStyleChange: (style: string) => void;
  selectedVoice: string;
  selectedStyle: string;
}

// A fallback if no voice styles exist for a given language (for example, Arabic)
const defaultVoiceStyles = [
  { style: 'default', name: 'Default', description: 'Default speaking style' },
];

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  language,
  onVoiceChange,
  onStyleChange,
  selectedVoice,
  selectedStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const voices = getVoicesForLanguage(language);
  // Use voiceStyles for the language, or fallback to the default if missing/empty.
  const styles = (voiceStyles[language] && voiceStyles[language].length > 0)
    ? voiceStyles[language]
    : defaultVoiceStyles;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDialog = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDialog}
        className="p-2 rounded-full hover:bg-surface/80 transition-colors"
        aria-label="Voice Settings"
        aria-expanded={isOpen}
        aria-controls="voice-settings-dialog"
      >
        <Settings className="w-5 h-5 text-text-secondary" />
      </button>

      {isOpen && (
        <div
          ref={dialogRef}
          id="voice-settings-dialog"
          role="dialog"
          aria-label="Voice Settings"
          className="absolute right-0 top-full mt-2 p-4 bg-surface/80 backdrop-blur-md border border-white/5 rounded-xl shadow-lg min-w-[300px] z-50"
        >
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="voice-select" 
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Voice
              </label>
              <select
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => onVoiceChange(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="style-select" 
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Speaking Style
              </label>
              <select
              id="style-select"
              value={selectedStyle}
              onChange={(e) => {
                onStyleChange(e.target.value);
              }}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {styles.map((style) => (
                <option key={style.style} value={style.style} className="bg-gray-700 text-white">
                  {style.name} - {style.description}
                </option>
              ))}
            </select>
            </div>


            <div className="text-xs text-text-secondary mt-2">
              <p>Voice settings will be applied to the next translation.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSettings;

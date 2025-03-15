import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import VoiceSettings from './VoiceSettings';
import SwapLanguages from './SwapLanguages';

interface SettingsMenuProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceLanguageChange: (language: string) => void;
  onTargetLanguageChange: (language: string) => void;
  selectedVoice: string;
  selectedStyle: string;
  onVoiceChange: (voice: string) => void;
  onStyleChange: (style: string) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  selectedVoice,
  selectedStyle,
  onVoiceChange,
  onStyleChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    onSourceLanguageChange(targetLanguage);
    onTargetLanguageChange(tempLang);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
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
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-surface/40 hover:bg-surface/60 backdrop-blur-md border border-white/5 transition-all duration-200"
      >
        <Settings className="w-5 h-5 text-[rgb(var(--primary))]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-4 glass-panel p-6 min-w-[320px] z-50"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Language Settings</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <LanguageSelector
                        value={sourceLanguage}
                        onChange={onSourceLanguageChange}
                        label="From"
                      />
                    </div>
                    <div className="pt-6">
                      <SwapLanguages onSwap={handleSwapLanguages} />
                    </div>
                    <div className="flex-1">
                      <LanguageSelector
                        value={targetLanguage}
                        onChange={onTargetLanguageChange}
                        label="To"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Voice Settings</h3>
                  <VoiceSettings
                    language={targetLanguage}
                    selectedVoice={selectedVoice}
                    selectedStyle={selectedStyle}
                    onVoiceChange={onVoiceChange}
                    onStyleChange={onStyleChange}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsMenu;
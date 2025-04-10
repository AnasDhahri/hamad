import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import MicButton from './MicButton';
import StaticLogo from './StaticLogo';

export default function ConversationMode() {
  const speaker1LangRef = useRef<string | null>(null);
  const [speaker1Lang, setSpeaker1Lang] = useState<string>('ar-SA'); // Default to Arabic
  const [speaker1Translation, setSpeaker1Translation] = useState('');
  const [speaker2Lang, setSpeaker2Lang] = useState('en-US');
  const [speaker2Translation, setSpeaker2Translation] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [speaker1MicActive, setSpeaker1MicActive] = useState(false);
  const [speaker2MicActive, setSpeaker2MicActive] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isTranslating, startTranslation, stopTranslation } = useTranslation(); // Ensure this matches
  const { theme } = useTheme();

  const textBackground = theme === 'light' ? 'bg-gray-200' : 'bg-gray-700';

  const showQuotaExceededToast = useCallback(() => {
    console.log('Showing quota exceeded toast');
    toast.error('Quota exceeded. Please check your Azure Speech Service subscription or try again later.', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const unlockAudio = () => {
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('click', unlockAudio);
    }
  }, []);

  useEffect(() => {
    speaker1LangRef.current = speaker1Lang;
  }, [speaker1Lang]);

  const speakTTS = useCallback(async (text: string, lang: string) => {
    console.log(`speakTTS called with text: "${text}", lang: "${lang}"`);
    await speak(text, lang);
  }, [speak]);

  const handleSpeaker1Change = (lang: string) => {
    setSpeaker1Lang(lang);
    speaker1LangRef.current = lang;
  };

  const handleSpeaker2Change = (lang: string) => {
    setSpeaker2Lang(lang);
  };

  const handleStartSpeaker1Mic = useCallback(async () => {
    setSpeaker1MicActive(true);
    setSpeaker2MicActive(false);
    setIsSessionActive(true);
    await startTranslation(
      'speaker1',
      speaker2Lang,
      speaker1LangRef,
      () => {},
      () => {},
      (text) => setSpeaker1Translation(text),
      (text) => setSpeaker2Translation(text),
      speakTTS,
      showQuotaExceededToast
    );
  }, [speaker2Lang, startTranslation, speakTTS, showQuotaExceededToast]);

  const handleStopSpeaker1Mic = useCallback(async () => {
    await stopTranslation();
    setSpeaker1MicActive(false);
    setIsSessionActive(false);
  }, [stopTranslation]);

  const handleStartSpeaker2Mic = useCallback(async () => {
    setSpeaker2MicActive(true);
    setSpeaker1MicActive(false);
    setIsSessionActive(true);
    await startTranslation(
      'speaker2',
      speaker2Lang,
      speaker1LangRef,
      () => {},
      () => {},
      (text) => setSpeaker1Translation(text),
      (text) => setSpeaker2Translation(text),
      speakTTS,
      showQuotaExceededToast
    );
  }, [speaker2Lang, startTranslation, speakTTS, showQuotaExceededToast]);

  const handleStopSpeaker2Mic = useCallback(async () => {
    await stopTranslation();
    setSpeaker2MicActive(false);
    setIsSessionActive(false);
  }, [stopTranslation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-background transition-colors flex flex-col items-center px-2 py-1 relative"
    >
      <div className="absolute top-1 right-1 z-[2000]">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col h-[calc(100vh-2rem)] relative">
        {/* Speaker 1 at the top, not inverted */}
        <div className="flex flex-col items-center mt-4 z-[1500] relative pointer-events-auto transform rotate-180">
          <div className="w-full flex flex-col items-center justify-start relative">
            {/* Text Area */}
            <div className={`glass-panel p-1 w-full flex flex-col items-center ${textBackground} mb-4 h-36`} dir="auto">
              <p className="text-[14px] text-text-secondary text-center mt-0 overflow-y-auto">
                {speaker1Translation || 'Translation will appear here...'}
              </p>
            </div>
            {/* Dropdown */}
            <div className="w-full flex justify-center relative mb-4 z-[1600]">
              <LanguageSelector
                label=""
                value={speaker1Lang}
                onChange={handleSpeaker1Change}
                disabled={isSessionActive}
              />
            </div>
            {/* Mic Button */}
            <div className="mb-4">
              <MicButton
                isActive={speaker1MicActive}
                isDisabled={speaker2MicActive}
                onStart={handleStartSpeaker1Mic}
                onStop={handleStopSpeaker1Mic}
              />
            </div>
          </div>
        </div>

        {/* Static Logo in the middle with increased spacing */}
        <div className="flex flex-col items-center justify-center absolute inset-0 z-[1] py-24 min-h-[160px]">
          <StaticLogo />
        </div>

        {/* Speaker 2 at the bottom, not inverted */}
        <div className="flex flex-col items-center mb-0 mt-auto z-[1500] relative pointer-events-auto">
          <div className="w-full flex flex-col items-center justify-start relative">
            {/* Text Area */}
            <div className={`glass-panel p-1 w-full flex flex-col items-center ${textBackground} mt-2 h-36`} dir="auto">
              <p className="text-[14px] text-text-secondary text-center mt-0 overflow-y-auto">
                {speaker2Translation || 'Translation will appear here...'}
              </p>
            </div>
            {/* Dropdown */}
            <div className="w-full flex justify-center relative mb-4 z-[1600]">
              <LanguageSelector
                label=""
                value={speaker2Lang}
                onChange={handleSpeaker2Change}
                disabled={isSessionActive}
              />
            </div>
            {/* Mic Button */}
            <div className="mb-4">
              <MicButton
                isActive={speaker2MicActive}
                isDisabled={speaker1MicActive}
                onStart={handleStartSpeaker2Mic}
                onStop={handleStopSpeaker2Mic}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
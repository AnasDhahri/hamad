import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

export default function ConversationMode() {
  const speaker1LangRef = useRef<string | null>(null);
  const [speaker1LangState, setSpeaker1LangState] = useState<string>('no-select');
  const [speaker1Translation, setSpeaker1Translation] = useState('');
  const [speaker2Lang, setSpeaker2Lang] = useState('en-US');
  const [speaker2Translation, setSpeaker2Translation] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isTranslating, toggleTranslation } = useTranslation();
  const { theme } = useTheme();

  const textBackground = theme === 'light' ? 'bg-gray-200' : 'bg-gray-700';

  // Define the toast notification function for quota exceeded
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

  const speakTTS = useCallback(async (text: string, lang: string) => {
    console.log(`speakTTS called with text: "${text}", lang: "${lang}"`);
    await speak(text, lang);
  }, [speak]);

  const handleLockSpeaker1 = useCallback((lang: string) => {
    speaker1LangRef.current = lang;
    setSpeaker1LangState(lang);
  }, []);

  const handleToggleSession = useCallback(async () => {
    if (isTranslating) {
      // Stop the session
      await toggleTranslation(
        speaker2Lang,
        speaker1LangRef,
        handleLockSpeaker1,
        () => {},
        (text) => setSpeaker1Translation(text),
        (text) => setSpeaker2Translation(text),
        speakTTS,
        showQuotaExceededToast // Pass the toast function as onQuotaExceeded
      );
      setIsSessionActive(false);
      setSpeaker1LangState('no-select');
      setSpeaker1Translation('');
      setSpeaker2Translation('');
      speaker1LangRef.current = null;
    } else {
      // Start the session
      setIsSessionActive(true);
      speaker1LangRef.current = null;
      setSpeaker1LangState('no-select');
      setSpeaker1Translation('');
      setSpeaker2Translation('');

      await toggleTranslation(
        speaker2Lang,
        speaker1LangRef,
        handleLockSpeaker1,
        () => {},
        (text) => setSpeaker1Translation(text),
        (text) => setSpeaker2Translation(text),
        speakTTS,
        showQuotaExceededToast // Pass the toast function as onQuotaExceeded
      );
    }
  }, [
    isTranslating,
    toggleTranslation,
    speaker2Lang,
    handleLockSpeaker1,
    speakTTS,
    showQuotaExceededToast,
  ]);

  const handleSpeaker2Change = (lang: string) => {
    setSpeaker2Lang(lang);
  };

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
        {/* Speaker 1 at the top, inverted */}
        <div className="flex flex-col items-center rotate-180 mt-2 z-[1500] relative pointer-events-auto">
          <div className="w-full flex flex-col items-center justify-end relative">
            <div className={`glass-panel p-1 w-full flex flex-col items-center ${textBackground} mb-2 h-48`}>
              <p className="text-[14px] text-text-secondary text-center mt-0 overflow-y-auto">
                {speaker1Translation || 'Translation will appear here...'}
              </p>
            </div>
            <div className="w-full flex justify-center relative">
              <LanguageSelector label="" value={speaker1LangState} onChange={() => {}} disabled={true} />
            </div>
          </div>
        </div>

        {/* Microphone */}
        <div className="flex flex-col items-center justify-center absolute inset-0 z-[1]">
          <AudioVisualizer
            isListening={isTranslating}
            isSpeaking={isSpeaking}
            isTranslationMode={isSessionActive && !isSpeaking}
            onToggleListening={handleToggleSession}
            isSessionActive={isSessionActive}
          />
        </div>

        {/* Speaker 2 at the bottom */}
        <div className="flex flex-col items-center mb-0 mt-auto z-[1500] relative pointer-events-auto">
          <div className="w-full flex flex-col items-center justify-start relative">
            <div className={`glass-panel p-1 w-full flex flex-col items-center ${textBackground} mb-2 h-52`}>
              <p className="text-[14px] text-text-secondary text-center mt-0 overflow-y-auto">
                {speaker2Translation || 'Translation will appear here...'}
              </p>
            </div>
            <div className="w-full flex justify-center relative">
              <LanguageSelector label="" value={speaker2Lang} onChange={handleSpeaker2Change} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
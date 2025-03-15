import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Redo } from 'lucide-react';

export default function ConversationMode() {
  const [originalTranscript, setOriginalTranscript] = useState('');
  const speaker1LangRef = useRef<string | null>(null);
  const [speaker1LangState, setSpeaker1LangState] = useState<string>('no-select');
  const [speaker1Translation, setSpeaker1Translation] = useState('');
  const [speaker2Lang, setSpeaker2Lang] = useState('en-US');
  const [speaker2Translation, setSpeaker2Translation] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isTranslating, startTranslation, stopTranslation } = useTranslation();

  const speakTTS = useCallback(async (text: string, lang: string) => {
    await speak(text, lang);
  }, [speak]);

  const handleLockSpeaker1 = useCallback((lang: string) => {
    speaker1LangRef.current = lang;
    setSpeaker1LangState(lang);
  }, []);

  const handleToggleSession = useCallback(async () => {
    if (isTranslating) {
      setIsSessionActive(false);
      await stopTranslation();
      // After stopping the translation, refresh the page
      window.location.reload();
      return;
    }
    
    // Normal session-start logic
    setIsSessionActive(true);
    setOriginalTranscript('');
    speaker1LangRef.current = null;
    setSpeaker1LangState('no-select');
    setSpeaker1Translation('');
    setSpeaker2Translation('');
  
    await startTranslation(
      speaker2Lang,
      speaker1LangRef,
      handleLockSpeaker1,
      (interimText) => setOriginalTranscript(interimText),
      (text) => setSpeaker1Translation(text),
      (text) => setSpeaker2Translation(text),
      speakTTS
    );
  }, [
    isTranslating,
    stopTranslation,
    startTranslation,
    speaker2Lang,
    handleLockSpeaker1,
    speakTTS
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
      {/* Theme Toggle Button */}
      <div className="absolute top-1 right-1 z-[2000]">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md flex flex-col h-[calc(100vh-2rem)]">
        {/* Speaker 1 Section (Upside Down) */}
        <div className="flex flex-col items-center rotate-180 h-1/2 z-[1000]">
          <div className="glass-panel p-1 w-full text-center h-1/2 flex flex-col justify-center">
            <h3 className="font-semibold text-xs">Original</h3>
            <p className="text-[10px] text-text-secondary overflow-y-auto">
              {originalTranscript || 'Waiting for speech...'}
            </p>
          </div>
          <div className="glass-panel p-1 w-full flex flex-col items-center h-1/2 relative z-[1000]">
            <h3 className="font-semibold text-xs">Speaker 1</h3>
            <LanguageSelector
              label=""
              value={speaker1LangState}
              onChange={() => {}}
              disabled={true}
            />
            <p className="text-[10px] text-text-secondary text-center mt-1 overflow-y-auto">
              {speaker1Translation || 'Translation will appear here...'}
            </p>
            <button className="mt-1 text-text-secondary flex items-center gap-1 text-[10px]">
              <Redo className="w-2 h-2" />
              Replay
            </button>
          </div>
        </div>

        {/* Microphone Button */}
        <div className="relative flex flex-col justify-center items-center h-24 py-2 z-10">
          <div className="flex justify-center items-center gap-3">
            <AudioVisualizer
              isListening={isTranslating}
              isSpeaking={isSpeaking}
              isTranslationMode={isSessionActive && !isSpeaking}
              onToggleListening={handleToggleSession}
              isSessionActive={isSessionActive}
            />
          </div>
        </div>

        {/* Speaker 2 Section */}
        <div className="flex flex-col items-center h-1/2 z-[1000]">
          <div className="glass-panel p-1 w-full text-center h-1/2 flex flex-col justify-center">
            <h3 className="font-semibold text-xs">Original</h3>
            <p className="text-[10px] text-text-secondary overflow-y-auto">
              {originalTranscript || 'Waiting for speech...'}
            </p>
          </div>
          <div className="glass-panel p-1 w-full flex flex-col items-center h-1/2 relative z-[1000]">
            <h3 className="font-semibold text-xs">Speaker 2</h3>
            <LanguageSelector
              label=""
              value={speaker2Lang}
              onChange={handleSpeaker2Change}
            />
            <p className="text-[10px] text-text-secondary text-center mt-1 overflow-y-auto">
              {speaker2Translation || 'Translation will appear here...'}
            </p>
            <button className="mt-1 text-text-secondary flex items-center gap-1 text-[10px]">
              <Redo className="w-2 h-2" />
              Replay
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
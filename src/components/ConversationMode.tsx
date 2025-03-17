import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Redo } from 'lucide-react';
import { SpeechSynthesisService } from '../services/speechSynthesisService';

export default function ConversationMode() {
  const [originalTranscript, setOriginalTranscript] = useState('');
  const speaker1LangRef = useRef<string | null>(null);
  const [speaker1LangState, setSpeaker1LangState] = useState<string>('no-select');
  const [speaker1Translation, setSpeaker1Translation] = useState('');
  const [speaker2Lang, setSpeaker2Lang] = useState('en-US');
  const [speaker2Translation, setSpeaker2Translation] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { isSpeaking } = useSpeechSynthesis();
  const { isTranslating, startTranslation, stopTranslation } = useTranslation();
  // 🔹 FIX: Explicitly initialize Speech Synthesis on mobile

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

  // 🔹 FIX: Ensure speakTTS is a proper Promise function
  const speakTTS = useCallback(async (text: string, lang: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const handleLockSpeaker1 = useCallback((lang: string) => {
    speaker1LangRef.current = lang;
    setSpeaker1LangState(lang);
  }, []);

  const handleToggleSession = useCallback(async () => {
    if (isTranslating) {
      setIsSessionActive(false);
      await stopTranslation();
      window.location.reload();
      return;
    }

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
  }, [isTranslating, stopTranslation, startTranslation, speaker2Lang, handleLockSpeaker1]);

  const handleSpeaker2Change = (lang: string) => {
    setSpeaker2Lang(lang);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen bg-background transition-colors flex flex-col items-center px-2 py-1 relative">
      <div className="absolute top-1 right-1 z-[2000]">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex flex-col items-center rotate-180 h-1/2 z-[1000]">
          <div className="glass-panel p-1 w-full text-center h-1/2 flex flex-col justify-center">
            <h3 className="font-semibold text-xs">Original</h3>
            <p className="text-[10px] text-text-secondary overflow-y-auto">
              {originalTranscript || 'Waiting for speech...'}
            </p>
          </div>
          <div className="glass-panel p-1 w-full flex flex-col items-center h-1/2 relative z-[1000]">
            <h3 className="font-semibold text-xs">Speaker 1</h3>
            <LanguageSelector label="" value={speaker1LangState} onChange={() => {}} disabled={true} />
            <p className="text-[10px] text-text-secondary text-center mt-1 overflow-y-auto">
              {speaker1Translation || 'Translation will appear here...'}
            </p>
            <button className="mt-1 text-text-secondary flex items-center gap-1 text-[10px]">
              <Redo className="w-2 h-2" />
              Replay
            </button>
          </div>
        </div>

        <div className="relative flex flex-col justify-center items-center h-24 py-2 z-10">
          <AudioVisualizer isListening={isTranslating} isSpeaking={isSpeaking} isTranslationMode={isSessionActive && !isSpeaking} onToggleListening={handleToggleSession} isSessionActive={isSessionActive} />
        </div>

        <div className="flex flex-col items-center h-1/2 z-[1000]">
          <div className="glass-panel p-1 w-full text-center h-1/2 flex flex-col justify-center">
            <h3 className="font-semibold text-xs">Original</h3>
            <p className="text-[10px] text-text-secondary overflow-y-auto">
              {originalTranscript || 'Waiting for speech...'}
            </p>
          </div>
          <div className="glass-panel p-1 w-full flex flex-col items-center h-1/2 relative z-[1000]">
            <h3 className="font-semibold text-xs">Speaker 2</h3>
            <LanguageSelector label="" value={speaker2Lang} onChange={handleSpeaker2Change} />
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

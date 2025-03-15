import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';
import SwapLanguages from './SwapLanguages';
import Logo from './Logo';

export default function TranslationInterface() {
  // Original transcript from interim recognition
  const [originalTranscript, setOriginalTranscript] = useState('');
  // Speaker 1: auto‑detected language (initially "no-select")
  const speaker1LangRef = useRef<string | null>(null);
  const [speaker1Lang, setSpeaker1Lang] = useState<string>('no-select');
  const [speaker1Translation, setSpeaker1Translation] = useState('');
  // Speaker 2: user–selected language (default set to English)
  const [speaker2Lang, setSpeaker2Lang] = useState('en-US');
  const [speaker2Translation, setSpeaker2Translation] = useState('');

  const [isSessionActive, setIsSessionActive] = useState(false);

  const { speak, isSpeaking, error: speechError } = useSpeechSynthesis();
  const { isTranslating, error: translationError, startTranslation, stopTranslation } = useTranslation();

  // TTS function wrapper
  const speakTTS = useCallback(
    async (text: string, lang: string) => {
      await speak(text, lang);
    },
    [speak]
  );

  // When the first auto‑detected language arrives, lock Speaker1’s language
  const handleLockSpeaker1 = useCallback((lang: string) => {
    if (!speaker1LangRef.current) {
      speaker1LangRef.current = lang;
      setSpeaker1Lang(lang);
      console.log('Locked Speaker1 language:', lang);
    }
  }, []);

  // Toggle the conversation session (start/stop)
  const handleToggleSession = useCallback(async () => {
    if (isTranslating) {
      // Stop session and reset state
      setIsSessionActive(false);
      await stopTranslation();
      setOriginalTranscript('');
      speaker1LangRef.current = null;
      setSpeaker1Lang('no-select');
      setSpeaker1Translation('');
      setSpeaker2Translation('');
      return;
    }
    // Start session: reset states
    setIsSessionActive(true);
    setOriginalTranscript('');
    speaker1LangRef.current = null;
    setSpeaker1Lang('no-select');
    setSpeaker1Translation('');
    setSpeaker2Translation('');

    await startTranslation(
      // For Speaker2, we pass the chosen language.
      speaker2Lang,
      // Pass the ref object so that the translator can update Speaker1’s language once detected.
      speaker1LangRef,
      handleLockSpeaker1,
      // onRecognized: update the original transcript
      (text) => {
        setOriginalTranscript(text);
      },
      // onSpeaker1Translation: if auto‑detected language equals Speaker2’s language,
      // translate it for Speaker1
      async (translation) => {
        setSpeaker1Translation((prev) => prev + ' ' + translation);
        // Optionally, speak out the translation in Speaker1’s language:
        if (speaker1LangRef.current) {
          await speakTTS(translation, speaker1LangRef.current);
        }
      },
      // onSpeaker2Translation: if auto‑detected language equals Speaker2’s language,
      // translate it for Speaker2
      async (translation) => {
        setSpeaker2Translation((prev) => prev + ' ' + translation);
        await speakTTS(translation, speaker2Lang);
      },
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

  // Allow user to change Speaker 2 language via selector (when session is not active)
  const handleSpeaker2Change = (lang: string) => {
    setSpeaker2Lang(lang);
  };

  // Swap Languages Button (swaps Speaker1 locked language with Speaker2 chosen language)
  const handleSwapLanguages = useCallback(() => {
    if (!isTranslating) {
      const temp = speaker1Lang;
      speaker1LangRef.current = speaker2Lang;
      setSpeaker1Lang(speaker2Lang);
      setSpeaker2Lang(temp);
      setOriginalTranscript('');
      setSpeaker1Translation('');
      setSpeaker2Translation('');
    }
  }, [speaker1Lang, speaker2Lang, isTranslating]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background transition-colors"
    >
      <div className="max-w-5xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Logo />
        </motion.div>

        {/* Audio Visualizer with mic button */}
        <div className="relative w-[300px] h-[300px] mb-6">
          <AudioVisualizer 
            isListening={isTranslating}
            isSpeaking={isSpeaking}
            isTranslationMode={isSessionActive && !isSpeaking}
            onToggleListening={handleToggleSession}
          />
        </div>

        <AnimatePresence>
          {(speechError || translationError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full bg-red-500/20 text-red-400 p-3 text-sm text-center rounded-lg mb-4"
            >
              {speechError || translationError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Original Transcript Panel */}
        <div className="glass-panel p-4 w-full max-w-2xl mb-6">
          <h3 className="font-semibold mb-2">Original</h3>
          <p className="text-sm text-text-secondary">
            {originalTranscript || 'Waiting for speech...'}
          </p>
        </div>

        {/* Speaker 1 Translation Panel */}
        <div className="glass-panel p-4 w-full max-w-2xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Speaker 1</h3>
            <div className="w-36">
              {/* Locked selector: shows detected language or "no-select" */}
              <LanguageSelector
                label=""
                value={speaker1Lang}
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {speaker1Translation || 'Translation for Speaker 1 will appear here...'}
          </p>
        </div>

        {/* Speaker 2 Translation Panel */}
        <div className="glass-panel p-4 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Speaker 2</h3>
            <div className="w-36">
              <LanguageSelector
                label=""
                value={speaker2Lang}
                onChange={handleSpeaker2Change}
              />
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {speaker2Translation || 'Translation for Speaker 2 will appear here...'}
          </p>
        </div>

        {/* Swap Languages Button */}
        <div className="mt-4">
          <button 
            onClick={handleSwapLanguages} 
            className="btn btn-secondary"
            disabled={isTranslating}
          >
            Swap Languages
          </button>
        </div>
      </div>
    </motion.div>
  );
}

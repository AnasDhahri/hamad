import React from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import AudioOutputSelector from './AudioOutputSelector';
import VoiceSettings from './VoiceSettings';

interface ControlPanelProps {
  isListening: boolean;
  isInitializing: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleListening: () => void;
  onOutputDeviceChange: (deviceId: string) => void;
  sourceLanguage: string;
  targetLanguage: string;
  onSourceLanguageChange: (language: string) => void;
  onTargetLanguageChange: (language: string) => void;
  selectedVoice?: string;
  selectedStyle?: string;
  onVoiceChange?: (voice: string) => void;
  onStyleChange?: (style: string) => void;
}

const ControlPanel = ({
  isListening,
  isInitializing,
  isMuted,
  onToggleMute,
  onToggleListening,
  onOutputDeviceChange,
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  selectedVoice = '',
  selectedStyle = 'friendly',
  onVoiceChange = () => {},
  onStyleChange = () => {}
}: ControlPanelProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 glass-panel p-4 relative z-50">
        <LanguageSelector
          value={sourceLanguage}
          onChange={onSourceLanguageChange}
          label="From"
        />
        <button
          onClick={() => {
            if (!isListening) {
              onSourceLanguageChange(targetLanguage);
              onTargetLanguageChange(sourceLanguage);
            }
          }}
          className="p-2 rounded-full hover:bg-surface/80 transition-colors disabled:opacity-50"
          disabled={isInitializing || isListening}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 16l5-4-5-4" />
            <path d="M17 8l-5 4 5 4" />
          </svg>
        </button>
        <LanguageSelector
          value={targetLanguage}
          onChange={onTargetLanguageChange}
          label="To"
        />
        <VoiceSettings
          language={targetLanguage}
          selectedVoice={selectedVoice}
          selectedStyle={selectedStyle}
          onVoiceChange={onVoiceChange}
          onStyleChange={onStyleChange}
        />
      </div>

      <div className="flex items-center gap-4">
        <AudioOutputSelector onDeviceChange={onOutputDeviceChange} />
        <button
          onClick={onToggleMute}
          className={`btn ${
            isMuted ? 'btn-secondary text-red-400' : 'btn-secondary'
          }`}
          disabled={isInitializing}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
import { useEffect } from 'react';
import { APP_CONFIG } from '../constants/config';

interface ShortcutHandlers {
  onToggleRecording: () => void;
  onToggleMute: () => void;
  onClearHistory: () => void;
}

export function useKeyboardShortcuts({
  onToggleRecording,
  onToggleMute,
  onClearHistory
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { KEYBOARD_SHORTCUTS } = APP_CONFIG;

      if (event.key === KEYBOARD_SHORTCUTS.TOGGLE_RECORDING) {
        event.preventDefault();
        onToggleRecording();
      }

      if (event.key === KEYBOARD_SHORTCUTS.TOGGLE_MUTE) {
        event.preventDefault();
        onToggleMute();
      }

      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        onClearHistory();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleRecording, onToggleMute, onClearHistory]);
}
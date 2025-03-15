import { useCallback } from 'react';

export function useAudioOutput() {
  const handleOutputDeviceChange = useCallback(async (deviceId: string) => {
    try {
      const audio = document.createElement('audio');
      if ('setSinkId' in audio) {
        await (audio as any).setSinkId(deviceId);
      }
    } catch (err) {
      console.error('Error setting audio output device:', err);
    }
  }, []);

  return { handleOutputDeviceChange };
}
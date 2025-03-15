import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface AudioOutputSelectorProps {
  onDeviceChange: (deviceId: string) => void;
}

export default function AudioOutputSelector({ onDeviceChange }: AudioOutputSelectorProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');

  useEffect(() => {
    const loadDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioDevices = await navigator.mediaDevices.enumerateDevices();
        
        const outputDevices = audioDevices
          .filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 4)}`
          }));

        setDevices(outputDevices);
      } catch (error) {
        console.error('Error loading audio devices:', error);
      }
    };

    loadDevices();
    
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    onDeviceChange(deviceId);
  };

  return (
    <div className="flex items-center gap-2">
      <Volume2 className="w-4 h-4 text-text-secondary" />
      <select
        value={selectedDevice}
        onChange={handleDeviceChange}
        className="bg-surface-40 text-text-primary border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] backdrop-blur-sm"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
}
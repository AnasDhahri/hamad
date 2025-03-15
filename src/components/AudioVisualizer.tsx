import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle } from 'lucide-react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isTranslationMode: boolean;
  onToggleListening: () => void;
  isSessionActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isListening, 
  isSpeaking,
  isTranslationMode,
  onToggleListening,
  isSessionActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const lastColorRef = useRef<string>('#FF3B84');
  const transitionStartTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now() * 0.001);
  const phaseRef = useRef<number>(0);
  const lastDataArrayRef = useRef<Uint8Array | null>(null);
  const transitionProgressRef = useRef<number>(0);

  const CIRCLE_RADIUS = 100;
  const TRANSITION_DURATION = 1500;
  const WAVE_TRANSITION_DURATION = 1000;
  const LISTENING_COLOR = '#7FA9D4';
  const TRANSLATION_COLOR = '#3B82F6';

  const easeInOutCubic = (t: number): number => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const interpolateColor = useCallback((startColor: string, endColor: string, progress: number) => {
    const start = {
      r: parseInt(startColor.slice(1, 3), 16),
      g: parseInt(startColor.slice(3, 5), 16),
      b: parseInt(startColor.slice(5, 7), 16)
    };
    
    const end = {
      r: parseInt(endColor.slice(1, 3), 16),
      g: parseInt(endColor.slice(3, 5), 16),
      b: parseInt(endColor.slice(5, 7), 16)
    };
    
    const easedProgress = easeInOutCubic(progress);
    
    const r = Math.round(start.r + (end.r - start.r) * easedProgress);
    const g = Math.round(start.g + (end.g - start.g) * easedProgress);
    const b = Math.round(start.b + (end.b - start.b) * easedProgress);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  const interpolateArrays = useCallback((arr1: Uint8Array, arr2: Uint8Array, progress: number) => {
    const result = new Uint8Array(arr1.length);
    for (let i = 0; i < arr1.length; i++) {
      result[i] = arr1[i] + (arr2[i] - arr1[i]) * progress;
    }
    return result;
  }, []);

  useEffect(() => {
    const setupAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      if (isListening && !isSpeaking) {
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
          source.connect(analyserRef.current);
        } catch (err) {
          console.error('Error accessing microphone:', err);
        }
      } else if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };

    setupAudioContext();
    transitionProgressRef.current = 0;

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isListening, isSpeaking]);

  useEffect(() => {
    if (!isTransitioningRef.current) {
      transitionStartTimeRef.current = Date.now();
      isTransitioningRef.current = true;
      lastColorRef.current = isTranslationMode ? LISTENING_COLOR : TRANSLATION_COLOR;
    }
  }, [isTranslationMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetColor = isTranslationMode ? TRANSLATION_COLOR : LISTENING_COLOR;
    const bufferLength = analyserRef.current?.frequencyBinCount || 128;
    
    if (!lastDataArrayRef.current) {
      lastDataArrayRef.current = new Uint8Array(bufferLength).fill(128);
    }

    const drawVisualizer = () => {
      if (!analyserRef.current) return;

      const currentDataArray = new Uint8Array(bufferLength);
      const syntheticDataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        
        const elapsedTime = Date.now() - transitionStartTimeRef.current;
        const colorProgress = Math.min(elapsedTime / TRANSITION_DURATION, 1);
        
        if (colorProgress === 1) {
          isTransitioningRef.current = false;
        }

        const currentColor = interpolateColor(lastColorRef.current, targetColor, colorProgress);
        const currentGlowColor = `${currentColor}33`;

        // Update wave transition progress
        if (isTranslationMode || isSpeaking) {
          transitionProgressRef.current = Math.min(
            transitionProgressRef.current + (1 / (WAVE_TRANSITION_DURATION / 16)), 
            1
          );
        } else {
          transitionProgressRef.current = Math.max(
            transitionProgressRef.current - (1 / (WAVE_TRANSITION_DURATION / 16)), 
            0
          );
        }

        // Generate current data
        if (isListening && !isSpeaking) {
          analyserRef.current!.getByteFrequencyData(currentDataArray);
        }

        // Generate synthetic wave
        const currentTime = Date.now() * 0.001;
        const deltaTime = currentTime - startTimeRef.current;
        phaseRef.current += deltaTime * (isSpeaking ? 3 : 2);
        startTimeRef.current = currentTime;

        const amplitude = isSpeaking ? 0.7 : 0.5;
        
        for (let i = 0; i < bufferLength; i++) {
          const t = i / bufferLength;
          const wave = Math.sin(phaseRef.current + t * Math.PI * 4) * amplitude;
          syntheticDataArray[i] = 128 + (wave * 64);
        }

        // Interpolate between real and synthetic data
        const interpolatedData = interpolateArrays(
          currentDataArray,
          syntheticDataArray,
          transitionProgressRef.current
        );

        // Store last data for smooth transitions
        lastDataArrayRef.current = interpolatedData;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const bars = 64;

        // Draw outer glow
        const gradient = ctx.createRadialGradient(
          centerX, centerY, CIRCLE_RADIUS - 20,
          centerX, centerY, CIRCLE_RADIUS + 20
        );
        gradient.addColorStop(0, currentGlowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bars
        for (let i = 0; i < bars; i++) {
          const angle = (i * 2 * Math.PI) / bars;
          const value = interpolatedData[Math.floor((i / bars) * bufferLength)];
          
          const barHeight = ((value || 0) / 255) * 30;
          
          const innerRadius = CIRCLE_RADIUS - 10;
          const outerRadius = innerRadius + barHeight;
          
          const startX = centerX + innerRadius * Math.cos(angle);
          const startY = centerY + innerRadius * Math.sin(angle);
          const endX = centerX + outerRadius * Math.cos(angle);
          const endY = centerY + outerRadius * Math.sin(angle);
          
          const barGradient = ctx.createLinearGradient(startX, startY, endX, endY);
          barGradient.addColorStop(0, currentColor);
          barGradient.addColorStop(1, `${currentColor}80`);
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = barGradient;
          ctx.lineWidth = (2 * Math.PI * CIRCLE_RADIUS) / bars * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      };
      
      draw();
    };

    drawVisualizer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isSpeaking, isTranslationMode, interpolateColor, interpolateArrays]);

  return (
    <motion.div 
      className="relative cursor-pointer group z-10"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggleListening}
    >
      <motion.div
        initial={false}
        animate={{ 
          scale: isTranslationMode ? [1, 1.05, 1] : 1,
          transition: { 
            duration: 0.3,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }
        }}
        className="relative"
      >
        {/* Add the logo as the background with circular clipping */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
            <img
              src="public/HMC-Logo.webp"
              alt="Hamad Medical Logo"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isSessionActive ? 'opacity-30' : 'opacity-60'
              }`}
            />
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-[300px] h-[300px] mx-auto"
          width={300}
          height={300}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ scale: isListening ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isListening && !isSpeaking ? (
              <StopCircle className="w-6 h-6 text-white/80" />
            ) : (
              <Mic className="w-6 h-6 text-white/80" />
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioVisualizer;
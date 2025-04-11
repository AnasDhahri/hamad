import React from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle } from 'lucide-react';

interface MicButtonProps {
  isActive: boolean;
  isDisabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ isActive, isDisabled, onStart, onStop }) => {
  const handleClick = () => {
    if (isDisabled) return;

    if (isActive) {
      onStop(); // toggle off
    } else {
      onStart(); // toggle on
    }
  };

  return (
    <motion.button
      className={`p-3 rounded-full flex items-center justify-center transition-colors ${
        isActive
          ? 'bg-red-500 hover:bg-red-600'
          : isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      whileHover={{ scale: isDisabled ? 1 : 1.05 }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {isActive ? (
        <StopCircle className="w-6 h-6 text-white" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </motion.button>
  );
};

export default MicButton;

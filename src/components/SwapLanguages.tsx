import React from 'react';
import { motion } from 'framer-motion';

interface SwapLanguagesProps {
  onSwap: () => void;
  disabled?: boolean;
}

const SwapLanguages: React.FC<SwapLanguagesProps> = ({ onSwap, disabled = false }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onSwap}
      disabled={disabled}
      className="p-2 rounded-full hover:bg-surface/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Swap languages"
    >
      <svg 
        className="w-5 h-5 text-text-secondary" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M7 16V4M7 4L3 8M7 4L11 8" />
        <path d="M17 8V20M17 20L21 16M17 20L13 16" />
      </svg>
    </motion.button>
  );
};

export default SwapLanguages;
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-surface-40 hover:bg-surface-60 backdrop-blur-md border border-white/5 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-[rgb(var(--primary))]" />
      ) : (
        <Moon className="w-5 h-5 text-[rgb(var(--primary))]" />
      )}
    </button>
  );
};

export default ThemeToggle;
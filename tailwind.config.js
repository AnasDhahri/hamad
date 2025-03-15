/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'md': '12px',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const utilities = {
        '.bg-surface-60': {
          backgroundColor: 'rgb(var(--surface) / 0.6)',
        },
        '.bg-surface-40': {
          backgroundColor: 'rgb(var(--surface) / 0.4)',
        },
        '.bg-surface-80': {
          backgroundColor: 'rgb(var(--surface) / 0.8)',
        },
        '.hover-surface-80': {
          '&:hover': {
            backgroundColor: 'rgb(var(--surface) / 0.8)',
          },
        },
      };
      addUtilities(utilities);
    },
  ],
};
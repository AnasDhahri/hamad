import React from 'react';
import ConversationMode from './components/ConversationMode';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <ConversationMode />
    </ThemeProvider>
  );
}


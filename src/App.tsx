import React from 'react';
import ConversationMode from './components/ConversationMode';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <ThemeProvider>
      <ConversationMode />
      <ToastContainer
        // Remove position prop to allow individual toasts to set their own position
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
      />
    </ThemeProvider>
  );
}
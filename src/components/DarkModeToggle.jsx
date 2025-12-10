import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    // Fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference with error handling
    try {
      localStorage.setItem('darkMode', darkMode);
    } catch (error) {
      console.warn('Failed to save dark mode preference:', error);
    }
  }, [darkMode]);

  return (
    <button 
      className="header-icon-btn"
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
      title={darkMode ? "Mode clair" : "Mode sombre"}
    >
      {darkMode ? (
        <SunIcon className="header-icon" />
      ) : (
        <MoonIcon className="header-icon" />
      )}
    </button>
  );
}

import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference
    localStorage.setItem('darkMode', darkMode);
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

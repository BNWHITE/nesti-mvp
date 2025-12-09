import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  return (
    <button 
      className="header-icon-btn" 
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <SunIcon className="header-icon" /> : <MoonIcon className="header-icon" />}
    </button>
  );
}

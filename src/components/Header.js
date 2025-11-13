// src/components/Header.js

import './Header.css';

const Header = ({ user, familyName, onSettingsOpen, isDarkMode, toggleDarkMode }) => {
  // Supposons que user.first_name est disponible via App.js
  const firstName = user?.first_name || user?.email.split('@')[0];

  return (
    <header className="app-header">
      <div className="logo">
        <span>Nesti</span>
      </div>
      <div className="family-info">
        <span className="family-name">{familyName || 'Votre Nest'}</span>
      </div>
      <div className="user-controls">
        
        <button className="control-btn dark-mode-toggle" onClick={toggleDarkMode} title="Mode clair/sombre">
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <button className="control-btn settings-btn" onClick={onSettingsOpen} title="Paramètres">
          ⚙️
        </button>

        <div className="user-avatar">
          {firstName ? firstName[0] : '?'}
        </div>
      </div>
    </header>
  );
};

export default Header;

// src/components/Navigation.js (Bottom Bar)

import './Navigation.css';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { name: 'feed', icon: '🏠', label: 'Accueil' },
    { name: 'agenda', icon: '📅', label: 'Agenda' },
    { name: 'nest', icon: '👨‍👩‍👧', label: 'Mon Nest' },
    { name: 'discover', icon: '🧭', label: 'Découvertes' },
    { name: 'chat', icon: '🧠', label: 'Nesti IA' },
  ];

  return (
    <nav className="bottom-navigation">
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={`nav-item ${activeTab === tab.name ? 'active' : ''}`}
          onClick={() => onTabChange(tab.name)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;

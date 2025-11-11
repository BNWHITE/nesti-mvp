import './Navigation.css';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'feed', icon: '🏠', label: 'Accueil' },
    { id: 'agenda', icon: '📅', label: 'Agenda' },
    { id: 'nest', icon: '👨‍👩‍👧‍👦', label: 'Mon Nest' },
    { id: 'discover', icon: '🎯', label: 'Découvertes' },
    { id: 'chat', icon: '🤖', label: 'Nesti IA' }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

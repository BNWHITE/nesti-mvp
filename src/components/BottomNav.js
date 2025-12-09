import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  MapIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import './BottomNav.css';

const navItems = [
  { id: 'home', icon: HomeIcon, label: 'Accueil' },
  { id: 'agenda', icon: CalendarIcon, label: 'Agenda' },
  { id: 'nest', icon: UserGroupIcon, label: 'Mon Nest' },
  { id: 'discover', icon: MapIcon, label: 'Découvertes' },
  { id: 'chat', icon: ChatBubbleLeftRightIcon, label: 'Nesti IA' },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon className="nav-icon" />
              </div>
              <span className="nav-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

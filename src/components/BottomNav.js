import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  SparklesIcon as SparklesIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid';
import './BottomNav.css';

const navItems = [
  { 
    id: 'home', 
    path: '/',
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    label: 'Accueil' 
  },
  { 
    id: 'agenda', 
    path: '/agenda',
    icon: CalendarIcon, 
    iconSolid: CalendarIconSolid,
    label: 'Agenda' 
  },
  { 
    id: 'mon-nest', 
    path: '/mon-nest',
    icon: UserGroupIcon, 
    iconSolid: UserGroupIconSolid,
    label: 'Mon Nest' 
  },
  { 
    id: 'discover', 
    path: '/decouvertes',
    icon: SparklesIcon, 
    iconSolid: SparklesIconSolid,
    label: 'Découvertes' 
  },
  { 
    id: 'nesti-ia', 
    path: '/nesti-ia',
    icon: ChatBubbleLeftRightIcon, 
    iconSolid: ChatBubbleLeftRightIconSolid,
    label: 'Nesti IA' 
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="bottom-nav-icon-wrapper">
                <Icon className="bottom-nav-icon" />
              </div>
              <span className="bottom-nav-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

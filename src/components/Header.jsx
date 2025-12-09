import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from "./DarkModeToggle";
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-text">N</span>
          </div>
          <h1 className="header-title">Famille Martin</h1>
        </div>
        
        <div className="header-right">
          <DarkModeToggle />
          <button className="header-icon-btn" aria-label="Notifications">
            <BellIcon className="header-icon" />
            <span className="notification-badge">3</span>
          </button>
          <button className="header-icon-btn" aria-label="Profil">
            <UserCircleIcon className="header-icon" />
          </button>
        </div>
      </div>
    </header>
  );
}

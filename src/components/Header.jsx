import { MoonIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from "./DarkModeToggle";
import "./Header.css";

export default function Header() {
  return (
    <header className="header-top">
      <div className="header-content">
        <div className="header-logo">
          <span className="logo-icon">🏡</span>
          <span className="logo-text">Nesti</span>
          <span className="family-name">Famille Martin</span>
        </div>
        <div className="header-actions">
          <DarkModeToggle />
          <button className="header-icon-btn" aria-label="Notifications">
            <BellIcon className="header-icon" />
          </button>
          <button className="header-icon-btn" aria-label="Profile">
            <UserCircleIcon className="header-icon" />
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from "./DarkModeToggle";
import NotificationBell from "./NotificationBell";
import './Header.css';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Utilisateur';
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-text">N</span>
          </div>
          <h1 className="header-title">Famille {getUserName().split(' ')[getUserName().split(' ').length - 1] || 'Nesti'}</h1>
        </div>
        
        <div className="header-right">
          <NotificationBell userId={user?.id} />
          <DarkModeToggle />
          <div className="user-menu">
            <button 
              className="header-icon-btn user-avatar-btn" 
              aria-label="Profil"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="user-avatar-header">
                {getUserInitials()}
              </div>
            </button>
            {showMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar-large">
                    {getUserInitials()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{getUserName()}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleSignOut}>
                  <ArrowRightOnRectangleIcon className="dropdown-icon" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

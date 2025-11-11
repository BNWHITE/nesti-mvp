import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Header.css';

export default function Header({ user, onSettingsOpen }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <div className="logo-icon">N</div>
          <div className="logo-text">
            <h1>NESTI</h1>
            <span>Famille connectée</span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => onSettingsOpen()}
          >
            ⚙️
          </button>
          
          <div className="user-menu">
            <button 
              className="user-avatar"
              onClick={() => setShowMenu(!showMenu)}
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" />
              ) : (
                <span>{user?.email?.charAt(0).toUpperCase()}</span>
              )}
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <div className="user-info">
                  <strong>{user?.user_metadata?.first_name || 'Utilisateur'}</strong>
                  <span>{user?.email}</span>
                </div>
                <button onClick={handleLogout} className="menu-item">
                  🚪 Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="overlay" onClick={() => setShowMenu(false)} />
      )}
    </header>
  );
}

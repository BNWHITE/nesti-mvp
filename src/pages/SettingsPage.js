// src/pages/SettingsPage.js (VERSION FINALE EN MODAL)

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './SettingsPage.css'; 

const SettingsPage = ({ user, onClose, isDarkMode, toggleDarkMode }) => {
  // Supposons que user.role est mis à jour depuis App.js
  const [currentRole, setCurrentRole] = useState(user.role || 'parent');
  const [roleLoading, setRoleLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erreur lors de la déconnexion: " + error.message);
    } else {
      onClose(); 
    }
  };

  const handleRoleChange = async () => {
    setRoleLoading(true);
    setMessage('');
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: currentRole })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setMessage("Rôle mis à jour avec succès ! (Veuillez rafraîchir pour que le changement soit visible partout)");
      
    } catch (err) {
      setMessage(`Erreur: ${err.message}`);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div className="settings-page-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h1>⚙️ Paramètres</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {message && <p className={`status-message ${message.includes('succès') ? 'success' : 'error'}`}>{message}</p>}

        <section className="profile-settings">
          <h2>Profil et Rôle</h2>
          <p>Connecté : <strong>{user.email}</strong></p>
          
          <div className="role-changer">
            <label>Votre rôle actuel :</label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              disabled={roleLoading}
            >
              <option value="parent">Parent/Tuteur</option>
              <option value="child">Enfant/Adolescent</option>
            </select>
            <button onClick={handleRoleChange} disabled={roleLoading}>
              {roleLoading ? 'Sauvegarde...' : 'Sauvegarder le rôle'}
            </button>
          </div>
        </section>

        <section className="app-settings">
          <h2>Affichage</h2>
          <div className="setting-row">
            <span>Mode Sombre / Mode Clair</span>
            <button onClick={toggleDarkMode} className="dark-mode-switch">
              {isDarkMode ? 'Passer au clair ☀️' : 'Passer au sombre 🌙'}
            </button>
          </div>
        </section>

        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

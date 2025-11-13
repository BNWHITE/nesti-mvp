// src/pages/SettingsPage.js

import { supabase } from '../lib/supabaseClient';
import './SettingsPage.css'; 

const SettingsPage = ({ user, onClose }) => {

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erreur lors de la déconnexion: " + error.message);
    } else {
      // Supabase onAuthStateChange gère la redirection vers l'écran de login
      onClose(); 
    }
  };

  return (
    <div className="settings-page-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h1>⚙️ Paramètres du compte</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <section className="profile-settings">
          <h2>Profil</h2>
          <p>Connecté en tant que: <strong>{user.email}</strong></p>
          <button className="change-profile-btn">Modifier mes informations</button>
        </section>

        <section className="family-settings">
          <h2>Nest & Famille</h2>
          <button className="manage-nest-btn">Gérer les membres</button>
          <button className="leave-nest-btn">Quitter le Nest</button>
        </section>
        
        <section className="app-settings">
          <h2>Général</h2>
          <button className="app-version-btn">Version 1.0.0 (MVP)</button>
        </section>

        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

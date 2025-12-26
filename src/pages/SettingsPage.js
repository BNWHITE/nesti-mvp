// src/pages/SettingsPage.js - Complete Settings with CRUD

import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import userPreferencesService from '../services/userPreferencesService';
import { AccessibilityContext } from '../contexts/AccessibilityContext';
import './SettingsPage.css'; 

const ACTIVITY_OPTIONS = [
  'Sport', 'Culture', 'Art', 'Musique', 'Nature', 'Cuisine',
  'Lecture', 'Théâtre', 'Danse', 'Jeux', 'Science', 'Technologie',
  'Cinéma', 'Cyclisme', 'Yoga'
];

const SettingsPage = ({ user, onClose, isDarkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentRole, setCurrentRole] = useState(user.role || 'parent');
  const [roleLoading, setRoleLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Activity Preferences State
  const [activityPreferences, setActivityPreferences] = useState([]);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  
  // Accessibility State
  const { updateAccessibilityNeeds } = useContext(AccessibilityContext);
  const [localAccessibility, setLocalAccessibility] = useState({
    mobility: false,
    visual: false,
    hearing: false,
    dyslexia: false,
    cognitive: false,
    other: ''
  });
  const [accessibilitySaving, setAccessibilitySaving] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    loadUserData();
  }, [user.id]);

  const loadUserData = async () => {
    try {
      // Load activity preferences
      const prefs = await userPreferencesService.getActivityPreferences(user.id);
      if (prefs) {
        setActivityPreferences(prefs);
      }
      
      // Load accessibility needs
      const accNeeds = await userPreferencesService.getAccessibilityNeeds(user.id);
      if (accNeeds) {
        setLocalAccessibility(accNeeds);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('Erreur lors de la déconnexion: ' + error.message);
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
      
      setMessage('✅ Rôle mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      setMessage(`❌ Erreur: ${err.message}`);
    } finally {
      setRoleLoading(false);
    }
  };

  const toggleActivityPreference = (activity) => {
    setActivityPreferences(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const saveActivityPreferences = async () => {
    setPreferencesSaving(true);
    setMessage('');
    try {
      await userPreferencesService.saveActivityPreferences(user.id, activityPreferences);
      setMessage('✅ Préférences d'activités sauvegardées !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setPreferencesSaving(false);
    }
  };

  const saveAccessibilityNeeds = async () => {
    setAccessibilitySaving(true);
    setMessage('');
    try {
      await userPreferencesService.saveAccessibilityNeeds(user.id, localAccessibility);
      updateAccessibilityNeeds(localAccessibility); // Update context
      setMessage('✅ Besoins d'accessibilité sauvegardés !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setAccessibilitySaving(false);
    }
  };

  return (
    <div className="settings-page-overlay">
      <div className="settings-panel-large">
        <div className="settings-header">
          <h1>⚙️ Paramètres</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {message && (
          <div className={`status-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            🎯 Activités
          </button>
          <button 
            className={`tab-btn ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            ♿ Accessibilité
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Apparence
          </button>
        </div>

        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <section className="profile-settings">
              <h2>Profil et Rôle</h2>
              <div className="info-row">
                <span>Email:</span>
                <strong>{user.email}</strong>
              </div>
              
              <div className="role-changer">
                <label>Votre rôle dans la famille:</label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  disabled={roleLoading}
                >
                  <option value="parent">Parent/Tuteur</option>
                  <option value="child">Enfant/Adolescent</option>
                </select>
                <button 
                  onClick={handleRoleChange} 
                  disabled={roleLoading}
                  className="save-btn"
                >
                  {roleLoading ? 'Sauvegarde...' : 'Sauvegarder le rôle'}
                </button>
              </div>
            </section>
          )}

          {/* Activity Preferences Tab */}
          {activeTab === 'preferences' && (
            <section className="preferences-settings">
              <h2>Préférences d'Activités</h2>
              <p className="section-desc">
                Sélectionnez vos activités préférées pour recevoir des recommandations personnalisées.
              </p>
              
              {preferencesLoading ? (
                <div className="loading">Chargement...</div>
              ) : (
                <>
                  <div className="activity-grid">
                    {ACTIVITY_OPTIONS.map(activity => (
                      <button
                        key={activity}
                        className={`activity-chip ${activityPreferences.includes(activity) ? 'selected' : ''}`}
                        onClick={() => toggleActivityPreference(activity)}
                      >
                        {activity}
                        {activityPreferences.includes(activity) && ' ✓'}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={saveActivityPreferences}
                    disabled={preferencesSaving}
                    className="save-btn-primary"
                  >
                    {preferencesSaving ? 'Sauvegarde...' : '💾 Sauvegarder les préférences'}
                  </button>
                </>
              )}
            </section>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <section className="accessibility-settings">
              <h2>Besoins d'Accessibilité</h2>
              <p className="section-desc">
                Configurez l'interface selon vos besoins pour une meilleure expérience.
              </p>
              
              <div className="accessibility-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAccessibility.mobility}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, mobility: e.target.checked})}
                  />
                  <span>♿ Handicap moteur (cibles tactiles agrandies)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAccessibility.visual}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, visual: e.target.checked})}
                  />
                  <span>👁️ Handicap visuel (contraste élevé, texte agrandi)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAccessibility.hearing}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, hearing: e.target.checked})}
                  />
                  <span>👂 Handicap auditif (indicateurs visuels renforcés)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAccessibility.dyslexia}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, dyslexia: e.target.checked})}
                  />
                  <span>📖 Dyslexie (police adaptée, espacement augmenté)</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAccessibility.cognitive}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, cognitive: e.target.checked})}
                  />
                  <span>🧠 Troubles cognitifs (interface simplifiée, animations désactivées)</span>
                </label>
                
                <div className="other-needs">
                  <label>Autres besoins spécifiques:</label>
                  <textarea
                    value={localAccessibility.other}
                    onChange={(e) => setLocalAccessibility({...localAccessibility, other: e.target.value})}
                    placeholder="Décrivez vos besoins spécifiques..."
                    rows="3"
                  />
                </div>
              </div>
              
              <button 
                onClick={saveAccessibilityNeeds}
                disabled={accessibilitySaving}
                className="save-btn-primary"
              >
                {accessibilitySaving ? 'Sauvegarde...' : '💾 Sauvegarder l'accessibilité'}
              </button>
            </section>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <section className="app-settings">
              <h2>Apparence</h2>
              <div className="setting-row">
                <span>Mode Sombre / Mode Clair</span>
                <button onClick={toggleDarkMode} className="dark-mode-switch">
                  {isDarkMode ? 'Passer au clair ☀️' : 'Passer au sombre 🌙'}
                </button>
              </div>
            </section>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

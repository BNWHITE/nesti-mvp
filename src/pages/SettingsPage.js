import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './SettingsPage.css';

export default function SettingsPage({ user, onClose }) {
  const [profile, setProfile] = useState({
    bio: '',
    notifications_enabled: true,
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      alert('Paramètres sauvegardés !');
    }
    setLoading(false);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Paramètres</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>👤 Profil</h3>
            <div className="setting-item">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>
            <div className="setting-item">
              <label>Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Décrivez-vous..."
                rows="3"
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>🔔 Notifications</h3>
            <div className="setting-item toggle">
              <label>Activer les notifications</label>
              <input
                type="checkbox"
                checked={profile.notifications_enabled}
                onChange={(e) => setProfile({...profile, notifications_enabled: e.target.checked})}
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>🎨 Apparence</h3>
            <div className="setting-item">
              <label>Thème</label>
              <select
                value={profile.theme}
                onChange={(e) => setProfile({...profile, theme: e.target.value})}
              >
                <option value="light">☀️ Clair</option>
                <option value="dark">🌙 Sombre</option>
              </select>
            </div>
          </section>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="save-btn"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}

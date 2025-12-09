import React, { useState } from 'react';
import TagButton from '../components/TagButton';
import ToggleSwitch from '../components/ToggleSwitch';
import './Settings.css';

const sportsData = [
  { id: 1, label: 'Football', icon: '⚽' },
  { id: 2, label: 'Basketball', icon: '🏀' },
  { id: 3, label: 'Tennis', icon: '🎾' },
  { id: 4, label: 'Natation', icon: '🏊' },
  { id: 5, label: 'Cyclisme', icon: '🚴' },
  { id: 6, label: 'Yoga', icon: '🧘' },
  { id: 7, label: 'Course', icon: '🏃' },
  { id: 8, label: 'Danse', icon: '💃' }
];

const hobbiesData = [
  { id: 1, label: 'Lecture', icon: '📚' },
  { id: 2, label: 'Cuisine', icon: '🍳' },
  { id: 3, label: 'Jardinage', icon: '🌱' },
  { id: 4, label: 'Art', icon: '🎨' },
  { id: 5, label: 'Musique', icon: '🎵' },
  { id: 6, label: 'Photographie', icon: '📷' },
  { id: 7, label: 'Bricolage', icon: '🔨' },
  { id: 8, label: 'Jeux', icon: '🎮' }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profil');
  const [selectedSports, setSelectedSports] = useState([1, 3, 4]); // Football, Tennis, Natation
  const [selectedHobbies, setSelectedHobbies] = useState([1, 2, 3, 4]); // Lecture, Cuisine, Jardinage, Art
  
  const [notifications, setNotifications] = useState({
    publications: true,
    comments: true,
    events: true,
    suggestions: false
  });

  const toggleSport = (id) => {
    setSelectedSports(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleHobby = (id) => {
    setSelectedHobbies(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => setActiveTab('profil')}
        >
          Profil
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'ia' ? 'active' : ''}`}
          onClick={() => setActiveTab('ia')}
        >
          IA Nesti
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'app' ? 'active' : ''}`}
          onClick={() => setActiveTab('app')}
        >
          App
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'profil' && (
          <div className="settings-section">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                <div className="avatar avatar-2xl">S</div>
                <button className="avatar-camera-btn">📷</button>
              </div>
              <div className="badge badge-admin">🏆 Admin</div>
            </div>

            <div className="settings-section-content">
              <h3 className="section-title">Informations personnelles</h3>
              
              <div className="input-group">
                <label>Nom complet</label>
                <input type="text" className="input" defaultValue="Sophie Martin" />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input type="email" className="input" defaultValue="sophie@martin.com" />
              </div>

              <button className="btn btn-primary">
                <span>📋</span> Enregistrer les modifications
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ia' && (
          <div className="settings-section">
            <div className="ia-intro">
              <div className="ia-icon">✨</div>
              <h3>IA Nesti personnalisée</h3>
              <p>Partagez vos préférences familiales pour que l'IA Nesti vous propose des activités et du contenu parfaitement adaptés à votre famille.</p>
            </div>

            <div className="preferences-section">
              <h4 className="preferences-title">🏀 Sports pratiqués dans la famille</h4>
              <div className="tags-grid">
                {sportsData.map(sport => (
                  <TagButton
                    key={sport.id}
                    label={sport.label}
                    icon={sport.icon}
                    selected={selectedSports.includes(sport.id)}
                    onClick={() => toggleSport(sport.id)}
                  />
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h4 className="preferences-title">🎨 Centres d'intérêt & Hobbies</h4>
              <div className="tags-grid">
                {hobbiesData.map(hobby => (
                  <TagButton
                    key={hobby.id}
                    label={hobby.label}
                    icon={hobby.icon}
                    selected={selectedHobbies.includes(hobby.id)}
                    onClick={() => toggleHobby(hobby.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'app' && (
          <div className="settings-section">
            <div className="settings-group">
              <h3 className="section-title">🔔 Notifications</h3>
              <div className="toggles-list">
                <ToggleSwitch
                  label="Nouvelles publications"
                  description="Dans le fil d'actualité"
                  checked={notifications.publications}
                  onChange={(checked) => setNotifications({...notifications, publications: checked})}
                />
                <ToggleSwitch
                  label="Commentaires"
                  description="Sur vos publications"
                  checked={notifications.comments}
                  onChange={(checked) => setNotifications({...notifications, comments: checked})}
                />
                <ToggleSwitch
                  label="Événements"
                  description="Nouveaux événements et rappels"
                  checked={notifications.events}
                  onChange={(checked) => setNotifications({...notifications, events: checked})}
                />
                <ToggleSwitch
                  label="Suggestions d'activités"
                  description="Recommandations IA Nesti"
                  checked={notifications.suggestions}
                  onChange={(checked) => setNotifications({...notifications, suggestions: checked})}
                />
              </div>
            </div>

            <div className="settings-group">
              <h3 className="section-title">🛡️ Confidentialité</h3>
              <div className="settings-list">
                <div className="settings-list-item">
                  <div>
                    <div className="list-item-title">Visibilité du profil</div>
                    <div className="list-item-subtitle">Gérer qui peut voir votre profil</div>
                  </div>
                  <button className="list-item-arrow">→</button>
                </div>
                <div className="settings-list-item">
                  <div>
                    <div className="list-item-title">Mes données</div>
                    <div className="list-item-subtitle">Télécharger ou supprimer</div>
                  </div>
                  <button className="list-item-arrow">→</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

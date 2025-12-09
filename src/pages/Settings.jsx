import React, { useState } from "react";
import { CameraIcon } from '@heroicons/react/24/outline';
import TagButton from "../components/TagButton";
import ToggleSwitch from "../components/ToggleSwitch";
import "./Settings.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile state
  const [fullName, setFullName] = useState("Sophie Martin");
  const [email, setEmail] = useState("sophie@martin.com");
  
  // AI Preferences state
  const [sports, setSports] = useState({
    football: true,
    basketball: false,
    tennis: true,
    natation: true,
    cyclisme: false,
    yoga: false,
    course: false,
    danse: false
  });
  
  const [hobbies, setHobbies] = useState({
    lecture: true,
    cuisine: true,
    jardinage: true,
    art: true,
    musique: false,
    photographie: false,
    bricolage: false,
    jeux: false
  });
  
  // App Settings state
  const [notifications, setNotifications] = useState({
    newPosts: true,
    comments: true,
    events: true,
    suggestions: false
  });

  const toggleSport = (sport) => {
    setSports(prev => ({ ...prev, [sport]: !prev[sport] }));
  };

  const toggleHobby = (hobby) => {
    setHobbies(prev => ({ ...prev, [hobby]: !prev[hobby] }));
  };

  const handleSaveProfile = () => {
    alert("Profil enregistré avec succès !");
  };

  return (
    <div className="settings-page">
      <div className="page-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            IA Nesti
          </button>
          <button 
            className={`tab-btn ${activeTab === 'app' ? 'active' : ''}`}
            onClick={() => setActiveTab('app')}
          >
            App
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-avatar-section">
                <div className="avatar avatar-xl profile-avatar">
                  S
                  <button className="avatar-camera-btn">
                    <CameraIcon className="icon-md" />
                  </button>
                </div>
                <span className="badge badge-admin">🏆 Admin</span>
              </div>

              <div className="settings-section">
                <h3 className="section-title">Informations personnelles</h3>
                
                <div className="input-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button className="btn-primary save-btn" onClick={handleSaveProfile}>
                  📋 Enregistrer les modifications
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="ai-tab">
              <div className="settings-section">
                <div className="ai-intro">
                  <span className="ai-intro-icon">✨</span>
                  <div>
                    <h3 className="section-title">IA Nesti personnalisée</h3>
                    <p className="section-description">
                      Partagez vos préférences familiales pour que l'IA Nesti vous propose des activités et du contenu parfaitement adaptés à votre famille.
                    </p>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="section-title">🏀 Sports pratiqués dans la famille</h3>
                <div className="tags-grid">
                  <TagButton label="Football" selected={sports.football} onClick={() => toggleSport('football')} />
                  <TagButton label="Basketball" selected={sports.basketball} onClick={() => toggleSport('basketball')} />
                  <TagButton label="Tennis" selected={sports.tennis} onClick={() => toggleSport('tennis')} />
                  <TagButton label="Natation" selected={sports.natation} onClick={() => toggleSport('natation')} />
                  <TagButton label="Cyclisme" selected={sports.cyclisme} onClick={() => toggleSport('cyclisme')} />
                  <TagButton label="Yoga" selected={sports.yoga} onClick={() => toggleSport('yoga')} />
                  <TagButton label="Course" selected={sports.course} onClick={() => toggleSport('course')} />
                  <TagButton label="Danse" selected={sports.danse} onClick={() => toggleSport('danse')} />
                </div>
              </div>

              <div className="settings-section">
                <h3 className="section-title">🎨 Centres d'intérêt & Hobbies</h3>
                <div className="tags-grid">
                  <TagButton label="Lecture" selected={hobbies.lecture} onClick={() => toggleHobby('lecture')} />
                  <TagButton label="Cuisine" selected={hobbies.cuisine} onClick={() => toggleHobby('cuisine')} />
                  <TagButton label="Jardinage" selected={hobbies.jardinage} onClick={() => toggleHobby('jardinage')} />
                  <TagButton label="Art" selected={hobbies.art} onClick={() => toggleHobby('art')} />
                  <TagButton label="Musique" selected={hobbies.musique} onClick={() => toggleHobby('musique')} />
                  <TagButton label="Photographie" selected={hobbies.photographie} onClick={() => toggleHobby('photographie')} />
                  <TagButton label="Bricolage" selected={hobbies.bricolage} onClick={() => toggleHobby('bricolage')} />
                  <TagButton label="Jeux" selected={hobbies.jeux} onClick={() => toggleHobby('jeux')} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="app-tab">
              <div className="settings-section">
                <h3 className="section-title">🔔 Notifications</h3>
                <div className="toggles-list">
                  <ToggleSwitch
                    label="Nouvelles publications"
                    description="Dans le fil d'actualité"
                    checked={notifications.newPosts}
                    onChange={(checked) => setNotifications({ ...notifications, newPosts: checked })}
                  />
                  <ToggleSwitch
                    label="Commentaires"
                    description="Sur vos publications"
                    checked={notifications.comments}
                    onChange={(checked) => setNotifications({ ...notifications, comments: checked })}
                  />
                  <ToggleSwitch
                    label="Événements"
                    description="Nouveaux événements et rappels"
                    checked={notifications.events}
                    onChange={(checked) => setNotifications({ ...notifications, events: checked })}
                  />
                  <ToggleSwitch
                    label="Suggestions d'activités"
                    description="Recommandations IA Nesti"
                    checked={notifications.suggestions}
                    onChange={(checked) => setNotifications({ ...notifications, suggestions: checked })}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h3 className="section-title">🛡️ Confidentialité</h3>
                <div className="privacy-list">
                  <button className="privacy-item">
                    <div>
                      <span className="privacy-label">Visibilité du profil</span>
                      <span className="privacy-description">Gérer qui peut voir votre profil</span>
                    </div>
                    <span className="arrow">→</span>
                  </button>
                  <button className="privacy-item">
                    <div>
                      <span className="privacy-label">Mes données</span>
                      <span className="privacy-description">Télécharger ou supprimer</span>
                    </div>
                    <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

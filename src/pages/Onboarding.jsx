import React, { useState } from 'react';
import TagButton from '../components/TagButton';
import './Onboarding.css';

const sportsData = [
  { id: 1, label: 'Football', icon: '⚽' },
  { id: 2, label: 'Natation', icon: '🏊' },
  { id: 3, label: 'Tennis', icon: '🎾' },
  { id: 4, label: 'Yoga', icon: '🧘' },
  { id: 5, label: 'Vélo', icon: '🚴' },
  { id: 6, label: 'Danse', icon: '💃' }
];

const hobbiesData = [
  { id: 7, label: 'Lecture', icon: '📚' },
  { id: 8, label: 'Cuisine', icon: '🍳' },
  { id: 9, label: 'Jardinage', icon: '🌱' },
  { id: 10, label: 'Art', icon: '🎨' },
  { id: 11, label: 'Musique', icon: '🎵' },
  { id: 12, label: 'Photo', icon: '📷' }
];

const vacationsData = [
  { id: 13, label: 'Plage', icon: '🏖️' },
  { id: 14, label: 'Montagne', icon: '⛰️' },
  { id: 15, label: 'Ville', icon: '🏙️' },
  { id: 16, label: 'Campagne', icon: '🌾' }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [nestName, setNestName] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const totalSteps = 4;

  const togglePreference = (id) => {
    setSelectedPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
  };

  const canProceed = () => {
    if (currentStep === 2 && !nestName.trim()) return false;
    return true;
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="onboarding-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Skip Button */}
        {currentStep > 1 && (
          <button className="skip-btn" onClick={handleSkip}>
            Passer
          </button>
        )}

        {/* Step Content */}
        <div className="onboarding-content">
          {currentStep === 1 && (
            <div className="onboarding-step step-1">
              <div className="step-icon-large family-icon">
                <div className="family-circle">👨‍👩‍👧‍👦</div>
              </div>
              <div className="step-emoji">🏡</div>
              <h1 className="step-title">Bienvenue dans Nesti</h1>
              <p className="step-subtitle">Votre assistant familial inclusif</p>
              <p className="step-description">
                Organisez votre vie familiale, découvrez des activités adaptées et restez connectés.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-step step-2">
              <div className="step-icon-medium">
                <span className="heart-icon">❤️</span>
              </div>
              <div className="step-icon-large family-icon-grey">👨‍👩‍👧‍👦</div>
              <h1 className="step-title">Créez votre Nest</h1>
              <p className="step-subtitle">Donnez un nom à votre famille</p>
              <p className="step-description">
                C'est votre espace privé et chaleureux où vous partagerez vos meilleurs moments.
              </p>
              <input
                type="text"
                className="nest-name-input"
                placeholder="Ex: Famille Martin, Les Dupont..."
                value={nestName}
                onChange={(e) => setNestName(e.target.value)}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="onboarding-step step-3">
              <div className="step-icon-medium sparkles">✨</div>
              <h1 className="step-title">Personnalisez vos préférences</h1>
              <p className="step-subtitle">Aidez Nesti à vous connaître</p>
              <p className="step-description">
                Sélectionnez vos centres d'intérêt pour recevoir des suggestions d'activités adaptées.
              </p>

              <div className="preferences-groups">
                <div className="preference-group">
                  <h3 className="preference-group-title">🏃 Sports & Activités physiques</h3>
                  <div className="tags-grid">
                    {sportsData.map(item => (
                      <TagButton
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        selected={selectedPreferences.includes(item.id)}
                        onClick={() => togglePreference(item.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="preference-group">
                  <h3 className="preference-group-title">🎨 Loisirs créatifs</h3>
                  <div className="tags-grid">
                    {hobbiesData.map(item => (
                      <TagButton
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        selected={selectedPreferences.includes(item.id)}
                        onClick={() => togglePreference(item.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="preference-group">
                  <h3 className="preference-group-title">🏖️ Types de vacances</h3>
                  <div className="tags-grid">
                    {vacationsData.map(item => (
                      <TagButton
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        selected={selectedPreferences.includes(item.id)}
                        onClick={() => togglePreference(item.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="preferences-counter">
                {selectedPreferences.length} préférence{selectedPreferences.length !== 1 ? 's' : ''} sélectionnée{selectedPreferences.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="onboarding-step step-4">
              <div className="step-icon-large check-icon">✅</div>
              <div className="step-emoji">🎉</div>
              <h1 className="step-title">Tout est prêt !</h1>
              <p className="step-subtitle">Commencez l'aventure Nesti</p>
              <p className="step-description">
                Vous pouvez maintenant inviter des membres, planifier vos activités et découvrir des suggestions personnalisées.
              </p>
              
              <div className="summary-info">
                <div className="summary-item">
                  <span className="summary-icon">👤</span>
                  <span className="summary-text">Nest: {nestName || 'Sy'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">✨</span>
                  <span className="summary-text">
                    {selectedPreferences.length} préférence{selectedPreferences.length !== 1 ? 's' : ''} configurée{selectedPreferences.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="onboarding-navigation">
          {currentStep > 1 && (
            <button className="nav-btn nav-btn-back" onClick={handleBack}>
              ◀ Retour
            </button>
          )}
          <button 
            className="nav-btn nav-btn-next" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === totalSteps ? '✅ Commencer' : 'Suivant ➜'}
          </button>
        </div>
      </div>
    </div>
  );
}

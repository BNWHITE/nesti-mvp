import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createFamily } from '../services/familyService';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    mobility: false,
    visual: false,
    hearing: false,
    dyslexia: false,
    cognitive: false,
    other: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availablePreferences = [
    { id: 'football', label: '⚽ Football', category: 'sport' },
    { id: 'cuisine', label: '🍳 Cuisine', category: 'loisir' },
    { id: 'jardinage', label: '🌱 Jardinage', category: 'loisir' },
    { id: 'art', label: '🎨 Art', category: 'culture' },
    { id: 'lecture', label: '📚 Lecture', category: 'culture' },
    { id: 'musique', label: '🎵 Musique', category: 'culture' },
    { id: 'randonnée', label: '🥾 Randonnée', category: 'sport' },
    { id: 'natation', label: '🏊 Natation', category: 'sport' },
    { id: 'jeux-societe', label: '🎲 Jeux de société', category: 'loisir' },
    { id: 'bricolage', label: '🔨 Bricolage', category: 'loisir' },
    { id: 'theatre', label: '🎭 Théâtre', category: 'culture' },
    { id: 'danse', label: '💃 Danse', category: 'sport' },
    { id: 'cinema', label: '🎬 Cinéma', category: 'culture' },
    { id: 'cyclisme', label: '🚴 Cyclisme', category: 'sport' },
    { id: 'yoga', label: '🧘 Yoga', category: 'sport' },
  ];

  const accessibilityOptions = [
    { id: 'mobility', label: '♿ Handicap moteur', description: 'Difficultés de déplacement' },
    { id: 'visual', label: '👁️ Handicap visuel', description: 'Malvoyance ou cécité' },
    { id: 'hearing', label: '👂 Handicap auditif', description: 'Malentendance ou surdité' },
    { id: 'dyslexia', label: '📖 Dyslexie', description: 'Difficultés de lecture' },
    { id: 'cognitive', label: '🧠 Troubles cognitifs', description: 'Autisme, TDAH, etc.' },
  ];

  const toggleAccessibility = (key) => {
    setAccessibilityNeeds(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePreference = (prefId) => {
    setPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleNext = async () => {
    if (step === 2) {
      // Validate family name
      if (!familyName.trim()) {
        setError('Veuillez donner un nom à votre famille');
        return;
      }
      
      // Create family in database
      setLoading(true);
      setError('');
      try {
        const family = await createFamily({
          family_name: familyName.trim(),
          user_id: user.id,
          user_email: user.email,
          user_first_name: user.user_metadata?.first_name || user.email.split('@')[0],
        });
        
        if (family) {
          setStep(step + 1);
        } else {
          setError('Erreur inattendue. Veuillez réessayer.');
        }
      } catch (err) {
        console.error('Error creating family:', err);
        const errorMessage = err.message || 'Erreur lors de la création de votre famille. Réessayez.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete onboarding - save all preferences
      // TODO: Save accessibility needs and preferences to database
      navigate('/');
    }
  };

  const handleSkip = () => {
    if (step === 3 || step === 4) {
      setStep(step + 1);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="onboarding-step onboarding-welcome">
          <div className="onboarding-icon">🏡</div>
          <h1 className="onboarding-brand">Nesti</h1>
          <h2 className="onboarding-title">Bienvenue dans Nesti</h2>
          <p className="onboarding-subtitle">Votre assistant familial inclusif</p>
          <p className="onboarding-description">
            Organisez votre vie familiale, découvrez des activités adaptées et restez connectés.
          </p>
          <button className="onboarding-btn-primary" onClick={handleNext}>
            Commencer
          </button>
        </div>
      )}

      {/* Step 2: Create Nest */}
      {step === 2 && (
        <div className="onboarding-step">
          <div className="onboarding-progress">Étape 2 / 5</div>
          <div className="onboarding-icon">👨‍👩‍👧‍👦</div>
          <h2 className="onboarding-title">Créez votre Nest</h2>
          <p className="onboarding-subtitle">Donnez un nom à votre famille</p>
          <p className="onboarding-description">
            C'est votre espace privé et chaleureux où vous partagerez vos meilleurs moments.
          </p>
          
          <div className="onboarding-form">
            <input
              type="text"
              className="onboarding-input"
              placeholder="Ex: Famille Martin, Les Dupont..."
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              maxLength={50}
              disabled={loading}
            />
            {error && <p className="onboarding-error">{error}</p>}
          </div>

          <button 
            className="onboarding-btn-primary" 
            onClick={handleNext}
            disabled={loading || !familyName.trim()}
          >
            {loading ? 'Création...' : 'Continuer'}
          </button>
        </div>
      )}

      {/* Step 3: Accessibility */}
      {step === 3 && (
        <div className="onboarding-step">
          <div className="onboarding-progress">Étape 3 / 5</div>
          <div className="onboarding-icon">♿</div>
          <h2 className="onboarding-title">Accessibilité</h2>
          <p className="onboarding-subtitle">Adaptez Nesti à vos besoins</p>
          <p className="onboarding-description">
            Sélectionnez les adaptations qui vous concernent pour une meilleure expérience.
          </p>
          
          <div className="onboarding-accessibility-grid">
            {accessibilityOptions.map(option => (
              <button
                key={option.id}
                className={`onboarding-accessibility-btn ${accessibilityNeeds[option.id] ? 'selected' : ''}`}
                onClick={() => toggleAccessibility(option.id)}
              >
                <div className="accessibility-label">{option.label}</div>
                <div className="accessibility-description">{option.description}</div>
              </button>
            ))}
          </div>

          <div className="onboarding-form" style={{marginTop: '1rem'}}>
            <input
              type="text"
              className="onboarding-input"
              placeholder="Autres besoins spécifiques... (optionnel)"
              value={accessibilityNeeds.other}
              onChange={(e) => setAccessibilityNeeds(prev => ({...prev, other: e.target.value}))}
              maxLength={200}
            />
          </div>

          <div className="onboarding-actions">
            <button className="onboarding-btn-secondary" onClick={handleSkip}>
              Passer
            </button>
            <button className="onboarding-btn-primary" onClick={handleNext}>
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preferences */}
      {step === 4 && (
        <div className="onboarding-step">
          <div className="onboarding-progress">Étape 4 / 5</div>
          <div className="onboarding-icon">✨</div>
          <h2 className="onboarding-title">Personnalisez vos préférences</h2>
          <p className="onboarding-subtitle">Aidez Nesti à vous connaître</p>
          <p className="onboarding-description">
            Sélectionnez vos centres d'intérêt pour recevoir des suggestions d'activités adaptées.
          </p>
          
          <div className="onboarding-preferences-count">
            {preferences.length} préférence{preferences.length !== 1 ? 's' : ''} sélectionnée{preferences.length !== 1 ? 's' : ''}
          </div>

          <div className="onboarding-preferences-grid">
            {availablePreferences.map(pref => (
              <button
                key={pref.id}
                className={`onboarding-preference-btn ${preferences.includes(pref.id) ? 'selected' : ''}`}
                onClick={() => togglePreference(pref.id)}
              >
                {pref.label}
              </button>
            ))}
          </div>

          <div className="onboarding-actions">
            <button className="onboarding-btn-secondary" onClick={handleSkip}>
              Passer
            </button>
            <button className="onboarding-btn-primary" onClick={handleNext}>
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Completion */}
      {step === 5 && (
        <div className="onboarding-step onboarding-completion">
          <div className="onboarding-progress">Étape 5 / 5</div>
          <div className="onboarding-summary">
            <div className="onboarding-summary-item">
              <strong>Nest:</strong> {familyName}
            </div>
            <div className="onboarding-summary-item">
              {preferences.length} préférence{preferences.length !== 1 ? 's' : ''} configurée{preferences.length !== 1 ? 's' : ''}
            </div>
            {Object.values(accessibilityNeeds).some(v => v) && (
              <div className="onboarding-summary-item">
                Adaptations d'accessibilité activées
              </div>
            )}
          </div>
          <div className="onboarding-icon">🎉</div>
          <h2 className="onboarding-title">Tout est prêt !</h2>
          <p className="onboarding-subtitle">Commencez l'aventure Nesti</p>
          <p className="onboarding-description">
            Vous pouvez maintenant inviter des membres, planifier vos activités et découvrir des suggestions personnalisées.
          </p>
          
          <button className="onboarding-btn-primary" onClick={handleNext}>
            Découvrir Nesti
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;

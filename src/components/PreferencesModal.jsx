import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import './PreferencesModal.css';

export default function PreferencesModal({ userId, familyId, onClose, onUpdate }) {
  const [preferences, setPreferences] = useState({
    favorite_activities: [],
    has_disability: false,
    disability_types: [],
    age_ranges: [],
    budget_preference: 'medium',
    transport_preference: 'public',
    distance_preference: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newActivity, setNewActivity] = useState('');

  const activityCategories = [
    '⚽ Sport',
    '🎨 Art & Créativité',
    '🎭 Culture',
    '🌳 Nature',
    '🎮 Jeux',
    '👨‍🍳 Cuisine',
    '📚 Lecture',
    '🎵 Musique',
    '🧘 Bien-être',
    '🔬 Sciences'
  ];

  const disabilityTypes = [
    'Motrice',
    'Visuelle',
    'Auditive',
    'Cognitive',
    'Psychique',
    'Multiple'
  ];

  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, familyId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Try to load from user_preferences table
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!prefsError && userPrefs) {
        setPreferences({
          favorite_activities: userPrefs.favorite_activities || [],
          has_disability: userPrefs.has_disability || false,
          disability_types: userPrefs.disability_types || [],
          age_ranges: userPrefs.age_ranges || [],
          budget_preference: userPrefs.budget_preference || 'medium',
          transport_preference: userPrefs.transport_preference || 'public',
          distance_preference: userPrefs.distance_preference || 10
        });
      }

      // Also load family preferences if available
      if (familyId) {
        const { data: familyData } = await supabase
          .from('families')
          .select('preferences')
          .eq('id', familyId)
          .single();

        if (familyData?.preferences) {
          // Merge family preferences with user preferences
          setPreferences(prev => ({
            ...prev,
            ...familyData.preferences
          }));
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save to user_preferences table
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          favorite_activities: preferences.favorite_activities,
          has_disability: preferences.has_disability,
          disability_types: preferences.disability_types,
          age_ranges: preferences.age_ranges,
          budget_preference: preferences.budget_preference,
          transport_preference: preferences.transport_preference,
          distance_preference: preferences.distance_preference,
          updated_at: new Date().toISOString()
        });

      if (prefsError) throw prefsError;

      // Update family preferences if family exists
      if (familyId) {
        const { error: familyError } = await supabase
          .from('families')
          .update({
            preferences: {
              has_disability: preferences.has_disability,
              disability_types: preferences.disability_types
            }
          })
          .eq('id', familyId);

        if (familyError) console.error('Family update error:', familyError);
      }

      if (onUpdate) {
        onUpdate(preferences);
      }

      alert('✅ Préférences enregistrées avec succès !');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('❌ Erreur lors de l\'enregistrement des préférences');
    } finally {
      setSaving(false);
    }
  };

  const addActivity = () => {
    if (newActivity.trim() && !preferences.favorite_activities.includes(newActivity.trim())) {
      setPreferences({
        ...preferences,
        favorite_activities: [...preferences.favorite_activities, newActivity.trim()]
      });
      setNewActivity('');
    }
  };

  const removeActivity = (activity) => {
    setPreferences({
      ...preferences,
      favorite_activities: preferences.favorite_activities.filter(a => a !== activity)
    });
  };

  const toggleDisabilityType = (type) => {
    const current = preferences.disability_types || [];
    if (current.includes(type)) {
      setPreferences({
        ...preferences,
        disability_types: current.filter(t => t !== type)
      });
    } else {
      setPreferences({
        ...preferences,
        disability_types: [...current, type]
      });
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="preferences-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des préférences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="preferences-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">⚙️ Modifier mes préférences</h2>
            <p className="modal-subtitle">Personnalisez vos recommandations d'activités</p>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Fermer">
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Favorite Activities */}
          <div className="preference-section">
            <h3>🎯 Activités préférées</h3>
            <p className="section-description">Sélectionnez ou ajoutez vos activités favorites</p>
            
            <div className="activity-chips">
              {activityCategories.map(category => {
                const isSelected = preferences.favorite_activities.includes(category);
                return (
                  <button
                    key={category}
                    className={`activity-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        removeActivity(category);
                      } else {
                        setPreferences({
                          ...preferences,
                          favorite_activities: [...preferences.favorite_activities, category]
                        });
                      }
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="add-activity-section">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                placeholder="Ajouter une activité personnalisée"
                className="activity-input"
              />
              <button onClick={addActivity} className="add-btn">
                <PlusIcon className="icon" />
              </button>
            </div>

            {preferences.favorite_activities.filter(a => !activityCategories.includes(a)).length > 0 && (
              <div className="custom-activities">
                <p className="subsection-title">Activités personnalisées:</p>
                {preferences.favorite_activities
                  .filter(a => !activityCategories.includes(a))
                  .map(activity => (
                    <div key={activity} className="custom-activity-item">
                      <span>{activity}</span>
                      <button onClick={() => removeActivity(activity)} className="remove-btn">
                        <TrashIcon className="icon" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Accessibility */}
          <div className="preference-section">
            <h3>♿ Accessibilité</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.has_disability}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    has_disability: e.target.checked,
                    disability_types: e.target.checked ? preferences.disability_types : []
                  })}
                />
                <span>Un membre de la famille a un handicap</span>
              </label>
            </div>

            {preferences.has_disability && (
              <div className="disability-types">
                <p className="subsection-title">Type(s) de handicap:</p>
                {disabilityTypes.map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.disability_types?.includes(type)}
                      onChange={() => toggleDisabilityType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Budget Preference */}
          <div className="preference-section">
            <h3>💰 Budget</h3>
            <select
              value={preferences.budget_preference}
              onChange={(e) => setPreferences({ ...preferences, budget_preference: e.target.value })}
              className="preference-select"
            >
              <option value="free">Gratuit uniquement</option>
              <option value="low">Petit budget (0-20€)</option>
              <option value="medium">Budget moyen (20-50€)</option>
              <option value="high">Budget élevé (50€+)</option>
            </select>
          </div>

          {/* Transport Preference */}
          <div className="preference-section">
            <h3>🚗 Moyen de transport</h3>
            <select
              value={preferences.transport_preference}
              onChange={(e) => setPreferences({ ...preferences, transport_preference: e.target.value })}
              className="preference-select"
            >
              <option value="public">Transports en commun</option>
              <option value="car">Voiture</option>
              <option value="bike">Vélo</option>
              <option value="walk">À pied</option>
            </select>
          </div>

          {/* Distance Preference */}
          <div className="preference-section">
            <h3>📍 Distance maximale</h3>
            <div className="distance-slider">
              <input
                type="range"
                min="1"
                max="50"
                value={preferences.distance_preference}
                onChange={(e) => setPreferences({ ...preferences, distance_preference: parseInt(e.target.value) })}
                className="slider"
              />
              <span className="distance-value">{preferences.distance_preference} km</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary" disabled={saving}>
            Annuler
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

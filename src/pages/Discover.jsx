import { useState, useEffect } from "react";
import { SparklesIcon, AdjustmentsHorizontalIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { activityService } from '../services/activityService';
import ileDeFranceService from '../services/ileDeFranceService';
import ActivityCard from "../components/ActivityCard";
import './Discover.css';

const userPreferences = ['Football', 'Cuisine', 'Jardinage', 'Art'];

export default function Discover() {
  const [activeTab, setActiveTab] = useState('activites');
  const [activities, setActivities] = useState([]);
  const [idfActivities, setIdfActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIDF, setLoadingIDF] = useState(false);
  const [showIDFActivities, setShowIDFActivities] = useState(false);

  useEffect(() => {
    loadActivities();
    loadIDFActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await activityService.getActivities();
      
      if (!error && data && data.length > 0) {
        // Transform database activities to match UI format
        const transformedActivities = data.map(act => ({
          id: act.id,
          title: act.title,
          category: act.category,
          emoji: getCategoryEmoji(act.category),
          matchScore: calculateMatchScore(act),
          rating: 4.5,
          reviews: 0,
          description: act.description,
          location: '2.5 km', // Would come from user location calculation
          date: 'Disponible',
          price: 0,
          duration: act.duration_min ? `${act.duration_min} min` : '',
          difficulty: act.difficulty,
          ageRange: `${act.age_min}-${act.age_max} ans`,
          tags: [act.category, act.difficulty].filter(Boolean)
        }));
        setActivities(transformedActivities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'inclusion': '🤝',
      'confiance': '💪',
      'dialogue': '💬',
      'decouverte': '🌍',
      'sport': '⚽',
      'cuisine': '👨‍🍳',
      'art': '🎨',
      'nature': '🌳'
    };
    return emojiMap[category?.toLowerCase()] || '✨';
  };

  const calculateMatchScore = (activity) => {
    // Simple match score based on category and difficulty
    // In a real app, this would be based on user preferences
    return Math.floor(Math.random() * 15) + 85; // 85-100%
  };

  const loadIDFActivities = async () => {
    try {
      setLoadingIDF(true);
      // Fetch real activities from Île-de-France API
      const idfData = await ileDeFranceService.fetchIDFActivities({ limit: 30 });
      
      if (idfData && idfData.length > 0) {
        // Transform IDF activities to Nesti format
        const transformedIDF = idfData
          .map(act => ileDeFranceService.convertIDFToNestiFormat(act))
          .filter(Boolean)
          .map((act, index) => ({
            id: act.id,
            title: act.title,
            category: act.type,
            emoji: getCategoryEmojiByType(act.type),
            matchScore: 85 - (index % 20), // Simulated match score
            rating: 4.2 + (Math.random() * 0.6),
            reviews: Math.floor(Math.random() * 100),
            description: act.description,
            location: act.location.city ? `${act.location.city} (${act.location.postalCode})` : 'À proximité',
            date: 'Disponible maintenant',
            price: 0,
            tags: [
              act.accessibility.handicapAccess && 'Accessible PMR',
              act.accessibility.publicTransport && 'Transports publics',
              act.amenities.freeAccess && 'Accès libre'
            ].filter(Boolean),
            source: 'Île-de-France',
            fullData: act
          }));
        
        setIdfActivities(transformedIDF);
      }
    } catch (error) {
      console.error('Error loading IDF activities:', error);
    } finally {
      setLoadingIDF(false);
    }
  };

  const tabs = [
    { id: 'activites', label: 'Activités Nesti' },
    { id: 'idf', label: '🗺️ Île-de-France' },
    { id: 'articles', label: 'Articles' }
  ];

  const displayActivities = activeTab === 'idf' ? idfActivities : activities;
  const isLoading = activeTab === 'idf' ? loadingIDF : loading;

  return (
    <div className="discover-page">
      {/* Suggestions Box */}
      <div className="suggestions-box">
        <div className="suggestions-header">
          <div className="suggestions-icon">
            {activeTab === 'idf' ? (
              <MapPinIcon className="sparkles-icon" />
            ) : (
              <SparklesIcon className="sparkles-icon" />
            )}
          </div>
          <div className="suggestions-content">
            <h2 className="suggestions-title">
              {activeTab === 'idf' ? 'Activités en Île-de-France' : 'Suggestions personnalisées'}
            </h2>
            <p className="suggestions-subtitle">
              {activeTab === 'idf' 
                ? 'Équipements sportifs et culturels près de chez vous'
                : `Basées sur vos préférences : ${userPreferences.join(', ')}`
              }
            </p>
          </div>
          <button className="filter-btn" aria-label="Filtrer">
            <AdjustmentsHorizontalIcon className="filter-icon" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="discover-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`discover-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="activities-list">
        {isLoading ? (
          <div className="loading-message">
            {activeTab === 'idf' 
              ? 'Chargement des activités Île-de-France...' 
              : 'Chargement des activités...'}
          </div>
        ) : displayActivities.length > 0 ? (
          displayActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="empty-activities">
            <p>
              {activeTab === 'idf'
                ? 'Aucune activité disponible en Île-de-France pour le moment.'
                : 'Aucune activité disponible pour le moment.'}
            </p>
            {activeTab === 'idf' && (
              <button 
                onClick={loadIDFActivities}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Recharger
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to get emoji by activity type
function getCategoryEmojiByType(type) {
  const emojiMap = {
    'Court de tennis': '🎾',
    'Terrain de football': '⚽',
    'Piscine': '🏊',
    'Salle de sport': '🏋️',
    'Gymnase': '🤸',
    'Stade': '🏟️',
    'Parc': '🌳',
    'Jardin': '🌺',
    'Bibliothèque': '📚',
    'Médiathèque': '📖',
    'Centre culturel': '🎭',
    'Théâtre': '🎬',
    'Cinéma': '🎞️',
    'Musée': '🏛️',
  };

  // Try exact match first
  if (emojiMap[type]) return emojiMap[type];
  
  // Try partial match
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (type && type.toLowerCase().includes(key.toLowerCase())) {
      return emoji;
    }
  }
  
  return '🎯'; // Default
}

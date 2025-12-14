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
  const [leisureIslands, setLeisureIslands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIDF, setLoadingIDF] = useState(false);
  const [loadingIslands, setLoadingIslands] = useState(false);

  useEffect(() => {
    loadActivities();
    loadIDFActivities();
    loadLeisureIslands();
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
      } else {
        // Use fallback data if API returns no results
        console.log('No IDF activities from API, using fallback data');
        loadFallbackIDFActivities();
      }
    } catch (error) {
      console.error('Error loading IDF activities:', error);
      // Use fallback data on error
      loadFallbackIDFActivities();
    } finally {
      setLoadingIDF(false);
    }
  };

  const loadFallbackIDFActivities = () => {
    const fallbackData = ileDeFranceService.getFallbackActivities(20);
    const transformedFallback = fallbackData.map((act, index) => ({
      id: act.id,
      title: act.title,
      category: act.category,
      emoji: getCategoryEmojiByType(act.category),
      matchScore: 90 - (index % 15),
      rating: act.rating,
      reviews: Math.floor(Math.random() * 150),
      description: act.description,
      location: act.location,
      date: 'Disponible',
      price: act.price === 'Gratuit' ? 0 : null,
      ageRange: act.ageRange,
      tags: act.tags,
      source: 'Activités suggérées'
    }));
    setIdfActivities(transformedFallback);
  };

  const loadLeisureIslands = async () => {
    try {
      setLoadingIslands(true);
      // Fetch leisure islands from Île-de-France API
      const islandsData = await ileDeFranceService.fetchLeisureIslands({ limit: 20 });
      
      if (islandsData && islandsData.length > 0) {
        // Transform leisure islands to Nesti format
        const transformedIslands = islandsData
          .map(island => ileDeFranceService.convertLeisureIslandToNestiFormat(island))
          .filter(Boolean)
          .map((island, index) => ({
            id: island.id,
            title: island.title,
            category: 'Loisirs',
            emoji: '🏝️',
            matchScore: 88 - (index % 15),
            rating: 4.5 + (Math.random() * 0.4),
            reviews: Math.floor(Math.random() * 200),
            description: island.description,
            location: island.location.city || 'Île-de-France',
            date: 'Toute l\'année',
            price: island.amenities.freeAccess ? 0 : null,
            tags: [
              'Île de loisirs',
              island.amenities.freeAccess && 'Accès libre',
              'Nature'
            ].filter(Boolean),
            source: 'Îles de loisirs IDF',
            fullData: island
          }));
        
        setLeisureIslands(transformedIslands);
      }
    } catch (error) {
      console.error('Error loading leisure islands:', error);
    } finally {
      setLoadingIslands(false);
    }
  };

  const tabs = [
    { id: 'activites', label: 'Activités Nesti' },
    { id: 'idf', label: '🗺️ Équipements' },
    { id: 'islands', label: '🏝️ Îles de loisirs' },
    { id: 'articles', label: 'Articles' }
  ];

  const displayActivities = activeTab === 'idf' ? idfActivities : activeTab === 'islands' ? leisureIslands : activities;
  const isLoading = activeTab === 'idf' ? loadingIDF : activeTab === 'islands' ? loadingIslands : loading;

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
          <div className="loading-container" style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            marginTop: '1rem'
          }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--color-border)',
              borderTop: '4px solid var(--color-primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              {activeTab === 'idf' 
                ? 'Chargement des activités Île-de-France...' 
                : 'Chargement des activités...'}
            </p>
          </div>
        ) : displayActivities.length > 0 ? (
          displayActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="empty-activities" style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              Aucune activité trouvée
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              {activeTab === 'idf'
                ? 'Aucune activité disponible en Île-de-France pour le moment.'
                : 'Aucune activité disponible pour le moment.'}
            </p>
            {activeTab === 'idf' && (
              <button 
                onClick={loadIDFActivities}
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem 1.5rem', 
                  background: 'var(--color-primary)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-base)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
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

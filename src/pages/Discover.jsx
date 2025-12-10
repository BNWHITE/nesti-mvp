import { useState, useEffect } from "react";
import { SparklesIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { activityService } from '../services/activityService';
import ActivityCard from "../components/ActivityCard";
import './Discover.css';

// Mock data
const mockActivities = [
  {
    id: 1,
    title: 'Stage de Football',
    category: 'Sport',
    emoji: '⚽',
    matchScore: 95,
    rating: 4.5,
    reviews: 23,
    description: 'Stage de football pour enfants de 8 à 12 ans. Encadrement professionnel.',
    location: '2.3 km',
    date: 'Mer 15 Mars',
    price: 45,
    tags: ['Famille', 'Sport', 'Enfants']
  },
  {
    id: 2,
    title: 'Atelier Cuisine',
    category: 'Cuisine',
    emoji: '👨‍🍳',
    matchScore: 92,
    rating: 4.8,
    reviews: 45,
    description: 'Découvrez les secrets de la cuisine française en famille.',
    location: '1.5 km',
    date: 'Sam 18 Mars',
    price: 35,
    tags: ['Famille', 'Cuisine', 'Créatif']
  },
  {
    id: 3,
    title: 'Sortie au Parc',
    category: 'Nature',
    emoji: '🌳',
    matchScore: 88,
    rating: 4.3,
    reviews: 67,
    description: 'Journée découverte nature avec activités pour toute la famille.',
    location: '3.8 km',
    date: 'Dim 19 Mars',
    price: 0,
    tags: ['Famille', 'Nature', 'Gratuit']
  }
];

const userPreferences = ['Football', 'Cuisine', 'Jardinage', 'Art'];

export default function Discover() {
  const [activeTab, setActiveTab] = useState('activites');
  const [activities, setActivities] = useState(mockActivities); // Fallback to mock
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
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
          rating: 4.5, // Could be calculated from reviews
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

  const tabs = [
    { id: 'activites', label: 'Activités' },
    { id: 'articles', label: 'Articles' }
  ];

  return (
    <div className="discover-page">
      {/* Suggestions Box */}
      <div className="suggestions-box">
        <div className="suggestions-header">
          <div className="suggestions-icon">
            <SparklesIcon className="sparkles-icon" />
          </div>
          <div className="suggestions-content">
            <h2 className="suggestions-title">Suggestions personnalisées</h2>
            <p className="suggestions-subtitle">
              Basées sur vos préférences : {userPreferences.join(', ')}
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
        {loading ? (
          <div className="loading-message">Chargement des activités...</div>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="empty-activities">
            <p>Aucune activité disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

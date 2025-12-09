import React, { useState } from "react";
import ActivityCard from "../components/ActivityCard";
import "./Discover.css";

// Mock activities data
const mockActivities = [
  {
    image: '⚽',
    match: 95,
    title: 'Stage de Football',
    category: 'Sport',
    rating: 4.5,
    reviews: 23,
    description: 'Stage intensif pour enfants et adolescents',
    distance: '2.5 km',
    date: '15-20 Juillet',
    price: '120€',
    tags: ['Extérieur', 'Groupe']
  },
  {
    image: '🎨',
    match: 92,
    title: 'Atelier Peinture',
    category: 'Art',
    rating: 4.8,
    reviews: 45,
    description: 'Découvrez les techniques de peinture créative',
    distance: '1.2 km',
    date: 'Tous les mercredis',
    price: '25€/séance',
    tags: ['Intérieur', 'Créatif']
  },
  {
    image: '🌳',
    match: 88,
    title: 'Jardinage Familial',
    category: 'Nature',
    rating: 4.3,
    reviews: 12,
    description: 'Apprenez à jardiner en famille',
    distance: '3.8 km',
    date: 'Samedi 20 Juillet',
    price: 'Gratuit',
    tags: ['Extérieur', 'Écologique']
  }
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState('activites');

  return (
    <div className="discover-page">
      <div className="suggestions-box">
        <div className="suggestions-header">
          <div className="suggestions-icon">✨</div>
          <div className="suggestions-text">
            <h3>Suggestions personnalisées</h3>
            <p>Basées sur vos préférences : Football, Cuisine, Jardinage, Art</p>
          </div>
          <button className="filter-icon-btn">🔍</button>
        </div>
      </div>

      <div className="discover-tabs">
        <button 
          className={`tab-btn ${activeTab === 'activites' ? 'active' : ''}`}
          onClick={() => setActiveTab('activites')}
        >
          Activités
        </button>
        <button 
          className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          Articles
        </button>
      </div>

      <div className="activities-list">
        {mockActivities.map((activity, idx) => (
          <ActivityCard key={idx} activity={activity} />
        ))}
      </div>
    </div>
  );
}

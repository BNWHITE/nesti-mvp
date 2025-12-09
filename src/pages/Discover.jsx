import React, { useState } from "react";
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import ActivityCard from "../components/ActivityCard";
import "./Discover.css";

// Mock data
const mockActivities = [
  {
    id: 1,
    emoji: "⚽",
    matchScore: 95,
    title: "Stage de Football",
    category: "Sport",
    rating: 4.5,
    reviewCount: 23,
    description: "Stage intensif pour les jeunes footballeurs avec entraîneurs professionnels",
    distance: "2.5 km",
    date: "15-20 Juillet",
    price: "150€",
    tags: ["Sport", "Extérieur", "Groupe"]
  },
  {
    id: 2,
    emoji: "🎨",
    matchScore: 92,
    title: "Atelier de Peinture Créative",
    category: "Art",
    rating: 4.8,
    reviewCount: 45,
    description: "Découvrez l'art de la peinture acrylique dans un atelier convivial",
    distance: "1.8 km",
    date: "Tous les mercredis",
    price: "25€/séance",
    tags: ["Art", "Créatif", "Intérieur"]
  },
  {
    id: 3,
    emoji: "🌱",
    matchScore: 88,
    title: "Jardinage en Famille",
    category: "Nature",
    rating: 4.6,
    reviewCount: 18,
    description: "Atelier de jardinage écologique pour toute la famille",
    distance: "3.2 km",
    date: "Samedis matin",
    price: "Gratuit",
    tags: ["Nature", "Extérieur", "Écologie"]
  }
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState("activities");

  return (
    <div className="discover-page">
      <div className="page-container">
        {/* Suggestions Box */}
        <div className="suggestions-box">
          <div className="suggestions-header">
            <div className="suggestions-icon">✨</div>
            <div className="suggestions-content">
              <h3 className="suggestions-title">Suggestions personnalisées</h3>
              <p className="suggestions-subtitle">
                Basées sur vos préférences : Football, Cuisine, Jardinage, Art
              </p>
            </div>
            <button className="filter-icon-btn" aria-label="Filtres">
              <AdjustmentsHorizontalIcon className="icon-lg" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="discover-tabs">
          <button 
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
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

        {/* Activities List */}
        <div className="activities-list">
          {mockActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

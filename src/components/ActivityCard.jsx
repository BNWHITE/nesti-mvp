import React, { useState } from 'react';
import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  HeartIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import './ActivityCard.css';

export default function ActivityCard({ activity }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="activity-card">
      <div className="activity-image">
        {activity.image ? (
          <img src={activity.image} alt={activity.title} />
        ) : (
          <div className="activity-emoji">{activity.emoji || '🎯'}</div>
        )}
        {activity.matchScore && (
          <div className="match-badge">
            {activity.matchScore}% Match
          </div>
        )}
      </div>

      <div className="activity-content">
        <div className="activity-header">
          <h3 className="activity-title">{activity.title}</h3>
          <span className="activity-category">{activity.category}</span>
        </div>

        {activity.rating && (
          <div className="activity-rating">
            <StarIcon className="star-icon" />
            <span className="rating-value">{activity.rating}</span>
            <span className="rating-count">({activity.reviewCount} avis)</span>
          </div>
        )}

        <p className="activity-description">{activity.description}</p>

        <div className="activity-details">
          {activity.distance && (
            <div className="detail-item">
              <MapPinIcon className="icon-sm" />
              <span>{activity.distance}</span>
            </div>
          )}
          {activity.date && (
            <div className="detail-item">
              <CalendarIcon className="icon-sm" />
              <span>{activity.date}</span>
            </div>
          )}
          {activity.price && (
            <div className="detail-item">
              <CurrencyEuroIcon className="icon-sm" />
              <span>{activity.price}</span>
            </div>
          )}
        </div>

        {activity.tags && activity.tags.length > 0 && (
          <div className="activity-tags">
            {activity.tags.map((tag, index) => (
              <span key={index} className="activity-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="activity-actions">
          <button className="btn-primary activity-btn">
            <PlusIcon className="icon-sm" />
            <span>Ajouter</span>
          </button>
          <button 
            className={`activity-save-btn ${saved ? 'saved' : ''}`}
            onClick={() => setSaved(!saved)}
          >
            {saved ? <HeartSolidIcon className="icon-md" /> : <HeartIcon className="icon-md" />}
            <span>{saved ? 'Sauvegardé' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  HeartIcon,
  StarIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import './ActivityCard.css';

export default function ActivityCard({ activity }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="activity-card">
      {/* Activity Image/Emoji */}
      <div className="activity-image">
        {activity.image ? (
          <img src={activity.image} alt={activity.title} />
        ) : (
          <div className="activity-emoji">{activity.emoji || '🎨'}</div>
        )}
        {activity.matchScore && (
          <div className="activity-match-badge">
            {activity.matchScore}% match
          </div>
        )}
      </div>

      {/* Activity Content */}
      <div className="activity-content">
        {/* Header */}
        <div className="activity-header">
          <div>
            <h3 className="activity-title">{activity.title}</h3>
            <span className="activity-category">{activity.category}</span>
          </div>
          <button 
            className={`activity-save-btn ${saved ? 'saved' : ''}`}
            onClick={() => setSaved(!saved)}
            aria-label="Sauvegarder"
          >
            {saved ? (
              <HeartIconSolid className="save-icon" />
            ) : (
              <HeartIcon className="save-icon" />
            )}
          </button>
        </div>

        {/* Rating */}
        {activity.rating && (
          <div className="activity-rating">
            <div className="rating-stars">
              <StarIcon className="star-icon filled" />
              <span className="rating-value">{activity.rating}</span>
            </div>
            {activity.reviews && (
              <span className="rating-reviews">({activity.reviews} avis)</span>
            )}
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <p className="activity-description">{activity.description}</p>
        )}

        {/* Activity Info */}
        <div className="activity-info">
          {activity.location && (
            <div className="activity-info-item">
              <MapPinIcon className="info-icon" />
              <span>{activity.location}</span>
            </div>
          )}
          {activity.date && (
            <div className="activity-info-item">
              <CalendarIcon className="info-icon" />
              <span>{activity.date}</span>
            </div>
          )}
          {activity.price !== undefined && (
            <div className="activity-info-item">
              <CurrencyEuroIcon className="info-icon" />
              <span>{activity.price === 0 ? 'Gratuit' : `${activity.price}€`}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <div className="activity-tags">
            {activity.tags.map((tag, index) => (
              <span key={index} className="activity-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="activity-actions">
          <button className="activity-btn activity-btn-primary">
            <CalendarIcon className="btn-icon" />
            Ajouter à l'agenda
          </button>
        </div>
      </div>
    </div>
  );
}

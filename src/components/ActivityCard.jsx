import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  HeartIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import './ActivityCard.css';

export default function ActivityCard({ activity }) {
  const [saved, setSaved] = useState(false);

  // Generate Google Maps URL from coordinates or address
  const getGoogleMapsUrl = () => {
    // Check if we have coordinates from fullData
    if (activity.fullData && activity.fullData.location && activity.fullData.location.coordinates) {
      const coords = activity.fullData.location.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;
    }
    
    // Fallback to coordinates if available directly
    if (activity.coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng || activity.coordinates.lon}`;
    }
    
    // Fallback to address search
    if (activity.fullData && activity.fullData.location) {
      const loc = activity.fullData.location;
      const address = `${loc.address || ''} ${loc.city || ''} ${loc.postalCode || ''}`.trim();
      if (address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }
    }
    
    // Last fallback to location text
    if (activity.location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
    }
    
    return null;
  };

  const googleMapsUrl = getGoogleMapsUrl();
  const websiteUrl = activity.website || activity.sourceUrl || (activity.fullData && activity.fullData.sourceUrl);

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

        {/* Location & Website Links */}
        {(googleMapsUrl || websiteUrl) && (
          <div className="activity-links">
            {googleMapsUrl && (
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="activity-link-btn"
              >
                <MapPinIcon className="link-icon" />
                <span>Voir sur Maps</span>
              </a>
            )}
            {websiteUrl && (
              <a 
                href={websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="activity-link-btn"
              >
                <GlobeAltIcon className="link-icon" />
                <span>Site web</span>
              </a>
            )}
          </div>
        )}

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

import { 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyEuroIcon,
  HeartIcon,
  StarIcon,
  GlobeAltIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { createEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import './ActivityCard.css';

export default function ActivityCard({ activity }) {
  const [saved, setSaved] = useState(false);
  const [addingToAgenda, setAddingToAgenda] = useState(false);
  const { user } = useAuth();

  const handleAddToAgenda = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter à l\'agenda');
      return;
    }

    // Get user's family_id
    try {
      setAddingToAgenda(true);
      
      // For now, we'll use a prompt to get the family_id
      // In production, this would come from the user's profile
      const familyId = user.family_id;
      
      if (!familyId) {
        alert('Vous devez d\'abord rejoindre une famille pour ajouter des événements à l\'agenda');
        setAddingToAgenda(false);
        return;
      }

      // Create event from activity
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7); // Default to next week

      const { data, error } = await createEvent({
        title: activity.title,
        description: activity.description || `Activité: ${activity.title}`,
        event_date: eventDate.toISOString().split('T')[0],
        event_time: '14:00',
        location: activity.location || 'À définir',
        category: activity.category || 'Activité',
        family_id: familyId,
        created_by: user.id,
        participants: []
      });

      if (error) {
        console.error('Error adding to agenda:', error);
        alert('Erreur lors de l\'ajout à l\'agenda');
      } else {
        alert('✅ Activité ajoutée à l\'agenda familial !');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'ajout à l\'agenda');
    } finally {
      setAddingToAgenda(false);
    }
  };

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
          <button 
            className="activity-btn activity-btn-primary"
            onClick={handleAddToAgenda}
            disabled={addingToAgenda}
          >
            <CalendarIcon className="btn-icon" />
            {addingToAgenda ? 'Ajout...' : 'Ajouter à l\'agenda'}
          </button>
          
          {/* Website Link */}
          {activity.fullData?.website && (
            <a
              href={activity.fullData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="activity-btn activity-btn-secondary"
            >
              <GlobeAltIcon className="btn-icon" />
              Site web
            </a>
          )}
          
          {/* Maps Link */}
          {activity.fullData?.location && (activity.fullData.location.latitude && activity.fullData.location.longitude) && (
            <a
              href={`https://www.google.com/maps?q=${activity.fullData.location.latitude},${activity.fullData.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="activity-btn activity-btn-secondary"
            >
              <MapIcon className="btn-icon" />
              Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

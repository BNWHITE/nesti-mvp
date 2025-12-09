import React from 'react';
import { 
  MapPinIcon, 
  PencilIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import './EventCard.css';

export default function EventCard({ event }) {
  const formatTime = (time) => {
    return time;
  };

  const renderParticipants = () => {
    if (!event.participants || event.participants.length === 0) return null;
    
    return (
      <div className="event-participants">
        {event.participants.slice(0, 3).map((participant, index) => (
          <div key={index} className="participant-avatar">
            {participant.avatar || participant.name[0]}
          </div>
        ))}
        {event.participants.length > 3 && (
          <div className="participant-avatar more">
            +{event.participants.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="event-card">
      <div className="event-time">
        <span className="time-text">{formatTime(event.time)}</span>
      </div>
      
      <div className="event-content">
        <div className="event-header">
          <span className="event-icon">{event.icon || '📅'}</span>
          <div className="event-info">
            <h3 className="event-title">{event.title}</h3>
            {event.location && (
              <div className="event-location">
                <MapPinIcon className="icon-sm" />
                <span>{event.location}</span>
                {event.distance && (
                  <span className="distance">• {event.distance}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {renderParticipants()}

        {event.status && (
          <div className="event-status">
            <span className={`status-badge ${event.status.toLowerCase()}`}>
              {event.status}
            </span>
          </div>
        )}

        <div className="event-actions">
          <button className="event-action-btn">
            <EyeIcon className="icon-sm" />
            <span>Voir détails</span>
          </button>
          <button className="event-action-btn">
            <PencilIcon className="icon-sm" />
            <span>Modifier</span>
          </button>
        </div>
      </div>
    </div>
  );
}

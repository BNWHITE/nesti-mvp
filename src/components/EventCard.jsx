import React from 'react';
import './EventCard.css';

const EventCard = ({ event }) => {
  const {
    time = '14:00',
    icon = '⚽',
    title = 'Match de football',
    location = 'Stade Municipal',
    distance = '2.5 km',
    participants = [
      { avatar: 'S', name: 'Sophie' },
      { avatar: 'L', name: 'Louis' }
    ],
    status = null,
    urgent = false
  } = event;

  return (
    <div className={`event-card ${urgent ? 'urgent' : ''}`}>
      <div className="event-time">
        <span className="event-time-text">{time}</span>
      </div>
      
      <div className="event-content">
        <div className="event-header">
          <div className="event-icon">{icon}</div>
          <div className="event-info">
            <h3 className="event-title">{title}</h3>
            <div className="event-location">
              <span>📍</span> {location} • {distance}
            </div>
          </div>
        </div>

        <div className="event-footer">
          <div className="event-participants">
            {participants.map((p, idx) => (
              <div key={idx} className="avatar avatar-sm" title={p.name}>
                {p.avatar}
              </div>
            ))}
          </div>

          <div className="event-actions">
            {urgent && <span className="badge badge-warning">Urgent</span>}
            {status && <span className="badge badge-primary">{status}</span>}
            <button className="btn-ghost btn-sm">Voir détails</button>
            <button className="btn-ghost btn-sm">✏️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

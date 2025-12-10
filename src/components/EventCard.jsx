import { MapPinIcon, UserGroupIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import './EventCard.css';

export default function EventCard({ event, onEdit, onDelete }) {
  const getEventIcon = (type) => {
    const icons = {
      medical: '🏥',
      shopping: '🛒',
      sport: '⚽',
      school: '🎓',
      appointment: '📅',
      birthday: '🎂',
      default: '📌'
    };
    return icons[type] || icons.default;
  };

  const getBadgeClass = (priority) => {
    if (priority === 'urgent') return 'badge-urgent';
    if (priority === 'important') return 'badge-important';
    return 'badge-normal';
  };

  return (
    <div className="event-card">
      {/* Event Time */}
      <div className="event-time">
        <div className="event-hour">{event.time}</div>
      </div>

      {/* Event Content */}
      <div className="event-content">
        <div className="event-header">
          <div className="event-icon">
            {getEventIcon(event.type)}
          </div>
          <div className="event-info">
            <h3 className="event-title">{event.title}</h3>
            {event.location && (
              <div className="event-location">
                <MapPinIcon className="location-icon" />
                <span>{event.location}</span>
                {event.distance && (
                  <span className="event-distance">• {event.distance}</span>
                )}
              </div>
            )}
          </div>
          {/* Action buttons */}
          {(onEdit || onDelete) && (
            <div className="event-actions">
              {onEdit && (
                <button 
                  onClick={() => onEdit(event)} 
                  className="event-action-btn"
                  title="Modifier"
                >
                  <PencilIcon className="action-icon-small" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(event.id)} 
                  className="event-action-btn event-delete-btn"
                  title="Supprimer"
                >
                  <TrashIcon className="action-icon-small" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="event-details">
          {event.participants && event.participants.length > 0 && (
            <div className="event-participants">
              <UserGroupIcon className="participants-icon" />
              <div className="participants-avatars">
                {event.participants.map((participant, index) => (
                  <div key={index} className="participant-avatar" title={participant.name}>
                    {participant.initials}
                  </div>
                ))}
              </div>
              <span className="participants-count">
                {event.participants.length} participant{event.participants.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {event.duration && (
            <div className="event-duration">
              <ClockIcon className="duration-icon" />
              <span>{event.duration}</span>
            </div>
          )}
        </div>

        {/* Event Tags/Badges */}
        {(event.priority || event.tags) && (
          <div className="event-tags">
            {event.priority && (
              <span className={`event-badge ${getBadgeClass(event.priority)}`}>
                {event.priority === 'urgent' ? 'Urgent' : event.priority === 'important' ? 'Important' : ''}
              </span>
            )}
            {event.tags && event.tags.map((tag, index) => (
              <span key={index} className="event-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

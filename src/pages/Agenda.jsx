import { useState } from "react";
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import EventCard from "../components/EventCard";
import './Agenda.css';

// Empty initial state for new accounts
const mockEvents = [];

export default function Agenda() {
  const [activeFilter, setActiveFilter] = useState('aujourdhui');
  const [activeTab, setActiveTab] = useState('timeline');
  const [events, setEvents] = useState(mockEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    type: 'general',
    location: '',
    duration: '',
    priority: null
  });

  const filters = [
    { id: 'hier', label: 'Hier' },
    { id: 'aujourdhui', label: "Aujourd'hui" },
    { id: 'demain', label: 'Demain' },
    { id: 'semaine', label: 'Semaine' }
  ];

  const tabs = [
    { id: 'timeline', label: 'Timeline' },
    { id: 'avenir', label: 'À venir' }
  ];

  const eventTypes = [
    { value: 'general', label: 'Général', emoji: '📅' },
    { value: 'medical', label: 'Médical', emoji: '⚕️' },
    { value: 'shopping', label: 'Courses', emoji: '🛒' },
    { value: 'sport', label: 'Sport', emoji: '⚽' },
    { value: 'school', label: 'École', emoji: '🎒' },
    { value: 'family', label: 'Famille', emoji: '👨‍👩‍👧‍👦' }
  ];

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.time) {
      const createdEvent = {
        id: Date.now(), // Use timestamp for unique ID
        ...newEvent,
        distance: '0 km',
        participants: [],
        tags: []
      };
      setEvents([...events, createdEvent]);
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        time: '',
        type: 'general',
        location: '',
        duration: '',
        priority: null
      });
    }
  };

  return (
    <div className="agenda-page">
      {/* Date Header */}
      <div className="agenda-header">
        <div>
          <h1 className="agenda-title">Aujourd'hui</h1>
          <p className="agenda-date">{new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>
        <button 
          className="add-event-btn"
          onClick={() => setShowCreateModal(true)}
          title="Ajouter un événement"
        >
          <PlusIcon className="plus-icon" />
        </button>
      </div>

      {/* Filters */}
      <div className="agenda-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="agenda-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="events-list">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Aucun événement prévu</h3>
            <p>Commencez par créer votre premier événement familial</p>
            <button 
              className="empty-action-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="plus-icon-small" />
              Créer un événement
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvel événement</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <XMarkIcon className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Titre de l'événement"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Heure *</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="form-input"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Lieu de l'événement"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Durée</label>
                <input
                  type="text"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                  placeholder="ex: 1h30"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select
                  value={newEvent.priority || ''}
                  onChange={(e) => setNewEvent({...newEvent, priority: e.target.value || null})}
                  className="form-input"
                >
                  <option value="">Aucune</option>
                  <option value="urgent">Urgent</option>
                  <option value="important">Important</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button 
                onClick={handleCreateEvent} 
                className="btn-primary"
                disabled={!newEvent.title || !newEvent.time}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

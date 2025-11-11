import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AgendaPage.css';

export default function AgendaPage({ user, familyId }) {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'activity',
    location: ''
  });

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('family_events')
      .select('*')
      .eq('family_id', familyId)
      .order('start_time', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
  }, [familyId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('family_events')
      .insert([{
        ...newEvent,
        family_id: familyId,
        created_by: user.id
      }]);

    if (!error) {
      setShowCreateForm(false);
      setNewEvent({
        title: '', description: '', start_time: '', end_time: '', event_type: 'activity', location: ''
      });
      fetchEvents();
    }
  };

  const eventTypes = [
    { value: 'activity', emoji: '⚽', label: 'Activité' },
    { value: 'appointment', emoji: '📅', label: 'Rendez-vous' },
    { value: 'celebration', emoji: '🎉', label: 'Célébration' },
    { value: 'task', emoji: '✅', label: 'Tâche' }
  ];

  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <h1>📅 Agenda Familial</h1>
        <button 
          className="add-event-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Ajouter
        </button>
      </div>

      {showCreateForm && (
        <div className="event-form-overlay">
          <div className="event-form">
            <h3>Nouvel événement</h3>
            <form onSubmit={handleCreateEvent}>
              <input
                type="text"
                placeholder="Titre de l'événement"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />

              <select
                value={newEvent.event_type}
                onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                required
              />

              <input
                type="datetime-local"
                value={newEvent.end_time}
                onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
              />

              <input
                type="text"
                placeholder="Lieu"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </button>
                <button type="submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>Aucun événement pour le moment</p>
            <p>Créez votre premier événement familial !</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-emoji">
                {eventTypes.find(t => t.value === event.event_type)?.emoji}
              </div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span>📅 {new Date(event.start_time).toLocaleString('fr-FR')}</span>
                  {event.location && <span>📍 {event.location}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

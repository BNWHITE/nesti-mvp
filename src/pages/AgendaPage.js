// src/pages/AgendaPage.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AgendaPage.css'; 

const AgendaPage = ({ user, familyId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!familyId) {
      setError("Aucun agenda à afficher. Veuillez créer ou rejoindre un Nest familial.");
      setLoading(false);
      return;
    }

    try {
      // NOTE: Supposons que vous avez une table 'family_events'
      const { data, error } = await supabase
        .from('family_events') 
        .select('*')
        .eq('family_id', familyId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      
      // MOCKUP si la table est vide pour la démo :
      const mockEvents = [
        { id: 1, title: "Rendez-vous chez le dentiste", date: "15 Novembre", time: "14:00", type: "Rendez-vous" },
        { id: 2, title: "Dîner chez Papi et Mamie", date: "20 Novembre", time: "19:30", type: "Social" },
        { id: 3, title: "Match de foot de Léo", date: "25 Novembre", time: "10:00", type: "Sport" },
      ];

      setEvents(data.length > 0 ? data : mockEvents); 
      setError(null);

    } catch (err) {
      console.error("Erreur chargement de l'agenda:", err);
      setError("Erreur de connexion à l'agenda. Vérifiez les permissions.");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) return <div className="agenda-page loading">Chargement de l'agenda...</div>;

  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <h1>🗓️ Agenda du Nest</h1>
        <button className="add-event-btn">+ Ajouter un événement</button>
      </div>

      {error && <div className="agenda-error">{error}</div>}

      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-date-box">
              <span className="event-day">{event.date.split(' ')[0]}</span>
              <span className="event-month">{event.date.split(' ')[1]}</span>
            </div>
            <div className="event-details">
              <h2 className="event-title">{event.title}</h2>
              <p className="event-time">{event.time} | {event.type}</p>
            </div>
          </div>
        ))}
      </div>
      
      {events.length === 0 && !error && (
        <div className="empty-state">
          <p>Aucun événement planifié pour le moment. Planifions quelque chose !</p>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;

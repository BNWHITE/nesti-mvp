// src/pages/AgendaPage.js (UX/UI REFONTE)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AgendaPage.css'; 

const AgendaPage = ({ user, familyId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!familyId) {
      setError("Aucun agenda à afficher. Veuillez créer ou rejoindre un Nest familial.");
      setLoading(false);
      return;
    }

    try {
      const mockEvents = [
        { id: 1, title: "Rendez-vous chez le dentiste", date: "15 Nov", time: "14:00", type: "Rendez-vous" },
        { id: 2, title: "Dîner chez Papi et Mamie", date: "20 Nov", time: "19:30", type: "Social" },
        { id: 3, title: "Match de foot de Léo", date: "25 Nov", time: "10:00", type: "Sport" },
        { id: 4, title: "Sortie Découverte Rennes", date: "28 Nov", time: "16:00", type: "Loisir" },
        { id: 5, title: "Réunion école", date: "02 Déc", time: "18:30", type: "Administratif" },
      ];

      setEvents(mockEvents); 
      setError(null);

    } catch (err) {
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

      <div className={`calendar-container ${isCalendarOpen ? 'open' : 'closed'}`}>
        <div className="calendar-toggle" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
           {isCalendarOpen ? 'Réduire le calendrier' : 'Agrandir le calendrier'}
        </div>
        
        {isCalendarOpen && (
          <div className="calendar-widget">
            {/* PLACEHOLDER pour le calendrier */}
            <p className="calendar-placeholder"> [Composant Calendrier React ici] </p>
          </div>
        )}
      </div>

      <div className="event-list-container">
        <h2>Événements à venir</h2>
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
          {events.length === 0 && !error && (
            <div className="empty-state">
              <p>Aucun événement planifié pour le moment. Planifions quelque chose !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;

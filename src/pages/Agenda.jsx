import React, { useState } from "react";
import EventCard from "../components/EventCard";
import "./Agenda.css";

// Mock data
const mockEvents = [
  {
    time: '14:00',
    icon: '⚽',
    title: 'Match de football',
    location: 'Stade Municipal',
    distance: '2.5 km',
    participants: [
      { avatar: 'S', name: 'Sophie' },
      { avatar: 'L', name: 'Louis' }
    ],
    urgent: false
  },
  {
    time: '16:30',
    icon: '🎨',
    title: 'Cours de peinture',
    location: 'Atelier Créatif',
    distance: '1.2 km',
    participants: [
      { avatar: 'E', name: 'Emma' }
    ],
    urgent: false
  },
  {
    time: '18:00',
    icon: '🍽️',
    title: 'Dîner familial',
    location: 'Maison',
    distance: '0 km',
    participants: [
      { avatar: 'S', name: 'Sophie' },
      { avatar: 'P', name: 'Papa' },
      { avatar: 'E', name: 'Emma' },
      { avatar: 'L', name: 'Louis' }
    ],
    urgent: true
  }
];

export default function Agenda() {
  const [activeFilter, setActiveFilter] = useState('aujourdhui');
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <h1 className="agenda-title">Aujourd'hui</h1>
        <p className="agenda-date">{new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}</p>
      </div>

      <div className="agenda-filters">
        <button 
          className={`filter-btn ${activeFilter === 'hier' ? 'active' : ''}`}
          onClick={() => setActiveFilter('hier')}
        >
          Hier
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'aujourdhui' ? 'active' : ''}`}
          onClick={() => setActiveFilter('aujourdhui')}
        >
          Aujourd'hui
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'demain' ? 'active' : ''}`}
          onClick={() => setActiveFilter('demain')}
        >
          Demain
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'semaine' ? 'active' : ''}`}
          onClick={() => setActiveFilter('semaine')}
        >
          Semaine
        </button>
      </div>

      <div className="agenda-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`tab-btn ${activeTab === 'avenir' ? 'active' : ''}`}
          onClick={() => setActiveTab('avenir')}
        >
          À venir
        </button>
      </div>

      <div className="agenda-events">
        {mockEvents.map((event, idx) => (
          <EventCard key={idx} event={event} />
        ))}
      </div>
    </div>
  );
}

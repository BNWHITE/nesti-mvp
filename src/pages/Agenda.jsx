import React, { useState } from "react";
import EventCard from "../components/EventCard";
import "./Agenda.css";

// Mock data
const mockEvents = [
  {
    id: 1,
    time: "14:00",
    icon: "⚽",
    title: "Match de football d'Emma",
    location: "Stade Municipal",
    distance: "2.5 km",
    participants: [
      { name: "Sophie Martin", avatar: "S" },
      { name: "Marc Martin", avatar: "M" }
    ],
    status: "Urgent"
  },
  {
    id: 2,
    time: "16:30",
    icon: "🎨",
    title: "Cours de peinture",
    location: "Atelier Arts & Co",
    distance: "1.8 km",
    participants: [
      { name: "Emma Martin", avatar: "E" },
      { name: "Sophie Martin", avatar: "S" }
    ]
  },
  {
    id: 3,
    time: "18:00",
    icon: "🍕",
    title: "Dîner en famille",
    location: "Maison",
    participants: [
      { name: "Sophie Martin", avatar: "S" },
      { name: "Marc Martin", avatar: "M" },
      { name: "Emma Martin", avatar: "E" },
      { name: "Lucas Martin", avatar: "L" }
    ]
  }
];

export default function Agenda() {
  const [activeFilter, setActiveFilter] = useState("today");
  const [activeTab, setActiveTab] = useState("timeline");

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="agenda-page">
      <div className="page-container">
        {/* Date Header */}
        <div className="agenda-header">
          <h1 className="agenda-title">Aujourd'hui</h1>
          <p className="agenda-date">{dateStr}</p>
        </div>

        {/* Filters */}
        <div className="agenda-filters">
          <button 
            className={`filter-btn ${activeFilter === 'yesterday' ? 'active' : ''}`}
            onClick={() => setActiveFilter('yesterday')}
          >
            Hier
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            Aujourd'hui
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'tomorrow' ? 'active' : ''}`}
            onClick={() => setActiveFilter('tomorrow')}
          >
            Demain
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setActiveFilter('week')}
          >
            Semaine
          </button>
        </div>

        {/* Tabs */}
        <div className="agenda-tabs">
          <button 
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            À venir
          </button>
        </div>

        {/* Events List */}
        <div className="events-list">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

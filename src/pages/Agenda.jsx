import { useState } from "react";
import EventCard from "../components/EventCard";
import './Agenda.css';

// Mock data
const mockEvents = [
  {
    id: 1,
    time: '09:00',
    title: 'RDV médecin',
    type: 'medical',
    location: 'Cabinet Dr. Dubois',
    distance: '2.5 km',
    participants: [
      { name: 'Lou Martin', initials: 'LM' },
      { name: 'Maman Sophie', initials: 'MS' }
    ],
    duration: '45 min',
    priority: 'urgent',
    tags: []
  },
  {
    id: 2,
    time: '14:00',
    title: 'Courses au supermarché',
    type: 'shopping',
    location: 'Carrefour Centre',
    distance: '1.2 km',
    participants: [
      { name: 'Papa Marc', initials: 'PM' }
    ],
    duration: '1h',
    priority: null,
    tags: ['Courses']
  },
  {
    id: 3,
    time: '16:00',
    title: 'Match de foot de Max',
    type: 'sport',
    location: 'Stade Municipal',
    distance: '3 km',
    participants: [
      { name: 'Max Martin', initials: 'MM' },
      { name: 'Papa Marc', initials: 'PM' },
      { name: 'Lou Martin', initials: 'LM' }
    ],
    duration: '2h',
    priority: 'important',
    tags: ['Sport', 'Famille']
  }
];

export default function Agenda() {
  const [activeFilter, setActiveFilter] = useState('aujourdhui');
  const [activeTab, setActiveTab] = useState('timeline');
  const [events] = useState(mockEvents);

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

  return (
    <div className="agenda-page">
      {/* Date Header */}
      <div className="agenda-header">
        <h1 className="agenda-title">Aujourd'hui</h1>
        <p className="agenda-date">{new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        })}</p>
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
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

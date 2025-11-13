// src/pages/DiscoveriesPage.js (DESIGN AMÉLIORÉ)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DiscoveriesPage.css';

const CURRENT_LOCATION = "Rennes, France"; 

const DiscoveriesPage = ({ user, familyId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tout');
  
  const fetchActivities = useCallback(async () => {
    // Charger toutes les activités disponibles (Rennes + IDF pour l'instant)
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, description, difficulty, age_min, age_max, category')
      .order('title', { ascending: true })
      .limit(50); 

    if (error) throw error;
    return data;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allActivities = await fetchActivities();
        setActivities(allActivities);
      } catch (err) {
        console.error('Erreur lors du chargement des données de découverte:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchActivities]);

  // Filtres côté client pour le MVP
  const filteredActivities = activities.filter(activity => {
    const searchMatch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const filterMatch = activeFilter === 'Tout' || activity.category === activeFilter;
    return searchMatch && filterMatch;
  });

  const categories = ['Tout', 'Sport', 'Culture', 'Pédagogique', 'Créatif'];

  return (
    <div className="discoveries-page">
      <div className="discoveries-map-area">
        {/* PLACEHOLDER: Carte interactive */}
        <div className="map-placeholder">
          <p>🌍 Carte des activités autour de {CURRENT_LOCATION}</p>
        </div>
      </div>

      <div className="discoveries-content">
        <div className="search-controls">
          <input
            type="text"
            placeholder={`Rechercher une activité à ${CURRENT_LOCATION}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <h2 className="activity-list-title">Activités trouvées ({filteredActivities.length})</h2>

        <div className="activities-list">
          {loading ? (
            <p>Chargement des activités...</p>
          ) : filteredActivities.length === 0 ? (
            <p className="empty-results">Aucune activité ne correspond à vos critères de recherche.</p>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                    <h2 className="activity-title">{activity.title}</h2>
                    <span className={`badge difficulty-${activity.difficulty ? activity.difficulty.toLowerCase() : 'nc'}`}>
                        {activity.difficulty || 'N.C.'}
                    </span>
                </div>
                <p className="activity-description">{activity.description}</p>
                
                <div className="activity-actions">
                    <button className="suggest-btn">Proposer à mon Nest</button>
                    <button className="details-btn">Voir détails</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveriesPage;

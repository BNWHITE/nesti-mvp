// src/pages/DiscoveriesPage.js (VERSION AVEC DONNÉES DE RENNES)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DiscoveriesPage.css';

// URL de l'API Île-de-France (pour expansion future)
const ILE_DE_FRANCE_API_URL = '/api/explore/v2.1/catalog/datasets/iles_de_loisirs_idf/records?select=*&limit=20';

// Structure de données de l'API Île-de-France pour référence
/*
{
  "ile_de_loisir": "Saint Quentin en Yvelines",
  "departement": "78",
  "titre": "Canoë Kayak",
  "wgs84": { "lon": 2.02142, "lat": 48.789574 },
  "lien_activite": "..."
}
*/

const DiscoveriesPage = ({ user, familyId }) => {
  const [activitiesRennes, setActivitiesRennes] = useState([]);
  const [activitiesIdF, setActivitiesIdF] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRegion, setActiveRegion] = useState('Rennes'); // Région par défaut

  // 1. Fonction pour charger les activités de Rennes (depuis votre table Supabase)
  const fetchRennesActivities = useCallback(async () => {
    // Note: Pour un MVP, on suppose que toutes les activités dans la table sont pour Rennes.
    // Vous pourriez ajouter une colonne 'ville' si vous mixez les données.
    
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, description, difficulty, duration_min, age_min, age_max, category')
      .order('title', { ascending: true })
      .limit(30);

    if (error) throw error;
    return data;
  }, []);

  // 2. Fonction pour charger les activités d'Île-de-France (simule l'appel API)
  const fetchIdFActivities = useCallback(async () => {
    // NOTE: Ici, nous simulons l'appel API. En production, vous feriez un fetch('/proxy-vers-idf-api').
    
    // Pour l'instant, on utilise les données JSON fournies pour le mock
    const mockData = [
      { "ile_de_loisir": "Saint Quentin en Yvelines", "departement": "78", "titre": "Canoë Kayak", "lien_activite": "..." },
      { "ile_de_loisir": "Val de Seine", "departement": "78", "titre": "Ping-pong", "lien_activite": "..." },
      { "ile_de_loisir": "Cergy", "departement": "95", "titre": "Sensation", "lien_activite": "..." },
      { "ile_de_loisir": "Etampes", "departement": "91", "titre": "Glisse nautique", "lien_activite": "..." },
      { "ile_de_loisir": "Créteil", "departement": "94", "titre": "Baignade", "lien_activite": "..." },
    ];
    
    // Le code réel utiliserait un fetch:
    /*
    const response = await fetch(API_BASE_URL + ILE_DE_FRANCE_API_URL);
    const data = await response.json();
    return data.results.map(r => ({
        title: r.titre,
        description: r.ile_de_loisir + ' (' + r.departement + ')',
        lien: r.lien_activite
    }));
    */
    
    // Retourne les données mockées (vous les remplacerez par l'API)
    return mockData.map(r => ({
        title: r.titre,
        description: `Base de loisirs de ${r.ile_de_loisir} (${r.departement})`,
        lien: r.lien_activite
    }));
    
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const rennes = await fetchRennesActivities();
        setActivitiesRennes(rennes);
        
        // Simuler le chargement d'IdF
        const idf = await fetchIdFActivities();
        setActivitiesIdF(idf);

      } catch (err) {
        console.error('Erreur lors du chargement des données de découverte:', err);
        setError("Impossible de charger les données d'activités pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchRennesActivities, fetchIdFActivities]);

  // Fonction pour suggérer une activité à la famille (utilise la table 'suggestions')
  const suggestActivity = async (activityId) => {
    if (!familyId) {
      alert("Vous devez faire partie d'un Nest familial pour suggérer une activité.");
      return;
    }

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert([{
          user_id: user.id,
          activity_id: activityId,
          family_id: familyId,
          status: 'pending'
        }]);

      if (error) throw error;
      
      alert('Activité suggérée à la famille avec succès !');
      
    } catch (error) {
      alert('Erreur lors de la suggestion: ' + error.message);
    }
  };

  const currentActivities = activeRegion === 'Rennes' ? activitiesRennes : activitiesIdF;

  if (loading) return <div className="discoveries-page">Chargement des découvertes...</div>;
  if (error) return <div className="discoveries-page error-message">{error}</div>;

  return (
    <div className="discoveries-page">
      <div className="discoveries-header">
        <h1>🧭 Découvertes & Loisirs</h1>
        <p>Explorez les activités basées sur votre région et les suggestions Nesti.</p>
        
        <div className="region-selector">
          <button 
            className={`region-btn ${activeRegion === 'Rennes' ? 'active' : ''}`}
            onClick={() => setActiveRegion('Rennes')}
          >
            Activités Rennes (Loisirs A à Z)
          </button>
          <button 
            className={`region-btn ${activeRegion === 'IDF' ? 'active' : ''}`}
            onClick={() => setActiveRegion('IDF')}
          >
            Île-de-France (Bases de loisirs)
          </button>
        </div>
      </div>

      <div className="activities-list">
        {currentActivities.length === 0 ? (
          <p>Aucune activité trouvée pour cette région.</p>
        ) : (
          currentActivities.map((activity, index) => (
            <div key={activity.id || index} className="activity-card">
              <div className="activity-main">
                <h2 className="activity-title">{activity.title}</h2>
                <p className="activity-description">{activity.description}</p>
              </div>
              
              <div className="activity-meta">
                {activity.difficulty && <span className={`badge difficulty-${activity.difficulty.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>Niveau : {activity.difficulty}</span>}
                {activity.age_min && <span className="badge">Âge : {activity.age_min} - {activity.age_max || 'n.c.'} ans</span>}
                {activity.category && <span className="badge category">{activity.category}</span>}
              </div>

              {/* Afficher le bouton de suggestion uniquement si c'est une activité de la base de données */}
              {activity.id && (
                <button 
                  onClick={() => suggestActivity(activity.id)} 
                  className="suggest-btn"
                >
                  Proposer à mon Nest
                </button>
              )}
              {activity.lien && (
                 <a href={activity.lien} target="_blank" rel="noopener noreferrer" className="link-btn">
                    Voir les détails 🔗
                 </a>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DiscoveriesPage;

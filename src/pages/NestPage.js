// src/pages/NestPage.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './NestPage.css'; 

const NestPage = ({ user, familyId, familyName }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFamilyDetails = useCallback(async () => {
    if (!familyId) {
      setError("Erreur : Nest familial non défini.");
      setLoading(false);
      return;
    }

    try {
      // Récupérer tous les membres de la famille
      const { data, error } = await supabase
        .from('user_profiles') 
        .select('id, first_name, last_name')
        .eq('family_id', familyId);

      if (error) throw error;
      
      setMembers(data || []);
      setError(null);

    } catch (err) {
      console.error("Erreur chargement des membres:", err);
      setError("Impossible de charger les membres du Nest.");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchFamilyDetails();
  }, [fetchFamilyDetails]);

  if (loading) return <div className="nest-page loading">Chargement du Nest...</div>;

  return (
    <div className="nest-page">
      <div className="nest-header">
        <h1>🏡 Mon Nest : {familyName || 'Ma Famille'}</h1>
        <button className="invite-btn">📧 Inviter un membre</button>
      </div>
      
      {error && <div className="nest-error">{error}</div>}

      <section className="member-list">
        <h2>Membres du Nest</h2>
        {members.map(member => (
          <div key={member.id} className={`member-card ${member.id === user.id ? 'is-me' : ''}`}>
            <span className="member-avatar">{member.first_name ? member.first_name[0] : '?'}</span>
            <div className="member-info">
              <p className="member-name">{member.first_name} {member.last_name} {member.id === user.id && '(Moi)'}</p>
              <p className="member-role">Parent (à définir)</p>
            </div>
            {member.id !== user.id && <button className="member-action">Voir le profil</button>}
          </div>
        ))}
        {members.length === 0 && <p>Il n'y a pas encore d'autres membres dans votre Nest.</p>}
      </section>
      
      {/* Vous pouvez ajouter d'autres sections ici (enfants, règles, etc.) */}
    </div>
  );
};

export default NestPage;

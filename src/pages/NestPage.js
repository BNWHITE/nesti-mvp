// src/pages/NestPage.js (DESIGN AMÉLIORÉ)

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
      // Récupérer les membres y compris le RÔLE
      const { data, error } = await supabase
        .from('user_profiles') 
        .select('id, first_name, last_name, role') 
        .eq('family_id', familyId);

      if (error) throw error;
      
      setMembers(data || []);
      setError(null);

    } catch (err) {
      setError("Impossible de charger les membres du Nest.");
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchFamilyDetails();
  }, [fetchFamilyDetails]);

  const handleInviteMember = () => {
    const joinCode = "TRIBEXYZ"; 
    alert(`Pour inviter un membre, partagez ce code : ${joinCode}. Il devra l'utiliser sur la page d'Onboarding.`);
  };

  const handleAddMember = () => {
    alert("Fonctionnalité 'Ajouter un membre' : Formulaire pour créer un profil enfant ou adolescent sans email.");
  };

  if (loading) return <div className="nest-page loading">Chargement du Nest...</div>;

  return (
    <div className="nest-page">
      <div className="nest-header">
        <h1>🏡 Mon Nest : {familyName || 'Ma Famille'}</h1>
        <div className="nest-actions">
          <button className="action-btn secondary" onClick={handleAddMember}>+ Ajouter un membre</button>
          <button className="action-btn primary" onClick={handleInviteMember}>📧 Inviter un membre</button>
        </div>
      </div>
      
      {error && <div className="nest-error">{error}</div>}

      <section className="member-list">
        <h2>Membres du Nest</h2>
        {members.map(member => (
          <div key={member.id} className={`member-card ${member.id === user.id ? 'is-me' : ''}`}>
            <span className="member-avatar">{member.first_name ? member.first_name[0] : '?'}</span>
            <div className="member-info">
              <p className="member-name">{member.first_name} {member.last_name} {member.id === user.id && '(Moi)'}</p>
              <p className="member-role">{member.role === 'parent' ? 'Parent/Tuteur' : 'Enfant/Ado'}</p>
            </div>
            {member.id !== user.id && <button className="member-action">Gérer</button>}
          </div>
        ))}
        {members.length === 0 && <p>Il n'y a pas encore d'autres membres dans votre Nest.</p>}
      </section>
    </div>
  );
};

export default NestPage;

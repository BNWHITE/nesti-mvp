import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './NestPage.css';

export default function NestPage({ user, familyId, familyName }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFamilyMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setFamilyMembers(data);
    }
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const getRoleEmoji = (role) => {
    const emojis = {
      parent: '👨‍👩‍👧',
      teen: '👦',
      child: '👶',
      grandparent: '👴',
      adult: '🧑'
    };
    return emojis[role] || '👤';
  };

  if (loading) {
    return <div className="loading">Chargement des membres...</div>;
  }

  return (
    <div className="nest-page">
      <div className="nest-header">
        <div className="family-card">
          <div className="family-emoji">🏠</div>
          <div className="family-info">
            <h1>{familyName || 'Notre Famille'}</h1>
            <p>{familyMembers.length} membre(s) • Créée récemment</p>
          </div>
        </div>
        
        <button className="invite-btn">
          👋 Inviter un membre
        </button>
      </div>

      <div className="members-section">
        <h2>👨‍👩‍👧‍👦 Membres de la famille</h2>
        <div className="members-list">
          {familyMembers.map(member => (
            <div key={member.id} className="member-card">
              <div className="member-avatar">
                {getRoleEmoji(member.role)}
              </div>
              <div className="member-info">
                <h3>{member.first_name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-email">{member.email}</p>
              </div>
              <div className="member-actions">
                {member.id === user.id && <span className="badge-you">Vous</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="family-stats">
        <h2>📊 Statistiques du Nest</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{familyMembers.length}</span>
            <span className="stat-label">Membres</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">0</span>
            <span className="stat-label">Activités cette semaine</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">0</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

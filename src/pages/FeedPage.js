// src/pages/FeedPage.js (VERSION FINALE ET NETTOYÉE)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import './FeedPage.css';

export default function FeedPage({ user, familyId }) { 
  const [posts, setPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Utilisateur'); 

  const fetchUserData = useCallback(async () => {
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();
        
      if (profileData?.first_name) {
        setUserName(profileData.first_name);
      }
    } catch (error) {
      console.error('Error fetching profile name:', error);
    }
  }, [user.id]);

  const fetchData = useCallback(async () => {
    await fetchUserData();

    try {
      // Récupérer les 3 activités principales (Rennes)
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, difficulty')
        .order('created_at', { ascending: false })
        .limit(3); // Limité à 3 pour le feed

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Mock posts (à remplacer par family_posts plus tard)
      const mockPosts = [
        {
          id: 1,
          author: { name: userName || 'Utilisateur', role: 'parent', emoji: '👨‍👩‍👧' }, 
          content: "Bienvenue dans notre Nest familial ! 🏡 N'oubliez pas de consulter les nouvelles idées d'activités !",
          type: "welcome",
          time: "Maintenant",
          reactions: { likes: 0, hearts: 0, trophy: 0 }
        }
      ];
      setPosts(mockPosts);

    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [userName, fetchUserData]); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const suggestActivity = async (activityId) => {
    if (!familyId) {
      alert("Veuillez d'abord rejoindre un Nest familial.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('suggestions')
        .insert([{
          user_id: user.id,
          activity_id: activityId,
          family_id: familyId, // Ajout de familyId
          status: 'pending'
        }]);

      if (error) throw error;
      
      alert('Activité suggérée à la famille !');
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const quickActions = [
    { emoji: '🎂', label: 'Anniversaire', color: 'bg-warning' },
    { emoji: '🎉', label: 'Événement', color: 'bg-secondary' },
    { emoji: '🏆', label: 'Achievement', color: 'bg-success' },
    { emoji: '⚽', label: 'Activité', color: 'bg-primary' },
  ];

  if (loading) {
    return (
      <div className="feed-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Fil familial</h1>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`action-btn ${action.color}`}
            >
              <span>{action.emoji}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activités suggérées rapides du Feed */}
      <div className="activities-section">
        <h2>🔥 Suggestions rapides (Rennes)</h2>
        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card-feed">
              <h3>{activity.title}</h3>
              <span className={`difficulty-badge ${activity.difficulty}`}>
                {activity.difficulty}
              </span>
              <button 
                onClick={() => suggestActivity(activity.id)}
                className="suggest-button-feed"
              >
                Proposer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts familiaux */}
      <div className="posts-section">
        <h2>📝 Actualités familiales</h2>
        <div className="posts-container">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              {/* Rendu des posts... (inchangé) */}
               <div className="post-header">
                <div className="author-info">
                  <div className="author-avatar">{post.author.emoji}</div>
                  <div>
                    <div className="author-name">{post.author.name}</div>
                    <div className="post-meta">{post.time} • {post.author.role}</div>
                  </div>
                </div>
                <span className="post-type">{post.type === 'welcome' ? '👋' : '🎂'}</span>
              </div>
              
              <div className="post-content">
                {post.content}
              </div>

              <div className="post-reactions">
                <button className="reaction-btn">👍 {post.reactions.likes}</button>
                <button className="reaction-btn">❤️ {post.reactions.hearts}</button>
                <button className="reaction-btn">🏆 {post.reactions.trophy}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

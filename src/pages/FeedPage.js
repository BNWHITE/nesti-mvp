// src/pages/FeedPage.js (DESIGN AMÉLIORÉ)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toggleLike, getUserLikesForPosts } from '../services/likeService';
import { addComment, getComments } from '../services/commentService';
import './FeedPage.css';

// Helper pour formater le temps écoulé
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Maintenant';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR');
};

export default function FeedPage({ user, familyId }) { 
  const [posts, setPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Utilisateur');
  const [userLikes, setUserLikes] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({}); 

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
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, difficulty')
        .order('created_at', { ascending: false })
        .limit(3); 

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Charger les vrais posts depuis Supabase
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          emoji,
          likes_count,
          created_at,
          author:profiles!author_id(id, first_name, avatar_url)
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('Erreur chargement posts:', postsError);
      }

      // Transformer les posts pour l'affichage
      const formattedPosts = (postsData || []).map(post => ({
        id: post.id,
        author: {
          name: post.author?.first_name || userName || 'Utilisateur',
          role: 'parent',
          emoji: post.emoji || '👨‍👩‍👧',
          avatar_url: post.author?.avatar_url
        },
        content: post.content,
        type: 'post',
        time: formatTimeAgo(post.created_at),
        likes: 0, // Sera mis à jour par le comptage des réactions
        comments: 0
      }));

      setPosts(formattedPosts);

      // Charger les likes de l'utilisateur pour ces posts
      if (formattedPosts.length > 0 && user?.id) {
        const postIds = formattedPosts.map(p => p.id);
        const { likedPostIds } = await getUserLikesForPosts(postIds, user.id);
        setUserLikes(likedPostIds);

        // Compter les likes pour chaque post
        for (const post of formattedPosts) {
          const { count } = await supabase
            .from('post_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
            .eq('reaction_type', 'like');
          
          post.likes = count || 0;
        }
        setPosts([...formattedPosts]);
      }

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
          family_id: familyId, 
          status: 'pending'
        }]);

      if (error) throw error;
      
      alert('Activité suggérée à la famille !');
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleLike = async (postId) => {
    if (!user?.id) {
      alert('Veuillez vous connecter pour aimer ce post');
      return;
    }

    console.log('🔄 Toggle like pour post:', postId, 'user:', user.id);

    try {
      const { liked, error } = await toggleLike(postId, user.id);
      
      if (error) {
        console.error('❌ Erreur like:', error);
        alert('Erreur lors du like: ' + (error.message || error.details || 'Erreur inconnue'));
        return;
      }

      console.log('✅ Like toggle réussi:', liked ? 'liké' : 'unliké');

      // Mettre à jour l'UI
      if (liked) {
        setUserLikes(prev => new Set([...prev, postId]));
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, likes: p.likes + 1 } : p
        ));
      } else {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p
        ));
      }
    } catch (error) {
      console.error('❌ Erreur like catch:', error);
      alert('Erreur lors du like: ' + error.message);
    }
  };
  
  const handleComment = async (postId) => {
    // Toggle l'affichage des commentaires
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        // Charger les commentaires si pas encore fait
        loadComments(postId);
      }
      return newSet;
    });
  };

  const loadComments = async (postId) => {
    try {
      const { data, error } = await getComments(postId);
      if (!error && data) {
        setPostComments(prev => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    }
  };

  const handleSubmitComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) {
      alert('Veuillez écrire un commentaire');
      return;
    }
    if (!user?.id) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    console.log('🔄 Ajout commentaire:', { postId, userId: user.id, content });

    try {
      const { data, error } = await addComment(postId, user.id, content);
      
      if (error) {
        console.error('❌ Erreur ajout commentaire:', error);
        alert('Erreur: ' + (error.message || error.details || 'Erreur inconnue'));
        return;
      }

      console.log('✅ Commentaire ajouté:', data);

      // Ajouter le commentaire à la liste locale
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));

      // Mettre à jour le compteur
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      ));

      // Vider l'input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('❌ Erreur ajout commentaire catch:', error);
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

      <div className="activities-section">
        <h2>🔥 Suggestions d'Activités Rapides</h2> 
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

      <div className="posts-section">
        <h2>📝 Actualités familiales</h2>
        <div className="posts-container">
          {posts.map(post => (
            <div key={post.id} className="post-card">
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

              <div className="post-stats">
                <span>{post.likes} J'aime</span>
                <span>{post.comments} Commentaires</span>
              </div>

              <div className="post-reactions-bar">
                <button 
                  className={`reaction-btn like-btn ${userLikes.has(post.id) ? 'liked' : ''}`} 
                  onClick={() => handleLike(post.id)}
                >
                    {userLikes.has(post.id) ? '❤️' : '🤍'} J'aime
                </button>
                <button className="reaction-btn comment-btn" onClick={() => handleComment(post.id)}>
                    💬 Commenter
                </button>
              </div>

              {/* Section commentaires */}
              {expandedComments.has(post.id) && (
                <div className="comments-section">
                  <div className="comments-list">
                    {(postComments[post.id] || []).map(comment => (
                      <div key={comment.id} className="comment-item">
                        <span className="comment-author">
                          {comment.user?.first_name || 'Anonyme'}:
                        </span>
                        <span className="comment-content">{comment.content}</span>
                      </div>
                    ))}
                    {(postComments[post.id] || []).length === 0 && (
                      <p className="no-comments">Aucun commentaire. Soyez le premier !</p>
                    )}
                  </div>
                  <div className="comment-input-container">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ 
                        ...prev, 
                        [post.id]: e.target.value 
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitComment(post.id);
                        }
                      }}
                      className="comment-input"
                    />
                    <button 
                      onClick={() => handleSubmitComment(post.id)}
                      className="comment-submit-btn"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

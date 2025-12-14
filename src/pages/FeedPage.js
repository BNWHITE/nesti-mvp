// src/pages/FeedPage.js (DESIGN AMÉLIORÉ)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import MediaUploader from '../components/MediaUploader';
import CommentSection from '../components/CommentSection';
import './FeedPage.css';

export default function FeedPage({ user, familyId }) { 
  const [posts, setPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Utilisateur');
  const [newPostContent, setNewPostContent] = useState('');
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [postingMedia, setPostingMedia] = useState(false);
  const [showComments, setShowComments] = useState({}); 

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

      // Mock posts avec des compteurs de likes et commentaires
      const mockPosts = [
        {
          id: 1,
          author: { name: userName || 'Utilisateur', role: 'parent', emoji: '👨‍👩‍👧' }, 
          content: "Bienvenue dans notre Nest familial ! 🏡 N'oubliez pas de consulter les nouvelles idées d'activités !",
          type: "welcome",
          time: "Maintenant",
          likes: 5,
          comments: 2
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
          family_id: familyId, 
          status: 'pending'
        }]);

      if (error) throw error;
      
      alert('Activité suggérée à la famille !');
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleLike = (postId) => {
    // Logique de Like (Mise à jour du state et de Supabase)
    console.log(`Liking post ${postId}`);
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };
  
  const handleComment = (postId) => {
    // Toggle comment section for the post
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleShare = (postId) => {
    // Share functionality
    const post = posts.find(p => p.id === postId);
    if (post) {
      // Use Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: 'Partager le post',
          text: post.content,
          url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(post.content)
          .then(() => alert('Contenu copié dans le presse-papier !'))
          .catch(() => alert('Impossible de copier le contenu'));
      }
    }
  };

  const handleMediaUploaded = async (mediaUrls) => {
    // Create a post with media
    if (!familyId) {
      alert("Veuillez d'abord rejoindre un Nest familial.");
      return;
    }

    setPostingMedia(true);
    try {
      // Here you would save the post with media to the database
      // For now, we'll add it to the mock posts
      const newPost = {
        id: Date.now(),
        author: { name: userName, role: 'parent', emoji: '👨‍👩‍👧' },
        content: newPostContent || 'Nouveau post avec média',
        type: 'media',
        time: 'À l\'instant',
        likes: 0,
        comments: 0,
        media: mediaUrls
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowMediaUploader(false);
      alert('Post avec média publié !');
    } catch (error) {
      console.error('Error posting media:', error);
      alert('Erreur lors de la publication');
    } finally {
      setPostingMedia(false);
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

      {/* Media Upload Section */}
      <div className="post-creation-section">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Quoi de neuf dans votre Nest ?"
          className="post-input"
          rows="3"
        />
        <div className="post-actions">
          <button 
            onClick={() => setShowMediaUploader(!showMediaUploader)}
            className="media-btn"
          >
            📷 Photo/Vidéo
          </button>
        </div>
        {showMediaUploader && (
          <MediaUploader
            userId={user.id}
            onMediaUploaded={handleMediaUploaded}
            maxPhotos={5}
          />
        )}
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

              {/* Display media if present */}
              {post.media && (
                <div className="post-media">
                  {post.media.photos && post.media.photos.length > 0 && (
                    <div className="post-photos">
                      {post.media.photos.map((photoUrl, idx) => (
                        <img key={idx} src={photoUrl} alt={`Photo ${idx + 1}`} />
                      ))}
                    </div>
                  )}
                  {post.media.video && (
                    <video src={post.media.video} controls />
                  )}
                </div>
              )}

              <div className="post-stats">
                <span>{post.likes} J'aime</span>
                <span>{post.comments} Commentaires</span>
              </div>

              <div className="post-reactions-bar">
                <button className="reaction-btn like-btn" onClick={() => handleLike(post.id)}>
                    ❤️ J'aime
                </button>
                <button className="reaction-btn comment-btn" onClick={() => handleComment(post.id)}>
                    💬 Commenter
                </button>
                <button className="reaction-btn share-btn" onClick={() => handleShare(post.id)}>
                    🔗 Partager
                </button>
              </div>

              {/* Comment Section */}
              {showComments[post.id] && (
                <CommentSection 
                  postId={post.id} 
                  userId={user.id}
                  onCommentAdded={() => {
                    // Update comment count
                    setPosts(posts.map(p => 
                      p.id === post.id ? { ...p, comments: p.comments + 1 } : p
                    ));
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

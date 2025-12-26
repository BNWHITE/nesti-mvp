// src/pages/FeedPage.js - REFONTE UI INSTAGRAM-LIKE

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toggleLike, getUserLikesForPosts } from '../services/likeService';
import { addComment, getComments, likeComment, unlikeComment } from '../services/commentService';
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

// Composant VideoPlayer avec autoplay comme Instagram
const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Intersection Observer pour autoplay quand visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div ref={containerRef} className="video-container" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        muted={isMuted}
        playsInline
        className="post-video"
      />
      {!isPlaying && (
        <div className="video-play-overlay">
          <span className="play-icon">▶️</span>
        </div>
      )}
      <button className="video-mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

// Composant CommentItem avec réponses et likes
const CommentItem = ({ comment, user, userName, onReply, onLikeComment, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(comment.user_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);

  const handleLikeComment = async () => {
    if (!user?.id) return;
    
    try {
      if (isLiked) {
        await unlikeComment(comment.id, user.id);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await likeComment(comment.id, user.id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Erreur like commentaire:', error);
    }
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent.trim());
    setReplyContent('');
    setShowReplyInput(false);
  };

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`}>
      <div className="comment-header">
        <span className="comment-author">{comment.userName || comment.user?.first_name || 'Anonyme'}</span>
        <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
      </div>
      <p className="comment-content">{comment.content}</p>
      <div className="comment-actions">
        <button 
          className={`comment-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeComment}
        >
          {isLiked ? '❤️' : '🤍'} {likesCount > 0 && likesCount}
        </button>
        {depth === 0 && (
          <button 
            className="comment-action-btn"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            💬 Répondre
          </button>
        )}
      </div>
      
      {showReplyInput && (
        <div className="reply-input-container">
          <input
            type="text"
            placeholder={`Répondre à ${comment.userName || 'ce commentaire'}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply()}
            className="reply-input"
          />
          <button onClick={handleSubmitReply} className="reply-submit-btn">
            ➤
          </button>
        </div>
      )}
      
      {/* Afficher les réponses (1 niveau seulement) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              user={user}
              userName={userName}
              onReply={onReply}
              onLikeComment={onLikeComment}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [likeAnimations, setLikeAnimations] = useState({}); 

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

      // Charger les vrais posts depuis Supabase (sans JOIN problématique)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, content, emoji, created_at, author_id')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('Erreur chargement posts:', postsError);
      }

      // Transformer les posts pour l'affichage
      const formattedPosts = (postsData || []).map(post => ({
        id: post.id,
        author_id: post.author_id,
        author: {
          name: userName || 'Utilisateur',
          role: 'parent',
          emoji: post.emoji || '👨‍👩‍👧',
          avatar_url: null
        },
        content: post.content,
        type: 'post',
        time: formatTimeAgo(post.created_at),
        likes: 0,
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

  const handleLike = async (postId, authorId) => {
    if (!user?.id) {
      alert('Veuillez vous connecter pour aimer ce post');
      return;
    }

    // Animation de like (cœur qui apparaît)
    setLikeAnimations(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setLikeAnimations(prev => ({ ...prev, [postId]: false }));
    }, 600);

    try {
      const { liked, error } = await toggleLike(postId, user.id, authorId);
      
      if (error) {
        console.error('Erreur like:', error);
        return;
      }

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
      console.error('Erreur like:', error);
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

  const handleSubmitComment = async (postId, parentId = null, directContent = null) => {
    const inputKey = parentId ? `${postId}-${parentId}` : postId;
    const content = directContent || commentInputs[inputKey]?.trim();
    if (!content) return;
    if (!user?.id) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    // Trouver l'auteur du post pour la notification
    const post = posts.find(p => p.id === postId);
    const authorId = post?.author_id;

    try {
      const { data, error } = await addComment(postId, user.id, content, userName, parentId, authorId);
      
      if (error) {
        console.error('Erreur ajout commentaire:', error);
        return;
      }

      // Ajouter le commentaire à la liste locale
      const commentWithUser = {
        ...data,
        userName: userName,
        replies: []
      };
      
      setPostComments(prev => {
        const currentComments = prev[postId] || [];
        
        if (parentId) {
          // C'est une réponse - l'ajouter au commentaire parent
          return {
            ...prev,
            [postId]: currentComments.map(c => 
              c.id === parentId 
                ? { ...c, replies: [...(c.replies || []), commentWithUser] }
                : c
            )
          };
        } else {
          // C'est un commentaire principal
          return {
            ...prev,
            [postId]: [...currentComments, commentWithUser]
          };
        }
      });

      // Mettre à jour le compteur
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      ));

      // Vider l'input
      setCommentInputs(prev => ({ ...prev, [inputKey]: '' }));
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
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
                    <div className="post-meta">{post.time}</div>
                  </div>
                </div>
              </div>
              
              {/* Contenu texte */}
              <div className="post-content">
                {post.content}
              </div>

              {/* Vidéo si présente */}
              {post.video_url && (
                <VideoPlayer src={post.video_url} poster={post.thumbnail_url} />
              )}

              {/* Image si présente */}
              {post.image_url && (
                <div className="post-image-container">
                  <img 
                    src={post.image_url} 
                    alt="Contenu du post" 
                    className="post-image"
                    onDoubleClick={() => handleLike(post.id, post.author_id)}
                  />
                  {likeAnimations[post.id] && (
                    <div className="like-animation">❤️</div>
                  )}
                </div>
              )}

              {/* Barre d'actions simplifiée */}
              <div className="post-actions-bar">
                <button 
                  className={`action-btn ${userLikes.has(post.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id, post.author_id)}
                >
                  {userLikes.has(post.id) ? '❤️' : '🤍'}
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleComment(post.id)}
                >
                  💬
                </button>
                <button className="action-btn">
                  🔗
                </button>
              </div>

              {/* Compteur de likes */}
              {post.likes > 0 && (
                <div className="likes-count">
                  {post.likes} J'aime{post.likes > 1 ? 's' : ''}
                </div>
              )}

              {/* Section commentaires */}
              {expandedComments.has(post.id) && (
                <div className="comments-section">
                  <div className="comments-list">
                    {(postComments[post.id] || []).map(comment => (
                      <CommentItem 
                        key={comment.id}
                        comment={comment}
                        user={user}
                        userName={userName}
                        onReply={(parentId, content) => {
                          handleSubmitComment(post.id, parentId, content);
                        }}
                        onLikeComment={() => {}}
                      />
                    ))}
                    {(postComments[post.id] || []).length === 0 && (
                      <p className="no-comments">Aucun commentaire encore.</p>
                    )}
                  </div>
                  <div className="comment-input-container">
                    <input
                      type="text"
                      placeholder="Ajouter un commentaire..."
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
                      ➤
                    </button>
                  </div>
                </div>
              )}

              {/* Lien pour voir les commentaires */}
              {!expandedComments.has(post.id) && post.comments > 0 && (
                <button 
                  className="view-comments-btn"
                  onClick={() => handleComment(post.id)}
                >
                  Voir les {post.comments} commentaire{post.comments > 1 ? 's' : ''}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

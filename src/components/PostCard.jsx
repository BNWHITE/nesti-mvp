import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleLike, getLikeCount } from '../services/likeService';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';
import VideoPlayer from './VideoPlayer';
import './PostCard.css';

export default function PostCard({ post, userLikes, onLikeUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLikeCount = useCallback(async () => {
    try {
      const count = await getLikeCount(post.id);
      setLikes(count);
    } catch (error) {
      console.error('Error loading like count:', error);
    }
  }, [post.id]);

  useEffect(() => {
    // Initialize like state based on userLikes prop
    if (userLikes) {
      setLiked(userLikes.has(post.id));
    }
    // Load current like count
    loadLikeCount();
  }, [post.id, userLikes, loadLikeCount]);

  const handleLike = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      const result = await toggleLike(post.id);
      
      if (result.success) {
        setLiked(result.liked);
        setLikes(result.likeCount);
        
        // Notify parent to refresh data
        if (onLikeUpdate) {
          onLikeUpdate();
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPostIcon = (type) => {
    const icons = {
      celebration: '🎉',
      photo: '📸',
      milestone: '🎯',
      memory: '💭',
      activity: '⚽',
      food: '🍽️',
      default: '✨'
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            {post.authorInitials || post.author?.charAt(0) || 'U'}
          </div>
          <div className="post-author-info">
            <div className="post-author-name">{post.author || 'Utilisateur'}</div>
            <div className="post-timestamp">{post.timestamp || 'Il y a quelques instants'}</div>
          </div>
        </div>
        <div className="post-type-icon">
          {getPostIcon(post.type)}
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.emoji && <div className="post-emoji">{post.emoji}</div>}
        <p className="post-text">{post.content}</p>
        {post.image && post.type === 'photo' && (
          <div className="post-image-container">
            <img src={post.image} alt="Post" className="post-image" />
          </div>
        )}
        {post.image && post.type === 'video' && (
          <VideoPlayer src={post.image} autoplay={true} />
        )}
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        <span className="post-stat">
          👍 {likes} J'aime
        </span>
        <span className="post-stat">
          ❤️ {post.reactions || 0} Réactions
        </span>
        <span className="post-stat">
          🎉 {post.celebrations || 0}
        </span>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <button 
          className={`post-action-btn ${liked ? 'active' : ''} ${loading ? 'loading' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          {loading ? (
            <div className="loading-spinner action-icon" />
          ) : liked ? (
            <HeartIconSolid className="action-icon" />
          ) : (
            <HeartIcon className="action-icon" />
          )}
          <span>{loading ? 'Chargement...' : 'J\'aime'}</span>
        </button>
        <button 
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <ChatBubbleLeftIcon className="action-icon" />
          <span>Commenter</span>
        </button>
        <button 
          className="post-action-btn"
          onClick={() => setShowShareModal(true)}
        >
          <ShareIcon className="action-icon" />
          <span>Partager</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          post={post}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Comments Section */}
      {showComments && user && (
        <CommentSection 
          postId={post.id}
          currentUserId={user.id}
          currentUserName={post.author || 'Utilisateur'}
          currentUserAvatar={null}
        />
      )}

      {/* Old Comments Display (kept for backward compatibility) */}
      {post.comments && post.comments.length > 0 && (
        <div className="post-comments">
          {post.comments.map((comment, index) => (
            <div key={index} className="post-comment">
              <div className="comment-avatar">{comment.authorInitials || 'U'}</div>
              <div className="comment-content">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';
import './PostCard.css';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
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
          <div className="post-image-container">
            <video src={post.image} controls className="post-image" />
          </div>
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
          className={`post-action-btn ${liked ? 'active' : ''}`}
          onClick={handleLike}
        >
          {liked ? <HeartIconSolid className="action-icon" /> : <HeartIcon className="action-icon" />}
          <span>J'aime</span>
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

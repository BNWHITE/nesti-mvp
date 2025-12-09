import React, { useState } from 'react';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import './PostCard.css';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const getTypeIcon = (type) => {
    const icons = {
      memory: '📸',
      achievement: '🏆',
      question: '❓',
      info: 'ℹ️',
      celebration: '🎉',
      update: '📢'
    };
    return icons[type] || '📝';
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques minutes';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return postDate.toLocaleDateString('fr-FR');
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="avatar avatar-sm">
            {post.author.avatar || post.author.name[0]}
          </div>
          <div className="post-author-info">
            <span className="post-author-name">{post.author.name}</span>
            <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
          </div>
        </div>
        <span className="post-type-icon">{getTypeIcon(post.type)}</span>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.emoji && <span className="post-emoji">{post.emoji}</span>}
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-stats">
        <span className="stat-item">
          👍 {post.reactions?.thumbsup || 0} J'aime
        </span>
        <span className="stat-item">
          ❤️ {post.reactions?.heart || 0} Réactions
        </span>
        <span className="stat-item">
          🎉 {post.reactions?.celebration || 0} Autres
        </span>
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${liked ? 'active' : ''}`}
          onClick={handleLike}
        >
          {liked ? <HeartSolidIcon className="icon-md" /> : <HeartIcon className="icon-md" />}
          <span>J'aime</span>
        </button>
        <button 
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <ChatBubbleLeftIcon className="icon-md" />
          <span>Commenter</span>
        </button>
        <button className="action-btn">
          <ShareIcon className="icon-md" />
          <span>Partager</span>
        </button>
      </div>

      {showComments && post.comments && post.comments.length > 0 && (
        <div className="post-comments">
          {post.comments.map((comment, index) => (
            <div key={index} className="comment">
              <div className="avatar avatar-sm">
                {comment.author[0]}
              </div>
              <div className="comment-content">
                <span className="comment-author">{comment.author}</span>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

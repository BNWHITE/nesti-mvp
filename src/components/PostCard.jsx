import React from 'react';
import './PostCard.css';

const PostCard = ({ post }) => {
  const {
    author = 'Sophie Martin',
    avatar = 'S',
    timestamp = 'Il y a 2h',
    type = '📅',
    content = 'Qui est partant pour un pique-nique ce week-end ? 🌳',
    emoji = '🎉',
    likes = 5,
    reactions = 3,
    other = 1,
    comments = []
  } = post;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <div className="avatar avatar-sm">{avatar}</div>
          <div>
            <div className="post-author-name">{author}</div>
            <div className="post-timestamp">{timestamp}</div>
          </div>
        </div>
        <div className="post-type-icon">{type}</div>
      </div>

      <div className="post-content">
        {content} {emoji}
      </div>

      <div className="post-stats">
        <span className="stat-item">👍 {likes} J'aime</span>
        <span className="stat-divider">|</span>
        <span className="stat-item">❤️ {reactions} Réactions</span>
        <span className="stat-divider">|</span>
        <span className="stat-item">🎉 {other} Autres</span>
      </div>

      <div className="post-actions">
        <button className="post-action-btn">
          <span>👍</span> J'aime
        </button>
        <button className="post-action-btn">
          <span>💬</span> Commenter
        </button>
        <button className="post-action-btn">
          <span>📤</span> Partager
        </button>
      </div>

      {comments && comments.length > 0 && (
        <div className="post-comments">
          {comments.map((comment, idx) => (
            <div key={idx} className="comment">
              <div className="avatar avatar-sm">{comment.avatar || 'U'}</div>
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
};

export default PostCard;

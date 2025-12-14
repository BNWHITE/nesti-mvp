import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../services/commentService';
import './CommentSection.css';

function CommentSection({ postId, currentUserId, currentUserName, currentUserAvatar }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await getComments(postId);
    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const { data, error } = await addComment(postId, currentUserId, newComment.trim());
    
    if (!error && data) {
      setComments([...comments, data]);
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    const { success } = await deleteComment(commentId, currentUserId);
    if (success) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const formatTimestamp = (timestamp) => {
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

  const getInitials = (firstName, lastName) => {
    if (!firstName) return '?';
    const firstInitial = firstName[0] || '';
    const lastInitial = lastName ? lastName[0] : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getFullName = (user) => {
    if (!user) return 'Utilisateur';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.email || 'Utilisateur';
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <span className="comment-count">
          {comments.length} {comments.length === 1 ? 'commentaire' : 'commentaires'}
        </span>
      </div>

      {loading ? (
        <div className="comment-loading">Chargement des commentaires...</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.user?.avatar_url ? (
                  <img src={comment.user.avatar_url} alt={getFullName(comment.user)} />
                ) : (
                  <div className="comment-avatar-placeholder">
                    {getInitials(comment.user?.first_name, comment.user?.last_name)}
                  </div>
                )}
              </div>
              <div className="comment-content">
                <div className="comment-meta">
                  <span className="comment-author">{getFullName(comment.user)}</span>
                  <span className="comment-time">{formatTimestamp(comment.created_at)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
                {comment.user_id === currentUserId && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Supprimer le commentaire"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-wrapper">
          <div className="comment-user-avatar">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt={currentUserName} />
            ) : (
              <div className="comment-avatar-placeholder">
                {getInitials(currentUserName, '')}
              </div>
            )}
          </div>
          <input
            type="text"
            className="comment-input"
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? '⏳' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentSection;

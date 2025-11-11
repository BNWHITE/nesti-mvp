import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './CreatePost.css';

export default function CreatePost({ user, familyId, onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('message');
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { type: 'message', emoji: '💬', label: 'Message', color: '#6AADBA' },
    { type: 'anniversary', emoji: '🎂', label: 'Anniversaire', color: '#E8B558' },
    { type: 'event', emoji: '🎉', label: 'Événement', color: '#E87461' },
    { type: 'achievement', emoji: '🏆', label: 'Réussite', color: '#4A8B7A' },
    { type: 'activity', emoji: '⚽', label: 'Activité', color: '#2D5F5D' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_posts')
        .insert([{
          family_id: familyId,
          author_id: user.id,
          content: content.trim(),
          post_type: postType,
          emoji: postTypes.find(p => p.type === postType)?.emoji
        }]);

      if (error) throw error;

      setContent('');
      setIsOpen(false);
      onPostCreated();
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="floating-create-btn"
        onClick={() => setIsOpen(true)}
      >
        <span>+</span>
      </button>
    );
  }

  return (
    <div className="create-post-overlay">
      <div className="create-post-modal">
        <div className="modal-header">
          <h3>Créer un post</h3>
          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="post-type-selector">
            {postTypes.map(({ type, emoji, label, color }) => (
              <button
                key={type}
                type="button"
                className={`type-btn ${postType === type ? 'active' : ''}`}
                onClick={() => setPostType(type)}
                style={{ borderColor: postType === type ? color : 'transparent' }}
              >
                <span className="type-emoji">{emoji}</span>
                <span className="type-label">{label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Partagez quelque chose avec votre famille...`}
            className="post-textarea"
            rows="4"
            maxLength="500"
          />

          <div className="form-actions">
            <div className="char-count">{content.length}/500</div>
            <div className="action-buttons">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="cancel-btn"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={!content.trim() || loading}
                className="submit-btn"
              >
                {loading ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

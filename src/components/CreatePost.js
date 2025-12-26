// src/components/CreatePost.js

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './CreatePost.css';
import logger from '../lib/logger';

const CreatePost = ({ user, familyId, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  const emojis = ['🏡', '🎉', '🎂', '⚽', '🏆', '❤️', '📸', '🎵'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '' || !familyId) return;

    setIsPosting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            author_id: user.id,
            family_id: familyId,
            content: content.trim(),
            emoji: emoji || '🏡',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      logger.log('Post créé:', data?.id);
      setContent('');
      setEmoji('');
      
      if (onPostCreated) {
        onPostCreated(data);
      }
    } catch (err) {
      logger.error('Erreur création post:', err);
      setError('Impossible de publier. Réessayez.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      {error && <div className="post-error">{error}</div>}
      
      <div className="emoji-picker">
        {emojis.map((e) => (
          <button
            key={e}
            type="button"
            className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
            onClick={() => setEmoji(e)}
          >
            {e}
          </button>
        ))}
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf dans votre Nest ? 🏡"
        disabled={isPosting}
        maxLength={500}
      />
      
      <div className="post-footer">
        <span className="char-count">{content.length}/500</span>
        <button type="submit" disabled={isPosting || content.trim() === '' || !familyId}>
          {isPosting ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;

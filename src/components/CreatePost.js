// src/components/CreatePost.js

import { useState } from 'react';
import './CreatePost.css';
import logger from '../lib/logger';

const CreatePost = ({ user, familyId, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() === '') return;

    // Simuler l'envoi à Supabase (table family_posts)
    setIsPosting(true);
    setTimeout(() => {
      logger.log('Post sent:', content);
      setContent('');
      setIsPosting(false);
      onPostCreated();
      alert('Post publié !');
    }, 1000); 
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf dans votre Nest ?"
        disabled={isPosting}
      />
      <button type="submit" disabled={isPosting || content.trim() === ''}>
        {isPosting ? 'Publication...' : 'Publier'}
      </button>
    </form>
  );
};

export default CreatePost;

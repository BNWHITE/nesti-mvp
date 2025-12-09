import { useState } from "react";
import { PlusIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import PostCard from "../components/PostCard";
import './Home.css';

// Mock data for development
const mockPosts = [
  {
    id: 1,
    author: 'Papa Marc',
    authorInitials: 'PM',
    timestamp: 'Il y a 2 heures',
    type: 'celebration',
    emoji: '🎉',
    content: 'Lou a réussi son contrôle de maths avec 18/20 ! Tellement fier de toi ma chérie !',
    likes: 12,
    reactions: 8,
    celebrations: 5,
    comments: [
      { author: 'Maman Sophie', authorInitials: 'MS', text: 'Bravo ma puce ! 🎊' },
      { author: 'Mamie Claire', authorInitials: 'MC', text: 'Félicitations Lou ! 💝' }
    ]
  },
  {
    id: 2,
    author: 'Maman Sophie',
    authorInitials: 'MS',
    timestamp: 'Il y a 5 heures',
    type: 'activity',
    emoji: '⚽',
    content: 'Match de foot de Max aujourd\'hui ! On est tous là pour le supporter 💪',
    likes: 15,
    reactions: 10,
    celebrations: 7,
    comments: []
  },
  {
    id: 3,
    author: 'Lou Martin',
    authorInitials: 'LM',
    timestamp: 'Hier à 18:30',
    type: 'photo',
    emoji: '📸',
    content: 'Sortie en famille au parc aujourd\'hui ! ☀️ Trop cool !',
    likes: 20,
    reactions: 12,
    celebrations: 8,
    comments: [
      { author: 'Papa Marc', authorInitials: 'PM', text: 'Super moment ! ❤️' }
    ]
  }
];

export default function Home() {
  const [posts] = useState(mockPosts);
  const [postContent, setPostContent] = useState('');

  const handleCreatePost = () => {
    if (postContent.trim()) {
      // TODO: Add post creation logic
      setPostContent('');
    }
  };

  return (
    <div className="home-page">
      {/* Create Post Section */}
      <div className="create-post-section">
        <div className="create-post-card">
          <div className="create-post-header">
            <div className="create-post-avatar">M</div>
            <input 
              type="text"
              className="create-post-input"
              placeholder="Partagez un moment..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>
          <div className="create-post-actions">
            <button className="create-post-btn" title="Ajouter une photo">
              <PhotoIcon className="create-icon" />
            </button>
            <button className="create-post-btn" title="Ajouter un emoji">
              <FaceSmileIcon className="create-icon" />
            </button>
            <button 
              className="create-post-submit"
              onClick={handleCreatePost}
              title="Publier"
            >
              <PlusIcon className="plus-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

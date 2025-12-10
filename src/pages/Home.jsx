import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { familyService } from '../services/familyService';
import { messageService } from '../services/messageService';
import PostCard from "../components/PostCard";
import WelcomeTips from "../components/WelcomeTips";
import './Home.css';

// Empty initial state for new accounts
const mockPosts = [];

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(mockPosts); // Keep mock posts as fallback
  const [postContent, setPostContent] = useState('');
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    // Check if tips have been shown before
    const tipsShown = localStorage.getItem('nesti_tips_shown');
    if (!tipsShown) {
      setShowTips(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user profile
      const { data: profile } = await familyService.getCurrentUserProfile();
      setUserProfile(profile);

      // Get user's family
      const { data: familyData } = await familyService.getUserFamily();
      setFamily(familyData);

      // Load messages if family exists
      if (familyData) {
        const { data: messagesData } = await messageService.getFamilyMessages(familyData.id);
        if (messagesData) {
          // Transform messages to post format for display
          const transformedPosts = messagesData.map(msg => ({
            id: msg.id,
            author: msg.sender?.first_name || 'Membre',
            authorInitials: msg.sender?.first_name?.substring(0, 2).toUpperCase() || 'MM',
            timestamp: formatTimestamp(msg.created_at),
            type: msg.message_type,
            content: msg.message_text,
            likes: 0,
            reactions: 0,
            celebrations: 0,
            comments: []
          }));
          if (transformedPosts.length > 0) {
            setPosts(transformedPosts); // Replace mock with real data
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a quelques instants';
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleCreatePost = async () => {
    if (postContent.trim() && family) {
      try {
        const { data, error } = await messageService.sendMessage(
          family.id,
          postContent,
          'text'
        );

        if (!error && data) {
          // Add new post to feed
          const newPost = {
            id: data.id,
            author: userProfile?.first_name || 'Vous',
            authorInitials: userProfile?.first_name?.substring(0, 2).toUpperCase() || 'ME',
            timestamp: 'Il y a quelques instants',
            type: 'text',
            content: postContent,
            likes: 0,
            reactions: 0,
            celebrations: 0,
            comments: []
          };
          setPosts([newPost, ...posts]);
          setPostContent('');
        }
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Erreur lors de la publication');
      }
    }
  };

  const getUserInitials = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'ME';
  };

  return (
    <div className="home-page">
      {showTips && <WelcomeTips onClose={() => setShowTips(false)} />}
      
      {/* Create Post Section */}
      <div className="create-post-section">
        <div className="create-post-card">
          <div className="create-post-header">
            <div className="create-post-avatar">{getUserInitials()}</div>
            <input 
              type="text"
              className="create-post-input"
              placeholder="Partagez un moment..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePost()}
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
              disabled={!postContent.trim()}
            >
              <PlusIcon className="plus-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {loading ? (
          <div className="loading-message">Chargement...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="empty-feed">
            <p>Aucun message pour le moment.</p>
            <p>Partagez le premier moment de votre famille ! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

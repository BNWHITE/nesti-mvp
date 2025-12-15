import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, FaceSmileIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { familyService } from '../services/familyService';
import { messageService } from '../services/messageService';
import { uploadPhoto, uploadVideo } from '../services/mediaService';
import PostCard from "../components/PostCard";
import WelcomeTips from "../components/WelcomeTips";
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]); // Start with empty array - no mock data
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
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
        if (messagesData && messagesData.length > 0) {
          // Transform messages to post format for display
          const transformedPosts = messagesData.map(msg => ({
            id: msg.id,
            author: msg.sender?.first_name || 'Membre',
            authorInitials: msg.sender?.first_name?.substring(0, 2).toUpperCase() || 'MM',
            timestamp: formatTimestamp(msg.created_at),
            type: msg.message_type,
            content: msg.message_text,
            image: msg.media_url,
            likes: 0,
            reactions: 0,
            celebrations: 0,
            comments: []
          }));
          setPosts(transformedPosts);
        } else {
          // No messages - keep empty
          setPosts([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPosts([]); // Ensure posts is empty on error
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
    if ((postContent.trim() || selectedImage || selectedVideo) && family) {
      try {
        setUploading(true);
        let mediaUrl = null;
        let mediaType = 'text';

        // Upload image if selected
        if (selectedImage) {
          const { url, error } = await uploadPhoto(selectedImage, user.id);
          if (error) {
            alert('Erreur lors de l\'upload de l\'image: ' + error.message);
            setUploading(false);
            return;
          }
          mediaUrl = url;
          mediaType = 'photo';
        }
        
        // Upload video if selected
        if (selectedVideo) {
          const { url, error } = await uploadVideo(selectedVideo, user.id);
          if (error) {
            alert('Erreur lors de l\'upload de la vidéo: ' + error.message);
            setUploading(false);
            return;
          }
          mediaUrl = url;
          // Note: Using 'photo' type for videos due to current schema limitations
          // The posts table doesn't have a 'video' type yet. Consider adding it in a future migration.
          mediaType = 'photo';
        }
        
        const { data, error } = await messageService.sendMessage(
          family.id,
          postContent || (mediaUrl ? 'A partagé un média' : ''),
          mediaType,
          mediaUrl
        );

        if (!error && data) {
          // Add new post to feed
          const newPost = {
            id: data.id,
            author: userProfile?.first_name || 'Vous',
            authorInitials: userProfile?.first_name?.substring(0, 2).toUpperCase() || 'ME',
            timestamp: 'Il y a quelques instants',
            type: mediaType,
            content: postContent,
            image: mediaUrl || imagePreview,
            likes: 0,
            reactions: 0,
            celebrations: 0,
            comments: []
          };
          setPosts([newPost, ...posts]);
          setPostContent('');
          setSelectedImage(null);
          setSelectedVideo(null);
          setImagePreview(null);
          setVideoPreview(null);
        }
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Erreur lors de la publication');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setSelectedVideo(null); // Clear video if image selected
      setVideoPreview(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      setSelectedImage(null); // Clear image if video selected
      setImagePreview(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
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
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button onClick={removeImage} className="remove-image-btn">×</button>
            </div>
          )}
          
          {/* Video Preview */}
          {videoPreview && (
            <div className="image-preview-container">
              <video src={videoPreview} controls className="image-preview" />
              <button onClick={removeVideo} className="remove-image-btn">×</button>
            </div>
          )}
          
          <div className="create-post-actions">
            <label className="create-post-btn" title="Ajouter une photo">
              <PhotoIcon className="create-icon" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            <label className="create-post-btn" title="Ajouter une vidéo">
              <VideoCameraIcon className="create-icon" />
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideoSelect}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            <button className="create-post-btn" title="Ajouter un emoji">
              <FaceSmileIcon className="create-icon" />
            </button>
            <button 
              className="create-post-submit"
              onClick={handleCreatePost}
              title="Publier"
              disabled={(!postContent.trim() && !selectedImage && !selectedVideo) || uploading}
            >
              {uploading ? '...' : <PlusIcon className="plus-icon" />}
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

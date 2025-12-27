import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, FaceSmileIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getUserLikesForPosts } from '../services/likeService';
import { uploadPhoto, uploadVideo } from '../services/mediaService';
import PostCard from "../components/PostCard";
import WelcomeTips from "../components/WelcomeTips";
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
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
  const [userLikes, setUserLikes] = useState(new Set());

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

      // Get user profile - user_profiles.id corresponds to user.id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else {
        setUserProfile(profile);
      }

      // Get user's family - first get user from users table to find family_id
      console.log('Loading data for user:', user.id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('family_id')
        .eq('id', user.id)
        .single();

      console.log('User data:', userData, 'Error:', userError);
      if (userError) {
        console.error('Error loading user data:', userError);
        setFamily(null);
        setPosts([]);
        return;
      }

      if (!userData?.family_id) {
        console.log('User has no family - checking user_profiles...');
        setFamily(null);
        setPosts([]);
        return;
      }

      // Now get the family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', userData.family_id)
        .single();

      if (familyError) {
        console.error('Error loading family:', familyError);
        setFamily(null);
        setPosts([]);
        return;
      }

      setFamily(familyData);

      // Load posts from the posts table
      // Utiliser un join LEFT pour ne pas perdre les posts sans profil
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('family_id', familyData.id)
        .order('created_at', { ascending: false });

      console.log('Posts loaded:', postsData?.length, 'posts for family', familyData.id);
      if (postsError) {
        console.error('Error loading posts:', postsError);
        setPosts([]);
      } else {
        // Transform posts to the expected format
        // La table posts utilise has_photo, has_video, image_url, video_url
        const transformedPosts = (postsData || []).map(post => ({
          id: post.id,
          author: post.user_profiles?.first_name || 'Membre',
          authorInitials: (post.user_profiles?.first_name?.substring(0, 2) || 'MM').toUpperCase(),
          timestamp: formatTimestamp(post.created_at),
          type: post.has_video ? 'video' : post.has_photo ? 'photo' : 'text',
          content: post.content,
          image: post.image_url || null,
          video_url: post.video_url || null,
          likes: post.likes_count || 0,
          reactions: 0,
          celebrations: 0,
          comments: []
        }));
        setPosts(transformedPosts);

        // Load likes for these posts
        if (transformedPosts.length > 0) {
          const postIds = transformedPosts.map(p => p.id);
          const userLikesData = await getUserLikesForPosts(postIds);
          setUserLikes(new Set(userLikesData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPosts([]);
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
          mediaType = 'video';
        }
        
        // La table posts utilise has_photo, has_video, image_url, video_url
        // content est NOT NULL, donc mettre une chaîne vide si pas de texte
        const postData = {
          family_id: family.id,
          author_id: user.id,
          user_id: user.id,
          content: postContent.trim() || '',
          has_photo: mediaType === 'photo',
          has_video: mediaType === 'video',
          image_url: mediaType === 'photo' ? mediaUrl : null,
          video_url: mediaType === 'video' ? mediaUrl : null,
          media_count: mediaUrl ? 1 : 0
        };
        
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select(`
            *,
            user_profiles!posts_author_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .single();

        if (error) {
          console.error('Error creating post:', error);
          alert('Erreur lors de la publication: ' + error.message);
          setUploading(false);
          return;
        }

        if (data) {
          // Add new post to feed
          // Utiliser has_video/has_photo et image_url/video_url
          const newPost = {
            id: data.id,
            author: data.user_profiles?.first_name || 'Vous',
            authorInitials: (data.user_profiles?.first_name?.substring(0, 2) || 'ME').toUpperCase(),
            timestamp: 'Il y a quelques instants',
            type: data.has_video ? 'video' : data.has_photo ? 'photo' : 'text',
            content: data.content,
            image: data.image_url || null,
            video_url: data.video_url || null,
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
            <PostCard 
              key={post.id} 
              post={post} 
              userLikes={userLikes}
              onLikeUpdate={loadData}
            />
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

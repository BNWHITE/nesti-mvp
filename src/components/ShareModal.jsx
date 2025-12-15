import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { shareService } from '../services/shareService';
import { familyService } from '../services/familyService';
import './ShareModal.css';

export default function ShareModal({ post, onClose }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      
      // Get user's family
      const { data: familyData } = await familyService.getUserFamily();
      
      if (familyData) {
        // Get family members
        const { data: members } = await shareService.getFamilyMembers(familyData.id);
        setFamilyMembers(members || []);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedMember) {
      alert('Veuillez sélectionner un membre de la famille');
      return;
    }

    try {
      setSharing(true);
      const { error } = await shareService.shareWithMember(
        post.id,
        selectedMember,
        message || null
      );

      if (error) {
        alert('Erreur lors du partage: ' + error.message);
      } else {
        alert('Post partagé avec succès!');
        onClose();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Erreur lors du partage');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Partager avec un membre</h3>
          <button onClick={onClose} className="close-btn">
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        <div className="share-modal-content">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : familyMembers.length === 0 ? (
            <div className="no-members">
              <p>Aucun autre membre dans votre nest</p>
            </div>
          ) : (
            <>
              <div className="member-selection">
                <label className="input-label">Sélectionner un membre:</label>
                <select
                  className="member-select"
                  value={selectedMember || ''}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">-- Choisir un membre --</option>
                  {familyMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.user?.first_name || member.user?.email || 'Membre'}
                      {member.role && ` (${member.role})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="message-input">
                <label className="input-label">Message (optionnel):</label>
                <textarea
                  className="message-textarea"
                  placeholder="Ajouter un message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="post-preview">
                <h4>Aperçu du post:</h4>
                <div className="preview-content">
                  <p>{post.content || 'Pas de texte'}</p>
                  {post.image && (
                    <div className="preview-media">
                      {post.type === 'video' ? (
                        <video src={post.image} className="preview-video" />
                      ) : (
                        <img src={post.image} alt="Preview" className="preview-image" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="share-modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Annuler
          </button>
          <button
            onClick={handleShare}
            className="share-btn"
            disabled={!selectedMember || sharing || loading}
          >
            {sharing ? 'Partage...' : 'Partager'}
          </button>
        </div>
      </div>
    </div>
  );
}

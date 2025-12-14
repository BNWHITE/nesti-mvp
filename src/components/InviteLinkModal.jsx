import { useState, useEffect } from 'react';
import { XMarkIcon, LinkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import invitationService from '../services/invitationService';
import './InviteLinkModal.css';

export default function InviteLinkModal({ familyId, familyName, userId, onClose }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await invitationService.getActiveInvitations(familyId);
      
      if (fetchError) {
        console.error('Error loading invitations:', fetchError);
        setError('Impossible de charger les invitations');
      } else {
        setInvitations(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      setCreating(true);
      setError(null);
      
      const { data, error: createError } = await invitationService.createInvitation(
        familyId,
        userId,
        5, // Max 5 uses
        30 // Expires in 30 days
      );

      if (createError) {
        setError('Impossible de créer l\'invitation');
        console.error('Create error:', createError);
      } else {
        setInvitations([data, ...invitations]);
      }
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError('Une erreur est survenue');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (inviteLink, inviteId) => {
    const success = await invitationService.copyInviteLinkToClipboard(inviteLink);
    if (success) {
      setCopied(inviteId);
      setTimeout(() => setCopied(null), 2000);
    } else {
      setError('Impossible de copier le lien');
    }
  };

  const handleDeleteInvitation = async (invitationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette invitation ?')) {
      return;
    }

    try {
      const { error: deleteError } = await invitationService.deleteInvitation(invitationId);
      
      if (deleteError) {
        setError('Impossible de supprimer l\'invitation');
      } else {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      }
    } catch (err) {
      console.error('Error deleting invitation:', err);
      setError('Une erreur est survenue');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpiringSoon = (dateString) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Invitations</h2>
            <p className="modal-subtitle">Partagez un lien pour inviter des membres</p>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Fermer">
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Create new invitation */}
          <div className="create-invitation-section">
            <button
              onClick={handleCreateInvitation}
              disabled={creating}
              className="create-invitation-btn"
            >
              <LinkIcon className="btn-icon" />
              {creating ? 'Création...' : 'Créer un nouveau lien d\'invitation'}
            </button>
            <p className="create-invitation-note">
              Le lien sera valide pendant 30 jours et pourra être utilisé 5 fois maximum
            </p>
          </div>

          {/* Invitations list */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des invitations...</p>
            </div>
          ) : invitations.length > 0 ? (
            <div className="invitations-list">
              <h3 className="invitations-list-title">Liens actifs</h3>
              {invitations.map((invitation) => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-header">
                    <div className="invitation-code">
                      <span className="code-label">Code:</span>
                      <span className="code-value">{invitation.invite_code}</span>
                    </div>
                    <div className="invitation-stats">
                      <span className="uses-count">
                        {invitation.uses_count}/{invitation.max_uses} utilisations
                      </span>
                    </div>
                  </div>

                  <div className="invitation-link-container">
                    <input
                      type="text"
                      value={invitation.invite_link}
                      readOnly
                      className="invitation-link-input"
                    />
                    <button
                      onClick={() => handleCopyLink(invitation.invite_link, invitation.id)}
                      className="copy-link-btn"
                      aria-label="Copier le lien"
                    >
                      {copied === invitation.id ? (
                        <CheckIcon className="copy-icon copied" />
                      ) : (
                        <ClipboardDocumentIcon className="copy-icon" />
                      )}
                    </button>
                  </div>

                  <div className="invitation-footer">
                    <span className={`expiry-date ${isExpiringSoon(invitation.expires_at) ? 'expiring-soon' : ''}`}>
                      Expire le {formatDate(invitation.expires_at)}
                      {isExpiringSoon(invitation.expires_at) && ' ⚠️'}
                    </span>
                    <button
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      className="delete-invitation-btn"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <p className="empty-text">Aucune invitation active</p>
              <p className="empty-subtext">Créez votre premier lien d'invitation</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

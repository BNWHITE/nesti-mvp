import { useState, useEffect } from 'react';
import { PlusIcon, CheckIcon, XMarkIcon, LinkIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import coNestService from '../services/coNestService';
import './CoNestSection.css';

export default function CoNestSection({ familyId, userId }) {
  const [coNests, setCoNests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (familyId) {
      loadCoNests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const loadCoNests = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await coNestService.getCoNests(familyId);
      
      if (fetchError) {
        console.error('Error loading co-nests:', fetchError);
        setError('Impossible de charger les Co-Nests');
      } else {
        setCoNests(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setSearching(true);
      setError(null);
      
      const { data, error: searchError } = await coNestService.searchFamily(searchTerm);
      
      if (searchError) {
        setError('Erreur lors de la recherche');
        console.error('Search error:', searchError);
      } else {
        // Filter out current family
        const filtered = data.filter(f => f.id !== familyId);
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error('Error searching families:', err);
      setError('Une erreur est survenue');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateCoNest = async (targetFamilyId) => {
    try {
      setError(null);
      
      const { error: createError } = await coNestService.createCoNest(
        familyId,
        targetFamilyId,
        userId
      );

      if (createError) {
        setError('Impossible de créer le Co-Nest');
        console.error('Create error:', createError);
      } else {
        setShowSearchModal(false);
        setSearchTerm('');
        setSearchResults([]);
        await loadCoNests();
      }
    } catch (err) {
      console.error('Error creating co-nest:', err);
      setError('Une erreur est survenue');
    }
  };

  const handleAcceptCoNest = async (coNestId) => {
    try {
      setError(null);
      
      const { error: acceptError } = await coNestService.acceptCoNest(coNestId);

      if (acceptError) {
        setError('Impossible d\'accepter le Co-Nest');
        console.error('Accept error:', acceptError);
      } else {
        await loadCoNests();
      }
    } catch (err) {
      console.error('Error accepting co-nest:', err);
      setError('Une erreur est survenue');
    }
  };

  const handleDeclineCoNest = async (coNestId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir refuser cette invitation ?')) {
      return;
    }

    try {
      setError(null);
      
      const { error: declineError } = await coNestService.declineCoNest(coNestId);

      if (declineError) {
        setError('Impossible de refuser le Co-Nest');
        console.error('Decline error:', declineError);
      } else {
        await loadCoNests();
      }
    } catch (err) {
      console.error('Error declining co-nest:', err);
      setError('Une erreur est survenue');
    }
  };

  const handleRemoveCoNest = async (coNestId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce Co-Nest ?')) {
      return;
    }

    try {
      setError(null);
      
      const { error: removeError } = await coNestService.removeCoNest(coNestId);

      if (removeError) {
        setError('Impossible de supprimer le Co-Nest');
        console.error('Remove error:', removeError);
      } else {
        await loadCoNests();
      }
    } catch (err) {
      console.error('Error removing co-nest:', err);
      setError('Une erreur est survenue');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'En attente', class: 'status-pending' },
      accepted: { text: 'Actif', class: 'status-accepted' },
      declined: { text: 'Refusé', class: 'status-declined' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="conest-section">
        <div className="section-header">
          <h2 className="section-title">Mes Co-Nests</h2>
        </div>
        <div className="loading-state">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const activeCoNests = coNests.filter(cn => cn.status === 'accepted');
  const pendingCoNests = coNests.filter(cn => cn.status === 'pending');

  return (
    <div className="conest-section">
      {/* Section Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Mes Co-Nests</h2>
          <p className="section-subtitle">Familles liées partageant des activités</p>
        </div>
        <button 
          className="add-conest-btn"
          onClick={() => setShowSearchModal(true)}
        >
          <PlusIcon className="plus-icon" />
          <span>Ajouter</span>
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Pending Invitations */}
      {pendingCoNests.length > 0 && (
        <div className="pending-section">
          <h3 className="subsection-title">Invitations en attente</h3>
          <div className="conests-list">
            {pendingCoNests.map((coNest) => (
              <div key={coNest.id} className="conest-card pending">
                <div className="conest-icon">
                  <LinkIcon className="icon" />
                </div>
                <div className="conest-info">
                  <h4 className="conest-name">{coNest.connectedFamily?.family_name || 'Famille'}</h4>
                  <span className={`status-badge ${getStatusBadge(coNest.status).class}`}>
                    {getStatusBadge(coNest.status).text}
                  </span>
                </div>
                <div className="conest-actions">
                  <button
                    onClick={() => handleAcceptCoNest(coNest.id)}
                    className="action-btn accept"
                    title="Accepter"
                  >
                    <CheckIcon className="action-icon" />
                  </button>
                  <button
                    onClick={() => handleDeclineCoNest(coNest.id)}
                    className="action-btn decline"
                    title="Refuser"
                  >
                    <XMarkIcon className="action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Co-Nests */}
      {activeCoNests.length > 0 ? (
        <div className="conests-list">
          {activeCoNests.map((coNest) => (
            <div key={coNest.id} className="conest-card active">
              <div className="conest-icon">
                <UserGroupIcon className="icon" />
              </div>
              <div className="conest-info">
                <h4 className="conest-name">{coNest.connectedFamily?.family_name || 'Famille'}</h4>
                <span className={`status-badge ${getStatusBadge(coNest.status).class}`}>
                  {getStatusBadge(coNest.status).text}
                </span>
              </div>
              <button
                onClick={() => handleRemoveCoNest(coNest.id)}
                className="remove-btn"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      ) : (
        !pendingCoNests.length && (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>Aucun Co-Nest pour le moment</h3>
            <p>Liez-vous à d'autres familles pour partager des activités</p>
            <button 
              className="empty-action-btn"
              onClick={() => setShowSearchModal(true)}
            >
              <PlusIcon className="plus-icon-small" />
              Ajouter un Co-Nest
            </button>
          </div>
        )
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rechercher une famille</h2>
              <button onClick={() => setShowSearchModal(false)} className="close-btn">
                <XMarkIcon className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nom de famille ou code..."
                  className="search-input"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchTerm.trim()}
                  className="search-btn"
                >
                  {searching ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="search-results">
                  {searchResults.map((family) => (
                    <div key={family.id} className="search-result-item">
                      <div>
                        <h4 className="family-name">{family.family_name}</h4>
                        <p className="family-code">Code: {family.family_code}</p>
                      </div>
                      <button
                        onClick={() => handleCreateCoNest(family.id)}
                        className="invite-btn"
                      >
                        Inviter
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm && !searching ? (
                <p className="no-results">Aucune famille trouvée</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

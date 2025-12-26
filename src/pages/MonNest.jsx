import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, Cog6ToothIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { familyService } from '../services/familyService';
import { inviteMember } from '../services/memberService';
import MemberEditModal from '../components/MemberEditModal';
import InviteLinkModal from '../components/InviteLinkModal';
import CoNestSection from '../components/CoNestSection';
import './MonNest.css';

export default function MonNest() {
  const { user } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Parent',
    roleType: 'parent'
  });

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handleUpdateMember = async (updatedMember) => {
    // Reload family data to reflect changes
    await loadFamilyData();
    setShowEditModal(false);
    setEditingMember(null);
  };

  const handleManageMember = (member) => {
    // For now, open edit modal with focus on permissions/role
    handleEditMember(member);
  };

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);

      // Get user's family
      const { data: userFamily } = await familyService.getUserFamily();
      
      if (userFamily) {
        setFamilyData({
          id: userFamily.id,
          name: userFamily.family_name || 'Mon Nest',
          description: 'Bienvenue dans votre espace familial ! 🏡',
          memberCount: 0,
          nestsConnected: 1
        });

        // Get family members - use familyService for consistency
        const { data: familyMembers } = await familyService.getFamilyMembers(userFamily.id);
        
        if (familyMembers && familyMembers.length > 0) {
          const transformedMembers = familyMembers.map(member => ({
            id: member.id,
            name: member.first_name || 'Membre',
            initials: (member.first_name || member.email.substring(0, 2)).substring(0, 2).toUpperCase(),
            email: member.email,
            role: getRoleLabel(member.role),
            roleType: member.role || 'parent',
            memberSince: new Date(member.created_at).toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric' 
            })
          }));
          
          setMembers(transformedMembers);
          setFamilyData(prev => ({
            ...prev,
            memberCount: transformedMembers.length
          }));
        }
      } else {
        // No family yet - show empty state
        setFamilyData({
          name: 'Mon Nest',
          description: 'Créez votre premier Nest familial ! 🏡',
          memberCount: 0,
          nestsConnected: 0
        });
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (roleType) => {
    if (roleType === 'admin') return 'Admin';
    if (roleType === 'parent') return 'Parent';
    if (roleType === 'ado' || roleType === 'child') return 'Ado';
    return 'Parent';
  };

  const getRoleBadgeClass = (roleType) => {
    if (roleType === 'admin') return 'badge-admin';
    if (roleType === 'parent') return 'badge-parent';
    if (roleType === 'ado') return 'badge-ado';
    return '';
  };

  const handleInviteMember = async () => {
    // Validate inputs
    if (!newMember.email || !newMember.roleType || !familyData?.id) {
      setInviteError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setInviteError(null);
      
      // Send invitation via Supabase
      const { error } = await inviteMember({
        family_id: familyData.id,
        email: newMember.email,
        role: newMember.roleType,
        invited_by: user.id,
        message: `Rejoignez ${familyData.name} sur Nesti !`
      });

      if (error) {
        console.error('Error inviting member:', error);
        setInviteError('Erreur lors de l\'envoi de l\'invitation. Veuillez réessayer.');
        return;
      }

      // Success - close modal and reset
      setShowInviteModal(false);
      setNewMember({
        name: '',
        email: '',
        role: 'Parent',
        roleType: 'parent'
      });
      
      // Reload family data to show any updates
      await loadFamilyData();
    } catch (error) {
      console.error('Error inviting member:', error);
      setInviteError('Erreur lors de l\'envoi de l\'invitation. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="monnest-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="monnest-page">
        <div className="empty-state">
          <div className="empty-icon">🏡</div>
          <h3>Aucun Nest trouvé</h3>
          <p>Vous devez compléter l'onboarding pour créer votre Nest familial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monnest-page">
      {/* Family Card */}
      <div className="family-card">
        <div className="family-icon">👨‍👩‍👧‍👦</div>
        <h1 className="family-name">{familyData.name}</h1>
        <p className="family-description">{familyData.description}</p>
        <div className="family-stats">
          <span>{members.length} {members.length > 1 ? 'membres' : 'membre'}</span>
          {familyData.nestsConnected > 0 && (
            <>
              <span>•</span>
              <span>{familyData.nestsConnected} nest{familyData.nestsConnected > 1 ? 's' : ''} connecté{familyData.nestsConnected > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
        {familyData.id && (
          <button 
            className="share-code-btn"
            onClick={() => setShowInviteLinkModal(true)}
          >
            <LinkIcon className="share-icon" />
            Lien d'invitation
          </button>
        )}
      </div>

      {/* Members Section */}
      <div className="members-section">
        <div className="section-header">
          <h2 className="section-title">Membres du nest</h2>
          <button 
            className="invite-btn"
            onClick={() => setShowInviteModal(true)}
          >
            <PlusIcon className="invite-icon" />
            Inviter
          </button>
        </div>

        <div className="members-list">
          {members.length > 0 ? (
            members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.initials}
                </div>
                
                <div className="member-info">
                  <div className="member-header">
                    <div>
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-email">{member.email}</p>
                    </div>
                    <span className={`member-badge ${getRoleBadgeClass(member.roleType)}`}>
                      {member.role}
                    </span>
                  </div>
                  
                  <p className="member-since">
                    Membre depuis {member.memberSince}
                  </p>
                  
                  <div className="member-actions">
                    <button 
                      className="member-action-btn" 
                      aria-label="Éditer"
                      onClick={() => handleEditMember(member)}
                    >
                      <PencilIcon className="action-icon" />
                      <span>Éditer</span>
                    </button>
                    <button 
                      className="member-action-btn" 
                      aria-label="Gérer"
                      onClick={() => handleManageMember(member)}
                    >
                      <Cog6ToothIcon className="action-icon" />
                      <span>Gérer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Aucun membre pour le moment</h3>
              <p>Invitez des membres de votre famille à rejoindre votre Nest</p>
              <button 
                className="empty-action-btn"
                onClick={() => setShowInviteModal(true)}
              >
                <PlusIcon className="plus-icon-small" />
                Inviter un membre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Co-Nest Section */}
      {familyData && familyData.id && (
        <CoNestSection familyId={familyData.id} userId={user.id} />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Inviter un membre</h2>
              <button onClick={() => setShowInviteModal(false)} className="close-btn">
                <XMarkIcon className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              {inviteError && (
                <div className="error-message" style={{ 
                  padding: '12px', 
                  marginBottom: '16px', 
                  backgroundColor: '#fee', 
                  color: '#c00', 
                  borderRadius: '8px',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {inviteError}
                </div>
              )}
              <div className="form-group">
                <label>Nom (optionnel)</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Nom du membre"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => {
                    setNewMember({...newMember, email: e.target.value});
                    setInviteError(null); // Clear error on input change
                  }}
                  placeholder="email@example.com"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={newMember.roleType}
                  onChange={(e) => {
                    const roleType = e.target.value;
                    const roleLabel = roleType === 'admin' ? 'Admin' : roleType === 'parent' ? 'Parent' : 'Ado';
                    setNewMember({...newMember, roleType, role: roleLabel});
                  }}
                  className="form-input"
                >
                  <option value="parent">👨‍👩‍👧 Parent</option>
                  <option value="ado">🧒 Ado/Enfant</option>
                  <option value="admin">⭐ Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowInviteModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button 
                onClick={handleInviteMember} 
                className="btn-primary"
                disabled={!newMember.email}
              >
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Modal */}
      {showInviteLinkModal && familyData && (
        <InviteLinkModal
          familyId={familyData.id}
          familyName={familyData.name}
          userId={user.id}
          onClose={() => setShowInviteLinkModal(false)}
        />
      )}

      {/* Member Edit Modal */}
      {showEditModal && editingMember && (
        <MemberEditModal
          member={editingMember}
          onClose={() => {
            setShowEditModal(false);
            setEditingMember(null);
          }}
          onUpdate={handleUpdateMember}
        />
      )}
    </div>
  );
}

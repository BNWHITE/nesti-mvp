import { useState } from 'react';
import { PlusIcon, PencilIcon, Cog6ToothIcon, XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import './MonNest.css';

// Initial empty state for new accounts - will be populated from database
const initialFamilyData = {
  name: 'Mon Nest',
  description: 'Bienvenue dans votre espace familial ! 🏡',
  memberCount: 0,
  nestsConnected: 1,
  members: []
};

export default function MonNest() {
  const [familyData, setFamilyData] = useState(initialFamilyData);
  const [members, setMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteCode] = useState('NEST-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Parent',
    roleType: 'parent'
  });

  const getRoleBadgeClass = (roleType) => {
    if (roleType === 'admin') return 'badge-admin';
    if (roleType === 'parent') return 'badge-parent';
    if (roleType === 'ado') return 'badge-ado';
    return '';
  };

  const handleInviteMember = () => {
    if (newMember.name && newMember.email) {
      const createdMember = {
        id: members.length + 1,
        name: newMember.name,
        initials: newMember.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        email: newMember.email,
        role: newMember.role,
        roleType: newMember.roleType,
        memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      };
      setMembers([...members, createdMember]);
      setShowInviteModal(false);
      setNewMember({
        name: '',
        email: '',
        role: 'Parent',
        roleType: 'parent'
      });
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Code d\'invitation copié !');
  };

  return (
    <div className="monnest-page">
      {/* Family Card */}
      <div className="family-card">
        <div className="family-icon">👨‍👩‍👧‍👦</div>
        <h1 className="family-name">{familyData.name}</h1>
        <p className="family-description">{familyData.description}</p>
        <div className="family-stats">
          <span>{members.length} membres</span>
          <span>•</span>
          <span>{familyData.nestsConnected} nests connectés</span>
        </div>
        <button 
          className="share-code-btn"
          onClick={() => setShowShareModal(true)}
        >
          <ShareIcon className="share-icon" />
          Partager le code
        </button>
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
                    <button className="member-action-btn" aria-label="Éditer">
                      <PencilIcon className="action-icon" />
                      <span>Éditer</span>
                    </button>
                    <button className="member-action-btn" aria-label="Gérer">
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
              <div className="form-group">
                <label>Nom complet *</label>
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
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="email@example.com"
                  className="form-input"
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
                disabled={!newMember.name || !newMember.email}
              >
                Inviter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Code Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Code d'invitation</h2>
              <button onClick={() => setShowShareModal(false)} className="close-btn">
                <XMarkIcon className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                Partagez ce code avec les personnes que vous souhaitez inviter à rejoindre votre Nest.
              </p>
              <div className="invite-code-box">
                <span className="invite-code">{inviteCode}</span>
                <button onClick={copyInviteCode} className="copy-btn">
                  Copier
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowShareModal(false)} className="btn-primary" style={{ width: '100%' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

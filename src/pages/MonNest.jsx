import { PlusIcon, PencilIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import './MonNest.css';

// Mock data
const familyData = {
  name: 'Famille Martin',
  description: 'Une famille formidable ! 💚',
  memberCount: 5,
  nestsConnected: 2,
  members: [
    {
      id: 1,
      name: 'Marc Martin',
      initials: 'MM',
      email: 'marc.martin@email.com',
      role: 'Admin',
      roleType: 'admin',
      memberSince: 'Janvier 2024'
    },
    {
      id: 2,
      name: 'Sophie Martin',
      initials: 'SM',
      email: 'sophie.martin@email.com',
      role: 'Parent',
      roleType: 'parent',
      memberSince: 'Janvier 2024'
    },
    {
      id: 3,
      name: 'Lou Martin',
      initials: 'LM',
      email: 'lou.martin@email.com',
      role: 'Ado',
      roleType: 'ado',
      memberSince: 'Février 2024'
    },
    {
      id: 4,
      name: 'Max Martin',
      initials: 'MXM',
      email: 'max.martin@email.com',
      role: 'Ado',
      roleType: 'ado',
      memberSince: 'Février 2024'
    },
    {
      id: 5,
      name: 'Claire Dubois',
      initials: 'CD',
      email: 'claire.dubois@email.com',
      role: 'Parent',
      roleType: 'parent',
      memberSince: 'Mars 2024'
    }
  ]
};

export default function MonNest() {
  const getRoleBadgeClass = (roleType) => {
    if (roleType === 'admin') return 'badge-admin';
    if (roleType === 'parent') return 'badge-parent';
    if (roleType === 'ado') return 'badge-ado';
    return '';
  };

  return (
    <div className="monnest-page">
      {/* Family Card */}
      <div className="family-card">
        <div className="family-icon">👨‍👩‍👧‍👦</div>
        <h1 className="family-name">{familyData.name}</h1>
        <p className="family-description">{familyData.description}</p>
        <div className="family-stats">
          <span>{familyData.memberCount} membres</span>
          <span>•</span>
          <span>{familyData.nestsConnected} nests connectés</span>
        </div>
      </div>

      {/* Members Section */}
      <div className="members-section">
        <div className="section-header">
          <h2 className="section-title">Membres du nest</h2>
          <button className="invite-btn">
            <PlusIcon className="invite-icon" />
            Inviter
          </button>
        </div>

        <div className="members-list">
          {familyData.members.map((member) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import './MonNest.css';

// Mock data
const familyData = {
  name: 'Famille Martin',
  description: 'Notre petit nid chaleureux 🏡',
  memberCount: 5,
  nestCount: 2
};

const mockMembers = [
  {
    id: 1,
    avatar: 'S',
    initials: 'SM',
    name: 'Sophie Martin',
    email: 'sophie@martin.com',
    role: 'admin',
    roleName: 'Admin',
    roleIcon: '🏆',
    memberSince: '15 janvier 2024'
  },
  {
    id: 2,
    avatar: 'P',
    initials: 'PM',
    name: 'Pierre Martin',
    email: 'pierre@martin.com',
    role: 'parent',
    roleName: 'Parent',
    roleIcon: '🌳',
    memberSince: '15 janvier 2024'
  },
  {
    id: 3,
    avatar: 'E',
    initials: 'EM',
    name: 'Emma Martin',
    email: 'emma@martin.com',
    role: 'child',
    roleName: 'Ado',
    roleIcon: '👶',
    memberSince: '20 janvier 2024'
  },
  {
    id: 4,
    avatar: 'L',
    initials: 'LM',
    name: 'Louis Martin',
    email: 'louis@martin.com',
    role: 'child',
    roleName: 'Ado',
    roleIcon: '👶',
    memberSince: '20 janvier 2024'
  }
];

export default function MonNest() {
  return (
    <div className="mon-nest-page">
      <div className="family-card">
        <div className="family-icon">👨‍👩‍👧‍👦</div>
        <h2 className="family-name">{familyData.name}</h2>
        <p className="family-description">{familyData.description}</p>
        <div className="family-stats">
          <span>{familyData.memberCount} membres</span>
          <span className="stat-divider">|</span>
          <span>{familyData.nestCount} nests connectés</span>
        </div>
      </div>

      <div className="members-section">
        <div className="members-header">
          <h3>Membres du nest</h3>
          <button className="btn btn-primary btn-sm">
            <span>+</span> Inviter
          </button>
        </div>

        <div className="members-list">
          {mockMembers.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-avatar-wrapper">
                <div className="avatar avatar-lg">{member.avatar}</div>
                <div className="member-initials">{member.initials}</div>
              </div>

              <div className="member-info">
                <div className="member-name-row">
                  <h4 className="member-name">{member.name}</h4>
                  <div className={`member-role-badge role-${member.role}`}>
                    <span className="role-icon">{member.roleIcon}</span>
                    <span className="role-name">{member.roleName}</span>
                  </div>
                </div>
                
                <p className="member-email">{member.email}</p>
                <p className="member-since">Membre depuis {member.memberSince}</p>
              </div>

              <div className="member-actions">
                <button className="action-icon-btn" title="Éditer">✏️</button>
                <button className="action-icon-btn" title="Gérer">⚙️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

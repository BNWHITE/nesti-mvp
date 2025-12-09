import React from "react";
import { UserPlusIcon, PencilIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import "./MonNest.css";

// Mock data
const familyInfo = {
  name: "Famille Martin",
  description: "Notre petit nid chaleureux 🏡",
  memberCount: 5,
  nestsCount: 2
};

const members = [
  {
    id: 1,
    name: "Sophie Martin",
    email: "sophie@martin.com",
    avatar: "S",
    role: "Admin",
    roleType: "admin",
    memberSince: "Janvier 2024"
  },
  {
    id: 2,
    name: "Marc Martin",
    email: "marc@martin.com",
    avatar: "M",
    role: "Parent",
    roleType: "parent",
    memberSince: "Janvier 2024"
  },
  {
    id: 3,
    name: "Emma Martin",
    email: "emma@martin.com",
    avatar: "E",
    role: "Ado",
    roleType: "teen",
    memberSince: "Janvier 2024"
  },
  {
    id: 4,
    name: "Lucas Martin",
    email: "lucas@martin.com",
    avatar: "L",
    role: "Ado",
    roleType: "teen",
    memberSince: "Février 2024"
  }
];

export default function MonNest() {
  const getRoleIcon = (roleType) => {
    const icons = {
      admin: '🏆',
      parent: '🌳',
      teen: '👶'
    };
    return icons[roleType] || '👤';
  };

  return (
    <div className="mon-nest-page">
      <div className="page-container">
        {/* Family Card */}
        <div className="family-card">
          <div className="family-icon">🏡</div>
          <h2 className="family-name">{familyInfo.name}</h2>
          <p className="family-description">{familyInfo.description}</p>
          <p className="family-stats">
            {familyInfo.memberCount} membres | {familyInfo.nestsCount} nests connectés
          </p>
        </div>

        {/* Members Section */}
        <div className="members-section">
          <div className="section-header">
            <h3 className="section-title">Membres du nest</h3>
            <button className="invite-btn">
              <UserPlusIcon className="icon-md" />
              <span>Inviter</span>
            </button>
          </div>

          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-avatar-wrapper">
                  <div className="avatar avatar-lg">
                    {member.avatar}
                  </div>
                </div>
                
                <div className="member-info">
                  <div className="member-header">
                    <h4 className="member-name">{member.name}</h4>
                    <span className={`badge badge-${member.roleType}`}>
                      {getRoleIcon(member.roleType)} {member.role}
                    </span>
                  </div>
                  <p className="member-email">{member.email}</p>
                  <p className="member-since">Membre depuis {member.memberSince}</p>
                </div>

                <div className="member-actions">
                  <button className="action-icon-btn" aria-label="Éditer">
                    <PencilIcon className="icon-md" />
                  </button>
                  <button className="action-icon-btn" aria-label="Gérer">
                    <Cog6ToothIcon className="icon-md" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

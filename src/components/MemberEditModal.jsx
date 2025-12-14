import React, { useState } from 'react';
import { updateFamilyMember } from '../services/profileService';
import './MemberEditModal.css';

function MemberEditModal({ member, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: member.name ? member.name.split(' ')[0] : '',
    last_name: member.name ? member.name.split(' ').slice(1).join(' ') : '',
    email: member.email || '',
    role: member.roleType || 'parent',
    phone: member.phone || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'parent', label: 'Parent' },
    { value: 'ado', label: 'Ado' },
    { value: 'child', label: 'Enfant' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      setError('Le prénom est requis');
      return;
    }

    setSaving(true);
    setError(null);

    // Prepare updates with correct column names
    const updates = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role
    };

    if (formData.phone) {
      updates.phone = formData.phone;
    }

    const { data, error: updateError } = await updateFamilyMember(member.id, updates);
    
    if (updateError) {
      setError(updateError.message || 'Erreur lors de la mise à jour');
      setSaving(false);
      return;
    }

    if (onUpdate) {
      onUpdate(data);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier le membre</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="member-edit-form">
          <div className="form-group">
            <label htmlFor="first_name">Prénom *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Nom de famille</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true}
              title="L'email ne peut pas être modifié"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={saving}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberEditModal;

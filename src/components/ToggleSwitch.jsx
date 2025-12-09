import React from 'react';
import './ToggleSwitch.css';

export default function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="toggle-switch-container">
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-description">{description}</span>}
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

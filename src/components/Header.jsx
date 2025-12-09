import React from 'react';
import DarkModeToggle from "./DarkModeToggle";
import './Header.css';

export default function Header({ familyName = "Famille Martin" }) {
  return (
    <header className="nesti-header">
      <div className="header-logo">
        <div className="logo-icon">N</div>
        <span className="header-family-name">{familyName}</span>
      </div>
      
      <div className="header-actions">
        <DarkModeToggle />
        <button className="header-icon-btn" title="Notifications">
          <span>🔔</span>
        </button>
        <button className="header-icon-btn avatar avatar-sm">
          S
        </button>
      </div>
    </header>
  );
}

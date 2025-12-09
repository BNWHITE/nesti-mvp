import React from 'react';
import '../styles/components.css';

const TagButton = ({ label, selected, onClick, icon }) => {
  return (
    <button
      className={`tag ${selected ? 'selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};

export default TagButton;

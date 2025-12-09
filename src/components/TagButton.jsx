import React from 'react';

export default function TagButton({ label, selected, onClick }) {
  return (
    <button
      className={`tag ${selected ? 'tag-selected' : 'tag-unselected'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

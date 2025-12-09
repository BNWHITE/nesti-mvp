import React from 'react';
import './ActivityCard.css';

const ActivityCard = ({ activity }) => {
  const {
    image = '⚽',
    match = 95,
    title = 'Stage de Football',
    category = 'Sport',
    rating = 4.5,
    reviews = 23,
    description = 'Stage intensif pour enfants et adolescents',
    distance = '2.5 km',
    date = '15-20 Juillet',
    price = '120€',
    tags = ['Extérieur', 'Groupe']
  } = activity;

  return (
    <div className="activity-card">
      <div className="activity-image">
        <div className="activity-emoji">{image}</div>
        <div className="activity-match-badge">
          {match}% match
        </div>
      </div>

      <div className="activity-content">
        <div className="activity-header">
          <h3 className="activity-title">{title}</h3>
          <span className="activity-category">{category}</span>
        </div>

        <div className="activity-rating">
          <span className="rating-stars">⭐ {rating}</span>
          <span className="rating-reviews">({reviews} avis)</span>
        </div>

        <p className="activity-description">{description}</p>

        <div className="activity-info">
          <div className="info-item">
            <span>📍</span> {distance}
          </div>
          <div className="info-item">
            <span>📅</span> {date}
          </div>
          <div className="info-item">
            <span>💶</span> {price}
          </div>
        </div>

        <div className="activity-tags">
          {tags.map((tag, idx) => (
            <span key={idx} className="activity-tag">{tag}</span>
          ))}
        </div>

        <div className="activity-actions">
          <button className="btn btn-primary">
            <span>📅</span> Ajouter
          </button>
          <button className="btn btn-outline">
            <span>❤️</span> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;

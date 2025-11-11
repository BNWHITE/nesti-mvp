import './DiscoveriesPage.css';

export default function DiscoveriesPage() {
  const activities = [
    {
      id: 1,
      title: 'Musée des Sciences',
      category: 'culture',
      emoji: '🔬',
      match: 95,
      rating: 4.8,
      distance: '2.3km',
      price: 'Gratuit',
      tags: ['Éducatif', 'Famille', 'Intérieur']
    },
    {
      id: 2,
      title: 'Parc Aventure',
      category: 'sport',
      emoji: '🌲',
      match: 87,
      rating: 4.6,
      distance: '5.1km',
      price: '25€',
      tags: ['Nature', 'Sport', 'Plein air']
    }
  ];

  return (
    <div className="discoveries-page">
      <div className="discoveries-header">
        <h1>🎯 Découvertes</h1>
        <p>Activités personnalisées pour votre famille</p>
      </div>

      <div className="ai-banner">
        <div className="banner-content">
          <span className="banner-emoji">✨</span>
          <div>
            <h3>Suggestions intelligentes</h3>
            <p>Basées sur vos préférences familiales</p>
          </div>
        </div>
      </div>

      <div className="activities-section">
        <h2>🎪 Activités recommandées</h2>
        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-emoji">{activity.emoji}</div>
                <div className="activity-match">
                  <span className="match-badge">{activity.match}%</span>
                </div>
              </div>
              
              <h3>{activity.title}</h3>
              
              <div className="activity-rating">
                {'⭐'.repeat(5)} ({activity.rating})
              </div>
              
              <div className="activity-details">
                <span>📍 {activity.distance}</span>
                <span>💰 {activity.price}</span>
              </div>
              
              <div className="activity-tags">
                {activity.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="activity-actions">
                <button className="add-btn">➕ Ajouter</button>
                <button className="save-btn">💖</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="coming-soon">
        <h3>🚀 Fonctionnalités à venir</h3>
        <ul>
          <li>🤖 IA de recommandation avancée</li>
          <li>📊 Analyse des préférences familiales</li>
          <li>🎯 Suggestions en temps réel</li>
          <li>📅 Intégration calendrier automatique</li>
        </ul>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import './WelcomeTips.css';

const tips = [
  {
    id: 'home',
    title: 'Fil Familial',
    description: 'Partagez des moments, des photos et célébrez les réussites de chaque membre de la famille.',
    icon: '🏠'
  },
  {
    id: 'nest',
    title: 'Mon Nest',
    description: 'Invitez des membres de votre famille et gérez les rôles de chacun.',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'agenda',
    title: 'Agenda Familial',
    description: 'Créez et suivez tous les événements importants de votre famille en un seul endroit.',
    icon: '📅'
  },
  {
    id: 'discover',
    title: 'Découvertes',
    description: 'Trouvez des activités adaptées à votre famille près de chez vous.',
    icon: '🎯'
  },
  {
    id: 'ai',
    title: 'Nesti IA',
    description: 'Posez vos questions sur l\'organisation familiale, l\'éducation ou les activités.',
    icon: '🤖'
  }
];

export default function WelcomeTips({ onClose }) {
  const [currentTip, setCurrentTip] = useState(0);

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('nesti_tips_shown', 'true');
    onClose();
  };

  const tip = tips[currentTip];

  return (
    <div className="tips-overlay">
      <div className="tips-content">
        <button className="tips-close" onClick={handleFinish}>
          <XMarkIcon className="tips-close-icon" />
        </button>

        <div className="tips-header">
          <LightBulbIcon className="tips-bulb-icon" />
          <h2>Bienvenue sur Nesti !</h2>
        </div>

        <div className="tip-card">
          <div className="tip-icon">{tip.icon}</div>
          <h3 className="tip-title">{tip.title}</h3>
          <p className="tip-description">{tip.description}</p>
        </div>

        <div className="tips-progress">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentTip ? 'active' : ''} ${index < currentTip ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="tips-actions">
          {currentTip > 0 && (
            <button className="tips-btn tips-btn-secondary" onClick={handlePrevious}>
              Précédent
            </button>
          )}
          <button className="tips-btn tips-btn-primary" onClick={handleNext}>
            {currentTip === tips.length - 1 ? 'Commencer' : 'Suivant'}
          </button>
        </div>

        <button className="tips-skip" onClick={handleFinish}>
          Passer le tutoriel
        </button>
      </div>
    </div>
  );
}

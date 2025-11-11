import { useState } from 'react';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [nestName, setNestName] = useState('');

  const steps = [
    {
      title: "Bienvenue dans Nesti",
      subtitle: "Votre compagnon familial pour une vie inclusive",
      emoji: "🏡"
    },
    {
      title: "Créez votre Nest",
      subtitle: "Donnez un nom à votre famille",
      emoji: "👨‍👩‍👧‍👦"
    },
    {
      title: "Personnalisez vos préférences", 
      subtitle: "Aidez Nesti à mieux vous connaître",
      emoji: "✨"
    },
    {
      title: "C'est parti !",
      subtitle: "Votre aventure familiale commence",
      emoji: "🎉"
    }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button className="text-gray-500">Retour</button>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <button className="text-green-600 font-medium">Passer</button>
        </div>

        {/* Content */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">{steps[step-1].emoji}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[step-1].title}
          </h1>
          <p className="text-gray-600">{steps[step-1].subtitle}</p>
        </div>

        {/* Step-specific content */}
        {step === 2 && (
          <div className="mb-8">
            <input
              type="text"
              placeholder="Famille Martin..."
              value={nestName}
              onChange={(e) => setNestName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-2xl text-center text-lg focus:border-green-500 focus:outline-none"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">🏃 Sports préférés</h3>
              <div className="flex flex-wrap gap-2">
                {['Football', 'Natation', 'Tennis', 'Randonnée', 'Danse', 'Yoga'].map((sport) => (
                  <button
                    key={sport}
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto p-6">
        <button
          onClick={handleNext}
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-medium hover:bg-green-700 transition-colors"
        >
          {step === 4 ? "Commencer l'aventure" : "Suivant"}
        </button>
      </div>
    </div>
  );
}

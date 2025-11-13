// src/pages/OnboardingPage.js

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import './OnboardingPage.css'; 

const OnboardingPage = ({ user, setFamilyId, setFamilyName }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' ou 'join'
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // S'assure d'avoir un prénom pour l'affichage (utilisé si user_metadata existe)
  const firstName = user?.user_metadata?.first_name || user?.email.split('@')[0];

  // --- LOGIQUE SUPABASE ---

  // 1. Gérer la création d'une nouvelle famille
  const handleCreateFamily = async (e) => {
    e.preventDefault();
    setError('');
    if (!newFamilyName.trim()) {
      setError("Veuillez donner un nom à votre Nest familial.");
      return;
    }
    setLoading(true);

    try {
      // 1. Créer la famille (avec un champ de code de jointure simple pour l'exemple)
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{ 
            family_name: newFamilyName, 
            created_by: user.id,
            // Pour simplifier, le code de jointure est l'ID de la famille ou un code simple
            join_code: newFamilyName.toLowerCase().replace(/\s/g, '-') 
        }])
        .select()
        .single();
      
      if (familyError) throw familyError;
      
      const newFamilyId = familyData.id;

      // 2. Mettre à jour l'utilisateur avec le family_id créé
      const { error: userError } = await supabase
        .from('users')
        .update({ family_id: newFamilyId })
        .eq('id', user.id);

      if (userError) throw userError;

      // 3. Mise à jour de l'état global de l'application (Débloque l'interface principale)
      setFamilyId(newFamilyId); // Doit être l'ID valide de la nouvelle famille
      setFamilyName(newFamilyName); // Doit être le nom valide de la nouvelle famille
      
    } catch (err) {
      console.error("Erreur lors de la création de la famille:", err);
      setError(err.message || "Une erreur est survenue lors de la création du Nest.");
    } finally {
      setLoading(false);
    }
  };
  
  // 2. Gérer la jointure d'une famille existante
  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setError('');
    if (!joinCode.trim()) {
      setError("Veuillez entrer le code de votre Nest familial.");
      return;
    }
    setLoading(true);
    
    try {
      // 1. Rechercher la famille par son ID (ou par le champ join_code si vous l'avez créé)
      // Ici, on utilise l'ID pour l'exemple de code le plus simple
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('id, family_name')
        .or(`id.eq.${joinCode},join_code.eq.${joinCode}`)
        .single();
        
      if (familyError || !familyData) throw new Error("Code familial invalide ou Nest introuvable.");

      // 2. Mettre à jour l'utilisateur avec le family_id
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ family_id: familyData.id })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // 3. Mise à jour de l'état global de l'application (Débloque l'interface principale)
      setFamilyId(familyData.id);
      setFamilyName(familyData.family_name);

    } catch (err) {
      console.error("Erreur lors de la jointure:", err);
      setError(err.message || "Une erreur est survenue lors de la tentative de rejoindre le Nest.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU ---

  const renderContent = () => {
    if (activeTab === 'create') {
      return (
        <form onSubmit={handleCreateFamily} className="onboarding-form">
          <p className="form-description">
            Créez un espace privé pour votre famille. Vous pourrez ensuite inviter les autres membres.
          </p>
          <div className="input-group">
            <label htmlFor="familyName">Nom de votre Nest familial</label>
            <input
              id="familyName"
              type="text"
              placeholder="Ex: Les Dupont, La Tribu des Aventures..."
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="main-action-btn">
            {loading ? 'Création en cours...' : '🏡 Créer mon Nest'}
          </button>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleJoinFamily} className="onboarding-form">
          <p className="form-description">
            Entrez le code de jointure que votre famille vous a transmis.
          </p>
          <div className="input-group">
            <label htmlFor="joinCode">Code de jointure du Nest</label>
            <input
              id="joinCode"
              type="text"
              placeholder="Ex: XYZ123 (ID de la famille)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="main-action-btn secondary-btn">
            {loading ? 'Connexion en cours...' : '🔑 Rejoindre le Nest'}
          </button>
        </form>
      );
    }
  };


  return (
    <div className="onboarding-page-container">
      <div className="onboarding-card">
        
        <div className="onboarding-header">
            <div className="onboarding-logo">
                <span>N</span>
            </div>
            <h1>Bienvenue, {firstName} !</h1>
            <p className="onboarding-greeting">
                Une dernière étape : créez ou rejoignez votre **Nest familial** pour démarrer l'aventure.
            </p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => {
                setActiveTab('create');
                setError('');
            }}
            disabled={loading}
          >
            Créer un Nest
          </button>
          <button 
            className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => {
                setActiveTab('join');
                setError('');
            }}
            disabled={loading}
          >
            Rejoindre un Nest
          </button>
        </div>

        <div className="onboarding-content">
          {renderContent()}
        </div>
        
      </div>
    </div>
  );
};

export default OnboardingPage;

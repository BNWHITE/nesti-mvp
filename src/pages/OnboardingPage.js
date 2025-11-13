// src/pages/OnboardingPage.js (VERSION FINALE ET CORRIGÉE)

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import './OnboardingPage.css'; 

// PROPS: setProfileComplete est essentiel pour informer le parent App.js
const OnboardingPage = ({ user, setFamilyId, setFamilyName, setProfileComplete, initialView = 'profile' }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' ou 'join'
  const [isProfileStep, setIsProfileStep] = useState(initialView === 'profile');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  const [error, setError] = useState('');

  // S'assurer que le prénom est mis à jour si l'utilisateur revient à cette page
  const fetchCurrentProfile = useCallback(async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .maybeSingle();

    if (data && data.first_name) {
      setFirstName(data.first_name);
      setLastName(data.last_name || '');
      // Si la vue initiale est 'family' (profil déjà fait), on passe
      if (initialView === 'family') {
        setIsProfileStep(false);
      }
    }
  }, [user.id, initialView]);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  // --- LOGIQUE SUPABASE ---

  // 0. Compléter le profil (Nom/Prénom)
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) {
      setError("Veuillez entrer votre prénom.");
      return;
    }
    setLoading(true);

    try {
      // 1. Insérer/Mettre à jour les données dans la table 'user_profiles'
      const { error: profileError } = await supabase
        .from('user_profiles') 
        .upsert({ 
            id: user.id, 
            first_name: firstName.trim(),
            last_name: lastName.trim() || null,
        }, { onConflict: 'id' }); // upsert sur l'ID de l'utilisateur
      
      if (profileError) throw profileError;
      
      // 2. Mise à jour de l'état local et global pour passer à l'étape Famille (DÉBLOCAGE)
      setProfileComplete(true); // Informe App.js que le profil est OK
      setIsProfileStep(false); // Change la vue localement
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(err.message || "Une erreur est survenue lors de l'enregistrement du profil.");
    } finally {
      setLoading(false);
    }
  };

// Extrait de src/pages/OnboardingPage.js

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
      // 1. Créer la famille dans la table 'families'
      // CORRECTION APPLIQUÉE: Suppression de la colonne 'created_by' 
      // qui causait l'erreur de schéma.
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{ 
            family_name: newFamilyName.trim(), 
            // created_by: user.id, <-- CETTE LIGNE EST SUPPRIMÉE
            join_code: Math.random().toString(36).substring(2, 8).toUpperCase()
        }])
        .select('id, family_name')
        .single();
      
      if (familyError) throw familyError;
      
      const newFamilyId = familyData.id;
      const familyNameCreated = familyData.family_name; 
  
      // 2. Mettre à jour la table 'user_profiles' avec le family_id créé
      const { error: userError } = await supabase
        .from('user_profiles')
        .update({ family_id: newFamilyId })
        .eq('id', user.id);
  
      if (userError) throw userError;
  
      // 3. Mise à jour de l'état global de l'application (DÉBLOCAGE FINAL)
      setFamilyId(newFamilyId);
      setFamilyName(familyNameCreated);
      
    } catch (err) {
      console.error("Erreur lors de la création de la famille:", err);
      // Afficher l'erreur pour le débogage, mais utiliser un message générique
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
      // 1. Rechercher la famille par son code de jointure
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('join_code', joinCode.toUpperCase()) 
        .maybeSingle();
        
      if (familyError || !familyData) throw new Error("Code familial invalide ou Nest introuvable.");

      // 2. Mettre à jour l'utilisateur dans 'user_profiles'
      const { error: userUpdateError } = await supabase
        .from('user_profiles')
        .update({ family_id: familyData.id })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // 3. Mise à jour de l'état global de l'application (DÉBLOCAGE FINAL)
      setFamilyId(familyData.id);
      setFamilyName(familyData.family_name);

    } catch (err) {
      console.error("Erreur lors de la jointure:", err);
      setError(err.message || "Une erreur est survenue lors de la tentative de rejoindre le Nest.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Fonctions de rendu renderProfileContent et renderFamilyContent, voir code précédent) ...
  const renderProfileContent = () => (
    <form onSubmit={handleCompleteProfile} className="onboarding-form">
        <p className="form-description">
            Veuillez nous indiquer votre prénom et nom pour personnaliser votre espace.
        </p>
        <div className="input-group">
            <label htmlFor="firstName">Prénom *</label>
            <input
              id="firstName"
              type="text"
              placeholder="Votre prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              required
            />
        </div>
        <div className="input-group">
            <label htmlFor="lastName">Nom (facultatif)</label>
            <input
              id="lastName"
              type="text"
              placeholder="Votre nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
        </div>
        <button type="submit" disabled={loading} className="main-action-btn">
            {loading ? 'Enregistrement...' : '✨ Continuer'}
        </button>
    </form>
  );

  const renderFamilyContent = () => {
    const isCreateTab = activeTab === 'create';

    return (
        <>
            <div className="tabs">
              <button 
                className={`tab-btn ${isCreateTab ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('create');
                    setError('');
                }}
                disabled={loading}
              >
                Créer un Nest
              </button>
              <button 
                className={`tab-btn ${!isCreateTab ? 'active' : ''}`}
                onClick={() => {
                    setActiveTab('join');
                    setError('');
                }}
                disabled={loading}
              >
                Rejoindre un Nest
              </button>
            </div>

            {isCreateTab ? (
                <form onSubmit={handleCreateFamily} className="onboarding-form">
                  <p className="form-description">Créez un espace privé pour votre famille.</p>
                  <div className="input-group">
                    <label htmlFor="familyName">Nom de votre Nest familial</label>
                    <input
                      id="familyName"
                      type="text"
                      placeholder="Ex: Les Aventures des Dupont"
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
            ) : (
                <form onSubmit={handleJoinFamily} className="onboarding-form">
                  <p className="form-description">Entrez le code de jointure transmis par un membre de votre famille.</p>
                  <div className="input-group">
                    <label htmlFor="joinCode">Code de jointure du Nest</label>
                    <input
                      id="joinCode"
                      type="text"
                      placeholder="Ex: TRIBEXYZ"
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
            )}
        </>
    );
  };

  // RENDER PRINCIPAL
  const currentStepTitle = isProfileStep ? "Complétez votre profil" : "Mise en route familiale";
  
  return (
    <div className="onboarding-page-container">
      <div className="onboarding-card">
        
        <div className="onboarding-header">
            <div className="onboarding-logo">
                <span>N</span>
            </div>
            <h1>{isProfileStep ? `Bienvenue !` : `Bonjour ${firstName || 'vous'} !`}</h1>
            <p className="onboarding-greeting">
                {currentStepTitle} : une étape essentielle pour démarrer Nesti.
            </p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <div className="onboarding-content">
          {isProfileStep ? renderProfileContent() : renderFamilyContent()}
        </div>
        
      </div>
    </div>
  );
};

export default OnboardingPage;

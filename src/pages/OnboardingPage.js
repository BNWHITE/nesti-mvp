// src/pages/OnboardingPage.js

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Assurez-vous que le chemin est correct
import './Onboarding.css'; // Vous devez ajouter des styles à ce fichier (voir suggestion après le code)

export default function OnboardingPage({ user, setFamilyId, setFamilyName }) {
  const [loading, setLoading] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

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
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{ family_name: newFamilyName, created_by: user.id }])
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

      // 3. Mise à jour de l'état global de l'application
      setFamilyId(newFamilyId);
      setFamilyName(newFamilyName);
      alert('Votre Nest familial a été créé avec succès !');

    } catch (err) {
      console.error("Erreur lors de la création de la famille:", err);
      setError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };
  
  // 2. Gérer la jointure d'une famille existante (basée sur un code ou un ID)
  const handleJoinFamily = async (e) => {
    e.preventDefault();
    setError('');
    if (!joinCode.trim()) {
      setError("Veuillez entrer le code de votre Nest familial.");
      return;
    }
    setLoading(true);
    
    // NOTE: Ceci est une implémentation simplifiée. 
    // Idéalement, vous auriez une table 'invitations' ou un 'join_code' unique
    // que vous vérifieriez ici. Pour l'instant, on suppose que le code est l'ID de la famille.
    
    try {
      // 1. Vérifier si la famille existe
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('id, family_name')
        .eq('id', joinCode) // Utilisation de joinCode comme ID pour l'exemple
        .single();
        
      if (familyError || !familyData) throw new Error("Code familial invalide ou famille introuvable.");

      // 2. Mettre à jour l'utilisateur avec le family_id
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ family_id: familyData.id })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // 3. Mise à jour de l'état global de l'application
      setFamilyId(familyData.id);
      setFamilyName(familyData.family_name);
      alert(`Vous avez rejoint le Nest ${familyData.family_name} !`);

    } catch (err) {
      console.error("Erreur lors de la jointure:", err);
      setError(err.message || "Une erreur est survenue lors de la tentative de rejoindre la famille.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page-container">
      <div className="onboarding-card">
        <h1>Bienvenue, {user?.user_metadata?.first_name || 'vous'} !</h1>
        <p className="onboarding-intro">Pour commencer à utiliser Nesti, créez ou rejoignez le Nest familial de votre tribu.</p>

        {error && <div className="onboarding-error">{error}</div>}

        <div className="onboarding-options">
          
          {/* OPTION 1: CRÉER UNE FAMILLE */}
          <div className="option-card create-card">
            <h2>🏡 Créer un nouveau Nest</h2>
            <form onSubmit={handleCreateFamily}>
              <input
                type="text"
                placeholder="Nom du Nest (ex: Famille Dupont)"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon Nest'}
              </button>
            </form>
          </div>

          <div className="divider">OU</div>

          {/* OPTION 2: REJOINDRE UNE FAMILLE */}
          <div className="option-card join-card">
            <h2>🔑 Rejoindre un Nest existant</h2>
            <form onSubmit={handleJoinFamily}>
              <input
                type="text"
                placeholder="Code de jointure ou ID de la famille"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Connexion...' : 'Rejoindre le Nest'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // INSCRIPTION
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Créer la famille
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .insert([{ family_name: familyName }])
          .select()
          .single();

        if (familyError) throw familyError;

        // Créer le profil utilisateur
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            family_id: familyData.id,
            email: email,
            first_name: firstName,
            role: 'parent'
          }]);

        if (userError) throw userError;

        alert('Famille créée avec succès !');
        
      } else {
        // CONNEXION
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }

      onAuthSuccess();
      
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>N</span>
          </div>
          <h1>{isSignUp ? 'Créer votre famille' : 'Connexion'}</h1>
          <p>{isSignUp ? 'Rejoignez la communauté Nesti' : 'Accédez à votre espace familial'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {isSignUp && (
            <>
              <div className="input-group">
                <label>Nom de famille</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Famille Martin"
                  required
                />
              </div>
              <div className="input-group">
                <label>Votre prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sophie"
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Chargement...' : (isSignUp ? 'Créer la famille' : 'Se connecter')}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="auth-switch"
        >
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer une famille'}
        </button>
      </div>
    </div>
  );
}

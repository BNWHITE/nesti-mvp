import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import './Auth.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          return;
        }

        if (!firstName || !lastName) {
          setError('Veuillez renseigner votre nom et prénom');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setMessage('Compte créé ! Vérifiez votre email pour confirmer votre compte.');
          // Reset form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFirstName('');
          setLastName('');
        }
      } else {
        const { error: signInError } = await signIn(email, password);

        if (signInError) {
          setError(signInError.message);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setError('');
    setLoading(true);

    const { error: oauthError } = await signInWithOAuth(provider);

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <div className="logo-icon">N</div>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1>{isSignUp ? 'Créer un compte' : 'Se connecter'}</h1>
            <p>
              {isSignUp
                ? 'Rejoignez Nesti pour organiser votre vie familiale'
                : 'Bienvenue sur Nesti'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}
          {message && (
            <div className="auth-message success">
              {message}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="firstName">Prénom</label>
                    <div className="input-with-icon">
                      <UserIcon className="input-icon" />
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Votre prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="lastName">Nom</label>
                    <div className="input-with-icon">
                      <UserIcon className="input-icon" />
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Votre nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <EnvelopeIcon className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-with-icon">
                <LockClosedIcon className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? 'Minimum 6 caractères' : 'Votre mot de passe'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="input-with-icon">
                  <LockClosedIcon className="input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>ou</span>
          </div>

          {/* OAuth Buttons */}
          <div className="oauth-buttons">
            <button
              className="oauth-button google"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
            >
              <svg className="oauth-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>

          {/* Toggle Sign In/Sign Up */}
          <div className="auth-toggle">
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas encore de compte ? Créer un compte'}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="auth-privacy">
            <p>
              🔒 Vos données sont chiffrées et privées par conception. 
              Nous ne partageons jamais vos informations avec des tiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

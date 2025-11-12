import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useClientAuth,
  ClientLoginStatus,
} from '../contexts/ClientAuthContext';
import './LoginPage.css';

/**
 * Handles the multi-step client portal authentication:
 * 1. Email Check (checkStatus)
 * 2. Password Entry (login)
 * 3. First-Time Password Setup (setPassword)
 */
export const LoginPage: React.FC = () => {
  const {
    status,
    loading,
    isAuthenticated,
    user,
    login,
    checkStatus,
    setPassword,
  } = useClientAuth();

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPasswordState] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle status changes to display appropriate errors
  useEffect(() => {
    setErrorMessage(null); // Clear previous errors on status change
    switch (status) {
      case ClientLoginStatus.ERROR:
        setErrorMessage('An unexpected error occurred during login. Please try again.');
        break;
      case ClientLoginStatus.ACCESS_DENIED:
        setErrorMessage('Access revoked. Please contact your account manager.');
        break;
      case ClientLoginStatus.NOT_FOUND:
        setErrorMessage('No client found with that email address.');
        break;
      case ClientLoginStatus.AUTHENTICATED:
        navigate('/dashboard', { replace: true });
        break;
      default:
        break;
    }
  }, [status, navigate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMessage(null);
    checkStatus(email);
  };

  const handleLoginOrSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setErrorMessage(null);

    if (status === ClientLoginStatus.PASSWORD_REQUIRED) {
      // Regular login flow
      login(email, password);
    } else if (status === ClientLoginStatus.FIRST_TIME) {
      // First-time setup flow
      setPassword(password);
    }
  };

  // --- Render based on status ---

  // Renders login or setup screen
  const renderLoginFields = () => (
    <div className="login-card">
      <h2>
        {status === ClientLoginStatus.FIRST_TIME
          ? 'First-Time Setup'
          : 'Client Portal Login'}
      </h2>

      {errorMessage && <div className="form-error-message">{errorMessage}</div>}

      {(status === ClientLoginStatus.PASSWORD_REQUIRED ||
        status === ClientLoginStatus.FIRST_TIME) && user ? (
        <form onSubmit={handleLoginOrSetup}>
          <p>
            {status === ClientLoginStatus.FIRST_TIME
              ? 'Welcome! Please set a strong password to secure your account.'
              : `Email: ${user.email}.`}
          </p>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPasswordState(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className={`login-btn ${status === ClientLoginStatus.FIRST_TIME ? 'btn-set-password' : ''}`}>
            {loading ? 'Processing...' : status === ClientLoginStatus.FIRST_TIME ? 'Set Password & Login' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="email">Client Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@client.com"
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Checking Status...' : 'Continue'}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="client-portal-login-container">{!isAuthenticated && renderLoginFields()}</div>
  );
};
// src/pages/Login/index.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';
import logo from '../../assets/logo.svg'; // Import your logo

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post('/api/v1/client-portal-auth/login', {
        email,
        password,
      });
      login(data.token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.message === 'Please set your initial password.') {
        navigate(`/set-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(
          err.response?.data?.message || 'Login failed. Please try again.'
        );
      }
    }
  };

  return (
    <div className="login-page-container">
      {/* Branding Side */}
      <div className="login-branding-side">
        <img src={logo} alt="Webflare Design Co. Logo" className="login-logo" />
        <h1>Your Vision, Engineered.</h1>
        <p>
          Access your project dashboard, tasks, and invoices all in one place.
        </p>
      </div>

      {/* Form Side */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <h2>Client Portal Login</h2>
            <p>Welcome back! Please sign in.</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="btn-login">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

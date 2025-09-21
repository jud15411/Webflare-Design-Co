import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post(`/api/v1/auth/login`, {
        email,
        password,
      });

      // Use the auth context login function with the refined interface
      login({ token: data.token, user: data.user });

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Webflare Design Co.</h2>
          <p>Admin Panel Login</p>
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
  );
};

export default LoginPage;

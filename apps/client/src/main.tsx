import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import ReactDOM from 'react-dom/client';
import React from 'react';

// Get the root element from the HTML
const rootElement = document.getElementById('root');

// Ensure the root element exists before trying to render
if (rootElement) {
  // Use the createRoot API from the correct import
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <AuthProvider>
        <BusinessProvider>
          <App />
        </BusinessProvider>
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}

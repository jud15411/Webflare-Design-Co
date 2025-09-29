// in apps/portal/src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // 1. Import the router
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext'; // Assuming you have AuthContext
import { NotificationProvider } from './contexts/NotificationContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      {/* 2. Add the Router with the correct basename */}
      <Router basename="/client-portal">
        <NotificationProvider>
          <AuthProvider>
              <App />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </StrictMode>
  );
}
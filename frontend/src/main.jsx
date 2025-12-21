import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ConfigProvider } from './context/ConfigContext.jsx';
import { ErrorProvider } from './context/ErrorContext.jsx'; // 1. Import it

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <ErrorProvider>
        {' '}
        {/* 2. Wrap App */}
        <App />
      </ErrorProvider>
    </ConfigProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './i18n/config'; // Import i18n configuration
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

// Register service worker for offline capabilities
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

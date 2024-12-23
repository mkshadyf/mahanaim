import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/i18n/config';
import '@/styles/global.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Did you forget to add it to your index.html?');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker
registerServiceWorker();

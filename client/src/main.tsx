import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AstryxProvider } from './design-system/astryx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AstryxProvider theme="teacher-ivan">
      <App />
    </AstryxProvider>
  </React.StrictMode>
);

// Register Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] ServiceWorker registration skipped:', err);
    });
  });
}


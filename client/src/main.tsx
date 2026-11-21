import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AstryxProvider } from './design-system/astryx';
import { ThemeProvider } from './modules/theme/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AstryxProvider theme="teacher-ivan">
          <App />
        </AstryxProvider>
      </ThemeProvider>
    </ErrorBoundary>
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


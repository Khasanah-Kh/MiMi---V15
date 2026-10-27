import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  ignoreErrors: [
    'WebSocket closed without opened',
    'failed to connect to websocket',
    'ResizeObserver loop',
  ],
});

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (msg.includes('WebSocket') || msg.includes('websocket')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Ignore service worker registration errors in dev iframe
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);


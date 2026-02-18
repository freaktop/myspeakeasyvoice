import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (import.meta.env.DEV) {
  window.addEventListener('error', (e) => {
    // eslint-disable-next-line no-console
    console.error('GLOBAL_ERROR', (e as ErrorEvent).error || (e as ErrorEvent).message);
  });

  window.addEventListener('unhandledrejection', (e) => {
    // eslint-disable-next-line no-console
    console.error('UNHANDLED_REJECTION', (e as PromiseRejectionEvent).reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

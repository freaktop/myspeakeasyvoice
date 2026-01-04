import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ENV } from './config/env';

// Validate environment variables on startup
try {
  // This will throw if required env vars are missing
  const _ = ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY;
  if (import.meta.env.DEV) {
    console.log('✅ Environment variables validated');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('❌ Environment validation failed:', message);
  // Show user-friendly error in production
  if (!import.meta.env.DEV) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
          <p style="color: #6b7280; margin-bottom: 8px;">The application is missing required configuration.</p>
          <p style="color: #6b7280; font-size: 14px;">${message}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">Please contact support or check the deployment configuration.</p>
        </div>
      </div>
    `;
    throw error;
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  if (import.meta.env.DEV) {
    console.error('Global error:', event.error);
  }
  // In production, you could send to error tracking service
  // Example: Sentry.captureException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  // In production, you could send to error tracking service
  // Example: Sentry.captureException(event.reason);
  event.preventDefault(); // Prevent default browser error handling
});

// Offline detection
window.addEventListener('online', () => {
  if (import.meta.env.DEV) {
    console.log('✅ Connection restored');
  }
});

window.addEventListener('offline', () => {
  if (import.meta.env.DEV) {
    console.warn('⚠️ Connection lost');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

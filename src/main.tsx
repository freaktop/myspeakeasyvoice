import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ENV } from './config/env';

// Validate environment variables on startup
let envValidationError: Error | null = null;
try {
  // This will throw if required env vars are missing
  const _ = ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY;
  if (import.meta.env.DEV) {
    console.log('✅ Environment variables validated');
  }
} catch (error) {
  envValidationError = error instanceof Error ? error : new Error('Unknown error');
  console.error('❌ Environment validation failed:', envValidationError.message);
  
  // Show user-friendly error in production, but don't throw - let React render
  if (!import.meta.env.DEV) {
    // Render error message but still allow React to mount
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui; background: #f9fafb;">
          <div style="text-align: center; max-width: 500px; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; margin-bottom: 16px; font-size: 24px;">⚠️ Configuration Error</h1>
            <p style="color: #6b7280; margin-bottom: 8px; font-size: 16px;">The application is missing required configuration.</p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px; background: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace;">${envValidationError.message}</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">Please check the deployment configuration in Vercel dashboard.</p>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      `;
    }
    // Don't throw - this prevents React from mounting
    // The error message is already displayed above
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

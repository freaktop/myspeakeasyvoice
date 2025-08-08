import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';
import { WelcomeDashboard } from '@/components/WelcomeDashboard';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import RoutinesPage from '@/pages/RoutinesPage';
import CommandLogPage from '@/pages/CommandLogPage';
import AuthPage from '@/pages/AuthPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsPage from '@/pages/TermsPage';
import VoiceTrainingPage from '@/components/VoiceTrainingPage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Show splash screen on initial load
  useEffect(() => {
    console.log('AppContent loading state:', { loading, user: !!user, pathname: location.pathname });
    
    if (!loading) {
      // Show splash for 3 seconds, then proceed
      const timer = setTimeout(() => {
        console.log('Splash screen complete, proceeding...');
        setShowSplash(false);
        
        // If user is logged in and on home route, show welcome dashboard
        if (user && location.pathname === '/') {
          console.log('Showing welcome dashboard');
          setShowWelcome(true);
          // Auto-hide welcome after 5 seconds
          setTimeout(() => {
            console.log('Hiding welcome dashboard');
            setShowWelcome(false);
          }, 5000);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loading, user, location.pathname]);

  // Redirect logic
  useEffect(() => {
    if (!loading && !showSplash) {
      if (!user && location.pathname !== '/auth') {
        navigate('/auth');
      } else if (user && location.pathname === '/auth') {
        navigate('/');
      }
    }
  }, [user, loading, showSplash, location.pathname, navigate]);

  // Show splash screen
  if (showSplash || loading) {
    console.log('Showing splash screen:', { showSplash, loading });
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show auth page if not authenticated
  if (!user) {
    console.log('Showing auth page - no user');
    return <AuthPage />;
  }

  // Show welcome dashboard on first visit to home
  if (showWelcome && location.pathname === '/') {
    console.log('Showing welcome dashboard');
    return <WelcomeDashboard />;
  }

  // Show main app content
  console.log('Showing main app content for route:', location.pathname);
  return (
    <>
      {location.pathname === '/' && <Layout><HomePage /></Layout>}
      {location.pathname === '/settings' && <Layout><SettingsPage /></Layout>}
      {location.pathname === '/routines' && <Layout><RoutinesPage /></Layout>}
      {location.pathname === '/commands' && <Layout><CommandLogPage /></Layout>}
      {location.pathname === '/command-log' && <Layout><CommandLogPage /></Layout>}
      {location.pathname === '/voice-training' && <Layout><VoiceTrainingPage /></Layout>}
      {location.pathname === '/privacy' && <PrivacyPolicyPage />}
      {location.pathname === '/terms' && <TermsPage />}
    </>
  );
};

export default AppContent;
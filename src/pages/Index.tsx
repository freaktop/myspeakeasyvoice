
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('voice-onboarding-completed');
    
    if (!hasCompletedOnboarding) {
      navigate('/onboarding');
    }
    // If onboarding is completed, the HomePage will be shown via the Layout route
  }, [navigate]);

  return null; // This component just handles redirects
};

export default Index;

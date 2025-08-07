
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Shield, Smartphone, CheckCircle, VolumeX, Volume2, Zap, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const steps = [
    {
      icon: <Mic className="w-12 h-12 text-primary" />,
      title: "Welcome to SpeakEasy",
      description: "Your intelligent voice assistant that understands and executes commands seamlessly across your device.",
      features: [
        "Voice command recognition",
        "Smart device control", 
        "Productivity automation"
      ]
    },
    {
      icon: <Brain className="w-12 h-12 text-primary" />,
      title: "Intelligent Features",
      description: "Experience next-generation voice assistance with AI-powered understanding and contextual responses.",
      features: [
        "Natural language processing",
        "Context-aware responses",
        "Learning from your patterns"
      ]
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: "Privacy & Security",
      description: "Your voice data is processed securely with end-to-end encryption. We prioritize your privacy above all.",
      features: [
        "Local voice processing",
        "Encrypted data transmission",
        "No permanent voice storage"
      ]
    },
    {
      icon: <Smartphone className="w-12 h-12 text-primary" />,
      title: "Microphone Permission",
      description: "Enable microphone access to unlock the full potential of voice commands and start your intelligent assistant experience.",
      features: [
        "Real-time voice recognition",
        "Background listening (optional)",
        "Hands-free device control"
      ]
    }
  ];

  const handlePermissionRequest = async () => {
    setIsRequestingPermission(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionsGranted(true);
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Permission Granted",
        description: "Microphone access enabled successfully!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: "Permission Required",
        description: "Microphone access is needed for voice commands. Please enable it in your browser settings.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem('voice-onboarding-completed', 'true');
      localStorage.setItem('microphone-permission-granted', permissionsGranted.toString());
      navigate('/');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('voice-onboarding-completed', 'true');
    localStorage.setItem('microphone-permission-granted', 'false');
    navigate('/');
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isPermissionStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {currentStepData.icon}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <p className="text-center text-muted-foreground text-lg leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Features List */}
          <div className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary scale-125 shadow-lg shadow-primary/50'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Permission request for microphone step */}
          {isPermissionStep && (
            <div className="space-y-4">
              {!permissionsGranted ? (
                <div className="space-y-4">
                  <Button
                    onClick={handlePermissionRequest}
                    className="w-full h-12 text-lg font-medium relative overflow-hidden group"
                    size="lg"
                    disabled={isRequestingPermission}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform group-hover:scale-105" />
                    <div className="relative flex items-center gap-3">
                      {isRequestingPermission ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                      {isRequestingPermission ? 'Requesting Access...' : 'Grant Microphone Access'}
                    </div>
                  </Button>
                  
                  <div className="bg-muted/50 p-4 rounded-lg border border-muted">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Why do we need microphone access?</p>
                        <p className="text-xs text-muted-foreground">
                          Microphone access enables voice command recognition for hands-free control. 
                          Your audio is processed securely and locally when possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold text-lg">Permission Granted!</span>
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 h-11"
              >
                Previous
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1 h-11 relative overflow-hidden group"
              disabled={isPermissionStep && !permissionsGranted}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-transform group-hover:scale-105" />
              <span className="relative font-medium">
                {isLastStep ? 'Get Started' : 'Next'}
              </span>
            </Button>
            
            {!isPermissionStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-xs px-3"
              >
                Skip
              </Button>
            )}
          </div>

          {/* Links to legal pages */}
          <div className="flex justify-center gap-6 pt-4 border-t border-muted">
            <Button 
              variant="link" 
              className="text-xs h-auto p-0"
              onClick={() => navigate('/privacy')}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="link" 
              className="text-xs h-auto p-0"
              onClick={() => navigate('/terms')}
            >
              Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;

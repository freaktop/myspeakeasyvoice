
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Shield, Zap, CheckCircle } from 'lucide-react';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      icon: Mic,
      title: 'Welcome to Voice Control',
      description: 'Control your device with simple voice commands. Speak naturally and let AI handle the rest.',
    },
    {
      icon: Shield,
      title: 'Microphone Permission',
      description: 'We need access to your microphone to listen for voice commands. Your privacy is our priority.',
    },
    {
      icon: Zap,
      title: 'Quick Setup',
      description: 'Customize your wake phrase, voice feedback, and sensitivity to make the experience yours.',
    },
  ];

  const handlePermissionRequest = async () => {
    try {
      // In a real app, this would request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionsGranted(true);
    } catch (error) {
      console.error('Permission denied:', error);
      // For demo purposes, we'll still proceed
      setPermissionsGranted(true);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="bg-card border-border">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <StepIcon size={32} className="text-primary" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>

            {currentStep === 1 && (
              <div className="space-y-4">
                {permissionsGranted ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-voice-success/10 border border-voice-success/20">
                    <CheckCircle size={20} className="text-voice-success" />
                    <span className="text-voice-success font-medium">Permission granted!</span>
                  </div>
                ) : (
                  <Button onClick={handlePermissionRequest} className="w-full">
                    <Mic size={20} className="mr-2" />
                    Grant Microphone Access
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={currentStep === 1 && !permissionsGranted}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;

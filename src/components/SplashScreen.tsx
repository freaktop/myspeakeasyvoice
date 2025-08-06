import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { Progress } from '@/components/ui/progress';
import { Mic } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const loadingTexts = [
    'Initializing voice engine...',
    'Loading neural networks...',
    'Calibrating microphone...',
    'Setting up voice recognition...',
    'Preparing system integration...',
    'Ready to assist you!'
  ];

  useEffect(() => {
    let textIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      if (progressValue < 100) {
        progressValue += 2;
        setProgress(progressValue);
        
        // Update text based on progress
        const newTextIndex = Math.floor((progressValue / 100) * loadingTexts.length);
        if (newTextIndex !== textIndex && newTextIndex < loadingTexts.length) {
          textIndex = newTextIndex;
          setCurrentText(loadingTexts[textIndex]);
        }
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500); // Small delay before completing
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/80 to-primary/10 p-6 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-primary opacity-5"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse 3s ease-in-out infinite ${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-12 max-w-md w-full relative z-10">
        {/* Logo with enhanced glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-full blur-3xl scale-150 opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-2xl scale-125 opacity-20"></div>
          <div className="relative transform hover:scale-105 transition-transform duration-500">
            <Logo size="lg" />
          </div>
        </div>

        {/* Enhanced loading progress */}
        <div className="space-y-6">
          <div className="relative">
            <Progress value={progress} className="w-full h-3 bg-muted/20" />
            <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 blur-sm"></div>
          </div>
          <p className="text-foreground text-base font-medium animate-pulse bg-gradient-primary bg-clip-text text-transparent">
            {currentText}
          </p>
        </div>

        {/* Enhanced animated voice waves with mic icon */}
        <div className="relative flex justify-center items-center">
          {/* Central mic icon */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
            <Mic size={24} className="text-white" />
          </div>
          
          {/* Surrounding sound waves */}
          <div className="absolute inset-0 flex justify-center items-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-${40 + i * 8}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <div
                  className="w-1 bg-gradient-primary rounded-full listening-bar opacity-60"
                  style={{ 
                    height: `${16 + Math.sin(i) * 12}px`,
                    animationDelay: `${i * 0.1}s` 
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Ripple effects */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`ripple-${i}`}
              className="absolute rounded-full border-2 border-primary/20"
              style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                animation: `voice-ripple 3s ease-out infinite ${i * 0.8}s`
              }}
            />
          ))}
        </div>

        {/* Version info with gradient */}
        <div className="space-y-2">
          <p className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
            SpeakEasy v1.0
          </p>
          <p className="text-xs text-muted-foreground/70">
            AI Voice Assistant • Powered by Advanced Neural Networks
          </p>
        </div>
      </div>
    </div>
  );
};
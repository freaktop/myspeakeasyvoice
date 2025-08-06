import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { Progress } from '@/components/ui/progress';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl scale-150"></div>
          <div className="relative">
            <Logo size="lg" />
          </div>
        </div>

        {/* Loading progress */}
        <div className="space-y-4">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-muted-foreground text-sm animate-pulse">
            {currentText}
          </p>
        </div>

        {/* Animated voice waves */}
        <div className="flex justify-center items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="listening-bar bg-primary/60"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Version info */}
        <p className="text-xs text-muted-foreground/50">
          SpeakEasy v1.0 • Voice Assistant
        </p>
      </div>
    </div>
  );
};
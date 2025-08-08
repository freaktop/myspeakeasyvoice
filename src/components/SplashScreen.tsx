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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(270 100% 65%))',
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse 4s ease-in-out infinite ${i * 0.3}s`
            }}
          />
        ))}
      </div>
      
      {/* Elegant geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-accent/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
      </div>

      <div className="text-center space-y-16 max-w-lg w-full relative z-10">
        {/* Logo with premium black & gold styling */}
        <div className="relative">
          {/* Gold glow effects */}
          <div className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-40 animate-pulse" style={{ background: 'radial-gradient(circle, hsl(45 100% 60% / 0.3), transparent 70%)' }}></div>
          <div className="absolute inset-0 rounded-full blur-xl scale-125 opacity-20" style={{ background: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(270 100% 65%))' }}></div>
          
          {/* Main logo container */}
          <div className="relative transform transition-all duration-700 hover:scale-110">
            <div className="w-32 h-32 mx-auto rounded-2xl p-6 relative" style={{ background: 'linear-gradient(135deg, hsl(0 0% 8%), hsl(45 20% 12%), hsl(0 0% 5%))' }}>
              {/* Premium border */}
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(270 100% 65%), hsl(45 100% 60%))', padding: '2px' }}>
                <div className="w-full h-full rounded-2xl bg-background"></div>
              </div>
              
              {/* Logo content */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Logo size="xl" showText={false} animated={true} />
              </div>
            </div>
          </div>
          
          {/* Company name with premium styling */}
          <div className="mt-8">
            <h1 className="text-5xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, hsl(45 100% 70%), hsl(270 100% 75%), hsl(45 100% 60%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SpeakEasy
            </h1>
            <p className="text-lg text-muted-foreground font-light">AI Voice Assistant</p>
          </div>
        </div>

        {/* Premium loading progress */}
        <div className="space-y-8">
          <div className="relative">
            {/* Progress track */}
            <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-100 ease-out rounded-full"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(45 100% 60%), hsl(270 100% 65%))'
                }}
              ></div>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full opacity-30 blur-sm" style={{ background: 'linear-gradient(90deg, hsl(45 100% 60% / 0.3), hsl(270 100% 65% / 0.3))' }}></div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium mb-2" style={{ background: 'linear-gradient(135deg, hsl(45 100% 70%), hsl(270 100% 75%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {currentText}
            </p>
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
          </div>
        </div>

        {/* Premium voice visualization */}
        <div className="relative flex justify-center items-center">
          {/* Central voice icon with premium styling */}
          <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(45 100% 60%), hsl(270 100% 65%))' }}>
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <Mic size={28} style={{ color: 'hsl(45 100% 60%)' }} />
            </div>
          </div>
          
          {/* Animated sound bars in circle */}
          <div className="absolute inset-0 flex justify-center items-center">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-${50 + i * 4}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <div
                  className="w-1 rounded-full listening-bar"
                  style={{ 
                    height: `${12 + Math.sin(i * 0.5) * 8}px`,
                    background: 'linear-gradient(180deg, hsl(45 100% 60%), hsl(270 100% 65%))',
                    animationDelay: `${i * 0.08}s`,
                    opacity: 0.7
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Elegant ripple effects */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`ripple-${i}`}
              className="absolute rounded-full border opacity-20"
              style={{
                width: `${140 + i * 30}px`,
                height: `${140 + i * 30}px`,
                borderColor: i % 2 === 0 ? 'hsl(45 100% 60%)' : 'hsl(270 100% 65%)',
                animation: `voice-ripple 4s ease-out infinite ${i * 0.6}s`
              }}
            />
          ))}
        </div>

        {/* Premium version info */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20" style={{ background: 'hsl(0 0% 8% / 0.8)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(45 100% 60%)' }}></div>
            <p className="text-sm font-medium" style={{ color: 'hsl(45 100% 70%)' }}>
              SpeakEasy Pro v1.0
            </p>
          </div>
          <p className="text-sm text-muted-foreground font-light">
            Advanced AI Voice Assistant • Neural Network Powered
          </p>
        </div>
      </div>
    </div>
  );
};
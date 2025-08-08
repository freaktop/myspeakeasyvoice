
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';

export const MicButton = () => {
  const { isListening, startListening, stopListening } = useVoice();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full opacity-30 animate-pulse scale-150" style={{ background: 'var(--gradient-primary)' }}></div>
          <div className="absolute inset-0 rounded-full opacity-20 animate-ping scale-125" style={{ background: 'var(--gradient-primary)' }}></div>
        </>
      )}
      
      {/* Main mic button */}
      <button
        onClick={handleClick}
        className={`mic-button ${isListening ? 'listening' : ''} relative rounded-full border-2 transition-all duration-300 p-6 ${
          isListening 
            ? 'border-primary shadow-2xl' 
            : 'border-primary/50 hover:border-primary'
        }`}
      >
        {/* Sound waves around mic */}
        {isListening && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border-2 border-primary/30"
                style={{
                  width: `${120 + i * 30}%`,
                  height: `${120 + i * 30}%`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: `voice-ripple 2s ease-out infinite ${i * 0.3}s`
                }}
              />
            ))}
          </>
        )}
        
        {/* Mic icon */}
        {isListening ? (
          <MicOff size={32} className="text-black relative z-10" />
        ) : (
          <Mic size={32} className="text-black relative z-10" />
        )}
      </button>
      
      {/* Sound bars on sides */}
      {isListening && (
        <>
          <div className="absolute -left-12 flex flex-col items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`left-${i}`}
                className="w-1 bg-primary rounded-full"
                style={{ 
                  height: `${12 + i * 8}px`,
                  animation: `listening-bars 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s` 
                }}
              />
            ))}
          </div>
          <div className="absolute -right-12 flex flex-col items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`right-${i}`}
                className="w-1 bg-primary rounded-full"
                style={{ 
                  height: `${12 + (2 - i) * 8}px`,
                  animation: `listening-bars 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.1 + 0.15}s` 
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

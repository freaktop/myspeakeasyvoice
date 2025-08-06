
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
    <div className="relative">
      <button
        onClick={handleClick}
        className={`mic-button ${isListening ? 'listening' : ''}`}
      >
        {isListening && (
          <>
            <div className="voice-wave absolute"></div>
            <div className="voice-wave absolute"></div>
          </>
        )}
        {isListening ? (
          <MicOff size={32} className="text-white relative z-10" />
        ) : (
          <Mic size={32} className="text-white relative z-10" />
        )}
      </button>
    </div>
  );
};

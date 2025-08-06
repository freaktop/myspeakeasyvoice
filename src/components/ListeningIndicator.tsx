
import { useVoice } from '@/contexts/VoiceContext';

export const ListeningIndicator = () => {
  const { isListening } = useVoice();

  if (!isListening) return null;

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="listening-indicator">
        <div className="listening-bar"></div>
        <div className="listening-bar"></div>
        <div className="listening-bar"></div>
        <div className="listening-bar"></div>
        <div className="listening-bar"></div>
      </div>
      <p className="text-voice-listening font-medium">Listening...</p>
    </div>
  );
};

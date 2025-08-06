
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceSettings {
  wakePhrase: string;
  voiceFeedback: 'male' | 'female' | 'none';
  sensitivity: number;
}

interface VoiceContextType {
  isListening: boolean;
  lastCommand: string;
  settings: VoiceSettings;
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>({
    wakePhrase: 'Hey Assistant',
    voiceFeedback: 'female',
    sensitivity: 7,
  });

  const startListening = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      const commands = [
        'Open calendar',
        'Send message to John',
        'Turn off lights',
        'Play music',
        'Set timer for 5 minutes'
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setLastCommand(randomCommand);
      setIsListening(false);
    }, 2000 + Math.random() * 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        lastCommand,
        settings,
        startListening,
        stopListening,
        updateSettings,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

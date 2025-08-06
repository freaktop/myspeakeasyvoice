
import React, { createContext, useContext, useState, useEffect } from 'react';

interface VoiceContextType {
  isListening: boolean;
  lastCommand: string;
  commandHistory: Array<{
    id: string;
    command: string;
    action: string;
    timestamp: Date;
  }>;
  settings: {
    wakePhrase: string;
    voiceFeedback: 'male' | 'female' | 'none';
    sensitivity: number;
  };
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (newSettings: Partial<VoiceContextType['settings']>) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<VoiceContextType['commandHistory']>([]);
  const [settings, setSettings] = useState({
    wakePhrase: 'Hey Voice',
    voiceFeedback: 'female' as const,
    sensitivity: 7,
  });

  const startListening = () => {
    console.log('Starting voice recognition...');
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      const commands = [
        'Scroll down',
        'Open calendar',
        'Send message to John',
        'Play music',
        'Turn off lights',
        'Set timer for 5 minutes'
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setLastCommand(randomCommand);
      
      const newCommand = {
        id: Date.now().toString(),
        command: randomCommand,
        action: `Executed: ${randomCommand}`,
        timestamp: new Date(),
      };
      
      setCommandHistory(prev => [newCommand, ...prev]);
      setIsListening(false);
    }, 2000 + Math.random() * 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const updateSettings = (newSettings: Partial<VoiceContextType['settings']>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        lastCommand,
        commandHistory,
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

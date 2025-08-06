
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceSettings {
  wakePhrase: string;
  voiceFeedback: 'male' | 'female' | 'none';
  sensitivity: number;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  action: string;
  timestamp: Date;
}

interface VoiceContextType {
  isListening: boolean;
  lastCommand: string;
  settings: VoiceSettings;
  commandHistory: CommandHistoryItem[];
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
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
        { text: 'Open calendar', action: 'Opening Calendar app' },
        { text: 'Send message to John', action: 'Opening Messages' },
        { text: 'Turn off lights', action: 'Smart lights turned off' },
        { text: 'Play music', action: 'Starting music playback' },
        { text: 'Set timer for 5 minutes', action: '5-minute timer started' }
      ];
      const randomIndex = Math.floor(Math.random() * commands.length);
      const selectedCommand = commands[randomIndex];
      
      setLastCommand(selectedCommand.text);
      
      // Add to command history
      const newHistoryItem: CommandHistoryItem = {
        id: Date.now().toString(),
        command: selectedCommand.text,
        action: selectedCommand.action,
        timestamp: new Date(),
      };
      
      setCommandHistory(prev => [newHistoryItem, ...prev]);
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
        commandHistory,
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

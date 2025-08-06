
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceSettings {
  wakePhrase: string;
  voiceFeedback: 'male' | 'female' | 'none';
  sensitivity: number;
  preferredMode: 'personal' | 'professional';
}

interface CommandHistoryItem {
  id: string;
  command: string;
  action: string;
  timestamp: Date;
  contextMode?: string;
  success?: boolean;
}

interface VoiceContextType {
  isListening: boolean;
  lastCommand: string;
  settings: VoiceSettings;
  commandHistory: CommandHistoryItem[];
  currentMode: 'personal' | 'professional';
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  switchMode: (mode: 'personal' | 'professional') => void;
  addCustomCommand: (command: string, action: string, contextMode?: string) => Promise<void>;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { commands, history, logCommandExecution, addCommand } = useVoiceCommands();
  
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [currentMode, setCurrentMode] = useState<'personal' | 'professional'>('personal');
  
  // Convert database history to local format
  const commandHistory: CommandHistoryItem[] = history.map(item => ({
    id: item.id,
    command: item.command_text,
    action: item.action_performed,
    timestamp: new Date(item.created_at),
    contextMode: item.context_mode || undefined,
    success: item.success,
  }));

  // Settings from profile or defaults
  const settings: VoiceSettings = {
    wakePhrase: profile?.wake_phrase || 'Hey SpeakEasy',
    voiceFeedback: 'female', // Could be extended from profile
    sensitivity: Math.round((profile?.microphone_sensitivity || 0.8) * 10),
    preferredMode: profile?.preferred_mode || 'personal',
  };

  // Update current mode when profile changes
  useEffect(() => {
    if (profile?.preferred_mode) {
      setCurrentMode(profile.preferred_mode);
    }
  }, [profile?.preferred_mode]);

  const startListening = () => {
    setIsListening(true);
    
    // Enhanced simulation with context-aware commands
    setTimeout(() => {
      const personalCommands = [
        { text: 'Play my workout playlist', action: 'Starting workout music' },
        { text: 'Call mom', action: 'Calling Mom' },
        { text: 'Set dinner reminder', action: 'Dinner reminder set for 6 PM' },
        { text: 'Turn off bedroom lights', action: 'Bedroom lights turned off' },
      ];
      
      const professionalCommands = [
        { text: 'Book meeting room for 2 PM', action: 'Conference room booked' },
        { text: 'Send follow-up email to client', action: 'Draft email created' },
        { text: 'Check my calendar', action: 'Opening calendar' },
        { text: 'Start focus timer', action: '25-minute focus timer started' },
      ];
      
      const availableCommands = currentMode === 'personal' ? personalCommands : professionalCommands;
      const randomIndex = Math.floor(Math.random() * availableCommands.length);
      const selectedCommand = availableCommands[randomIndex];
      
      setLastCommand(selectedCommand.text);
      
      // Log to database if user is authenticated
      if (user) {
        setTimeout(() => {
          logCommandExecution(
            selectedCommand.text,
            selectedCommand.action,
            currentMode,
            true,
            Math.floor(Math.random() * 500) + 200
          );
        }, 0);
      }
      
      setIsListening(false);
    }, 2000 + Math.random() * 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const updateSettings = async (newSettings: Partial<VoiceSettings>) => {
    if (!profile || !user) return;

    const profileUpdates: any = {};
    
    if (newSettings.wakePhrase !== undefined) {
      profileUpdates.wake_phrase = newSettings.wakePhrase;
    }
    if (newSettings.sensitivity !== undefined) {
      profileUpdates.microphone_sensitivity = newSettings.sensitivity / 10;
    }
    if (newSettings.preferredMode !== undefined) {
      profileUpdates.preferred_mode = newSettings.preferredMode;
      setCurrentMode(newSettings.preferredMode);
    }

    await updateProfile(profileUpdates);
  };

  const switchMode = async (mode: 'personal' | 'professional') => {
    setCurrentMode(mode);
    if (profile && user) {
      await updateProfile({ preferred_mode: mode });
    }
  };

  const addCustomCommand = async (command: string, action: string, contextMode?: string) => {
    if (!user) return;
    
    await addCommand({
      command_phrase: command,
      action_type: 'custom',
      action_data: { action },
      context_mode: (contextMode as any) || 'both',
      is_active: true,
    });
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        lastCommand,
        settings,
        commandHistory,
        currentMode,
        startListening,
        stopListening,
        updateSettings,
        switchMode,
        addCustomCommand,
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


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { nativeVoiceCommands, SystemCommand } from '@/utils/NativeVoiceCommands';
import { backgroundVoiceService } from '@/utils/BackgroundVoiceService';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/components/ui/use-toast';

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
  isNativeMode: boolean;
  backgroundListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  switchMode: (mode: 'personal' | 'professional') => void;
  addCustomCommand: (command: string, action: string, contextMode?: string) => Promise<void>;
  enableBackgroundListening: () => Promise<void>;
  executeSystemCommand: (command: string) => Promise<boolean>;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { commands, history, logCommandExecution, addCommand } = useVoiceCommands();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [currentMode, setCurrentMode] = useState<'personal' | 'professional'>('personal');
  const [backgroundListening, setBackgroundListening] = useState(false);
  const [isNativeMode] = useState(Capacitor.isNativePlatform());
  
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

  // Initialize background voice service
  useEffect(() => {
    if (isNativeMode) {
      backgroundVoiceService.startBackgroundListening(handleVoiceCommand);
    }
  }, [isNativeMode]);

  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command received:', command);
    setLastCommand(command);
    
    // Try to execute as system command first
    const executed = await executeSystemCommand(command);
    
    if (executed) {
      toast({
        title: "Command Executed",
        description: `System command: ${command}`,
      });
    } else {
      // Fall back to regular voice command processing
      await processRegularCommand(command);
    }
  };

  const executeSystemCommand = async (command: string): Promise<boolean> => {
    const systemCommand = nativeVoiceCommands.parseVoiceCommand(command);
    
    if (systemCommand) {
      const success = await nativeVoiceCommands.executeCommand(systemCommand);
      
      if (user && success) {
        // Log system command execution
        await logCommandExecution(
          command,
          `System: ${systemCommand.type}`,
          currentMode,
          success,
          Date.now()
        );
      }
      
      return success;
    }
    
    return false;
  };

  const processRegularCommand = async (command: string) => {
    // Enhanced simulation with context-aware commands
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
    const matchedCommand = availableCommands.find(cmd => 
      command.toLowerCase().includes(cmd.text.toLowerCase().split(' ')[0])
    );
    
    const selectedCommand = matchedCommand || availableCommands[0];
    
    // Log to database if user is authenticated
    if (user) {
      await logCommandExecution(
        command,
        selectedCommand.action,
        currentMode,
        true,
        Math.floor(Math.random() * 500) + 200
      );
    }

    toast({
      title: "Command Processed",
      description: selectedCommand.action,
    });
  };

  const startListening = () => {
    if (isNativeMode) {
      // For native platforms, use continuous background listening
      backgroundVoiceService.startListening();
      setIsListening(true);
      
      toast({
        title: "Voice Assistant Active",
        description: "Say 'Hey SpeakEasy' followed by your command",
      });
    } else {
      // Web simulation for testing
      setIsListening(true);
      
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
        
        handleVoiceCommand(selectedCommand.text);
        setIsListening(false);
      }, 2000 + Math.random() * 3000);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (isNativeMode) {
      backgroundVoiceService.stopListening();
    }
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

  const enableBackgroundListening = async () => {
    if (!isNativeMode) {
      toast({
        title: "Background Listening",
        description: "Background listening is only available on mobile devices",
        variant: "destructive"
      });
      return;
    }

    try {
      await backgroundVoiceService.enableAlwaysListening();
      setBackgroundListening(true);
      
      toast({
        title: "Background Listening Enabled",
        description: "Voice assistant will now listen even when app is closed",
      });
    } catch (error) {
      toast({
        title: "Permission Required",
        description: "Please grant microphone and background permissions",
        variant: "destructive"
      });
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        lastCommand,
        settings,
        commandHistory,
        currentMode,
        isNativeMode,
        backgroundListening,
        startListening,
        stopListening,
        updateSettings,
        switchMode,
        addCustomCommand,
        enableBackgroundListening,
        executeSystemCommand,
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

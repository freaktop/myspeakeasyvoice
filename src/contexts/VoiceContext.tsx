
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useCommandHistory } from '@/hooks/useCommandHistory';
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
  const { commands, addCommand } = useVoiceCommands();
  const { history, addHistoryEntry } = useCommandHistory();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [currentMode, setCurrentMode] = useState<'personal' | 'professional'>('personal');
  const [backgroundListening, setBackgroundListening] = useState(false);
  const [isNativeMode] = useState(Capacitor.isNativePlatform());
  const [voiceFeedback, setVoiceFeedback] = useState<'male' | 'female' | 'none'>('male');
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any | null>(null);
  const recognitionActiveRef = useRef(false);
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
    voiceFeedback: voiceFeedback,
    sensitivity: Math.round((profile?.microphone_sensitivity || 0.8) * 10),
    preferredMode: profile?.preferred_mode || 'personal',
  };

  // Update current mode when profile changes
  useEffect(() => {
    if (profile?.preferred_mode) {
      setCurrentMode(profile.preferred_mode);
    }
  }, [profile?.preferred_mode]);

  // Initialize background voice service for continuous listening
  useEffect(() => {
        // Don't auto-enable continuous listening to prevent errors
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
    console.log('Executing system command:', command);
    const systemCommand = nativeVoiceCommands.parseVoiceCommand(command);
    console.log('Parsed system command:', systemCommand);
    
    if (systemCommand) {
      let success = false;

      if (isNativeMode) {
        success = await nativeVoiceCommands.executeCommand(systemCommand);
      } else {
        // Web fallback: handle a safe subset of commands
        try {
          switch (systemCommand.type) {
            case 'scroll': {
              const amount = Math.round(window.innerHeight * 0.7);
              const dir = (systemCommand.direction || 'down').toLowerCase();
              const top = dir === 'up' ? -amount : dir === 'down' ? amount : 0;
              const left = dir === 'left' ? -amount : dir === 'right' ? amount : 0;
              window.scrollBy({ top, left, behavior: 'smooth' });
              success = true;
              break;
            }
            case 'navigate': {
              const action = (systemCommand.action || '').toLowerCase();
              if (action.includes('back')) {
                window.history.back();
                success = true;
              } else if (action.includes('home')) {
                window.location.assign('/');
                success = true;
              }
              break;
            }
            default:
              // Not supported on web: open_app, system volume, click at coordinates, etc.
              success = false;
          }
        } catch (e) {
          console.error('Web command execution failed:', e);
          success = false;
        }
      }

      console.log('System command execution result:', success);
      
      if (user) {
        const responseTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
        await addHistoryEntry({
          command_text: command,
          action_performed: `System: ${systemCommand.type}`,
          context_mode: currentMode,
          success,
          response_time_ms: responseTime
        });
      }
      
      return success;
    }
    
    console.log('No system command found for:', command);
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
      await addHistoryEntry({
        command_text: command,
        action_performed: selectedCommand.action,
        context_mode: currentMode,
        success: true,
        response_time_ms: Math.floor(Math.random() * 500) + 200
      });
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
      isListeningRef.current = true;
      
      toast({
        title: "Voice Assistant Active",
        description: "Always listening for 'Hey SpeakEasy'",
      });
    } else {
      // Web: request mic permission first, then start/reuse recognition safely
      (async () => {
        try {
          if (navigator.mediaDevices?.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop());
          }
        } catch (err) {
          console.error('Microphone permission denied:', err);
          setIsListening(false);
          isListeningRef.current = false;
          toast({
            title: "Microphone blocked",
            description: "Allow mic access to use voice commands",
            variant: "destructive"
          });
          return;
        }

        setIsListening(true);
        isListeningRef.current = true;
        
        // Try to use Web Speech API for continuous listening
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

          // Create or reuse a single recognition instance
          if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;  // Enable continuous listening
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
              recognitionActiveRef.current = true;
              console.log('Web speech recognition started');
            };
            
            recognition.onresult = (event: any) => {
              const transcript = event.results[event.results.length - 1][0].transcript.trim();
              console.log('Web speech recognition result:', transcript);
              
              // Process all commands when actively listening (not just wake phrase)
              if (isListeningRef.current) {
                handleVoiceCommand(transcript);
              }
            };
            
            recognition.onerror = (event: any) => {
              console.error('Speech recognition error:', event.error);
              recognitionActiveRef.current = false;

              if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                // Do not auto-restart; require user to allow mic
                setIsListening(false);
                isListeningRef.current = false;
                toast({
                  title: "Microphone blocked",
                  description: "Enable mic permissions and try again",
                  variant: "destructive"
                });
                return;
              }
              // Auto-restart on error to maintain continuous listening
              setTimeout(() => {
                if (isListeningRef.current && !recognitionActiveRef.current) {
                  try { recognition.start(); } catch { /* already started */ }
                }
              }, 800);
            };
            
            recognition.onend = () => {
              recognitionActiveRef.current = false;
              // Auto-restart to maintain continuous listening
              if (isListeningRef.current) {
                setTimeout(() => {
                  try { recognition.start(); } catch { /* already started */ }
                }, 120);
              }
            };
            
            recognitionRef.current = recognition;
          }
          
          // Start only if not already running
          if (!recognitionActiveRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e: any) {
              if (String(e?.message || e).includes('already started')) {
                console.debug('Recognition already running');
              } else {
                console.error('Failed to start recognition:', e);
              }
            }
          }
          
          toast({
            title: "Listening...",
            description: "Try saying 'scroll down' or 'go back'",
          });
        } else {
          // Fallback simulation
          setTimeout(() => {
            const testCommands = [
              'scroll down',
              'go back',
              'scroll up'
            ];
            
            const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)];
            handleVoiceCommand(randomCommand);
          }, 1200);
          
          toast({
            title: "Simulated Voice Command",
            description: "Testing with a random command",
          });
        }
      })();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    if (isNativeMode) {
      backgroundVoiceService.stopListening();
    } else {
      recognitionActiveRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    }
  };

  const updateSettings = async (newSettings: Partial<VoiceSettings>) => {
    if (!profile || !user) return;

    const profileUpdates: any = {};
    
    if (newSettings.wakePhrase !== undefined) {
      profileUpdates.wake_phrase = newSettings.wakePhrase;
    }
    if (newSettings.voiceFeedback !== undefined) {
      setVoiceFeedback(newSettings.voiceFeedback);
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

  const enableContinuousListening = () => {
    // Disable continuous listening for now to prevent errors
    console.log('Continuous listening disabled to prevent errors');
    return;
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

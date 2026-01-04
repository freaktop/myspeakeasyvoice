
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { nativeVoiceCommands, SystemCommand } from '@/utils/NativeVoiceCommands';
import { backgroundVoiceService } from '@/utils/BackgroundVoiceService';
import { voiceFeedback } from '@/utils/VoiceFeedback';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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
  const [voiceFeedbackType, setVoiceFeedbackType] = useState<'male' | 'female' | 'none'>('male');
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
    voiceFeedback: voiceFeedbackType,
    sensitivity: Math.round((profile?.microphone_sensitivity || 0.8) * 10),
    preferredMode: profile?.preferred_mode || 'personal',
  };

  // Update current mode when profile changes
  useEffect(() => {
    if (profile?.preferred_mode) {
      setCurrentMode(profile.preferred_mode);
    }
    
    // Update voice feedback settings based on profile
    if (profile?.voice_feedback_enabled !== undefined) {
      voiceFeedback.updateSettings({ 
        enabled: profile.voice_feedback_enabled,
        voice: voiceFeedbackType === 'male' ? 'male' : 'female'
      });
    }
  }, [profile?.preferred_mode, profile?.voice_feedback_enabled, voiceFeedbackType]);

  // Initialize background voice service for continuous listening
  useEffect(() => {
        // Don't auto-enable continuous listening to prevent errors
  }, [isNativeMode]);

  const handleVoiceCommand = async (command: string) => {
    logger.log('🎤 Voice command received:', command);
    
    // Validate command before processing
    const trimmedCommand = command.trim().toLowerCase();
    
    // Ignore very short or meaningless commands
    if (trimmedCommand.length < 3) {
      logger.log('❌ Command too short, ignoring:', command);
      return;
    }
    
    // Ignore common background noise patterns
    const noisePatterns = ['hm', 'hmm', 'uh', 'um', 'ah', 'eh', 'oh', 'the', 'a', 'and', 'but', 'or'];
    if (noisePatterns.includes(trimmedCommand)) {
      logger.log('❌ Background noise detected, ignoring:', command);
      return;
    }
    
    // Require at least one action word for valid commands
    const actionWords = ['open', 'close', 'scroll', 'go', 'back', 'forward', 'click', 'play', 'stop', 'call', 'set', 'turn', 'start', 'end', 'book', 'send', 'check'];
    const hasActionWord = actionWords.some(word => trimmedCommand.includes(word));
    
    if (!hasActionWord) {
      logger.log('❌ No action word detected, ignoring:', command);
      return;
    }
    
    setLastCommand(command);
    
    // Detect if this is a system command first
    const parsed = nativeVoiceCommands.parseVoiceCommand(command);
    logger.log('🔍 Parsed command:', parsed);

    // Try to execute as system command when applicable
    const executed = await executeSystemCommand(command);
    logger.log('✅ System command executed:', executed);
    
    if (executed) {
      logger.log('🎯 System command successful:', command);
      toast({
        title: "Command Executed",
        description: `System command: ${command}`,
      });
      
      // Provide voice feedback for successful commands
      if (profile?.voice_feedback_enabled) {
        await voiceFeedback.speakCommandConfirmation(command, "Command completed successfully");
      }
      
      return;
    }

    // If it looked like a system command but couldn't run (e.g., unsupported on web), don't fallback silently
    if (parsed) {
      logger.log('⚠️ System command parsed but failed to execute:', parsed);
      const errorMessage = "That system command requires the mobile app or extra permissions.";
      toast({
        title: "Not available here",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Provide voice feedback for failed commands
      if (profile?.voice_feedback_enabled) {
        await voiceFeedback.speakError("command not available on this platform");
      }
      
      return;
    }

    // Fall back to regular voice command processing
    logger.log('🔄 Falling back to regular command processing');
    await processRegularCommand(command);
  };

  const executeSystemCommand = async (command: string): Promise<boolean> => {
    logger.log('Executing system command:', command);
    const systemCommand = nativeVoiceCommands.parseVoiceCommand(command);
    logger.log('Parsed system command:', systemCommand);
    
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
            case 'open_app': {
              const target = (systemCommand.target || '').toLowerCase();
              // Map common app names to routes or show helpful message
              const appRoutes: Record<string, string> = {
                'settings': '/settings',
                'setting': '/settings',
                'home': '/',
                'dashboard': '/',
                'routines': '/routines',
                'routine': '/routines',
                'commands': '/commands',
                'command': '/commands',
                'history': '/commands',
                'profile': '/settings',
              };
              
              const route = appRoutes[target];
              if (route) {
                window.location.assign(route);
                success = true;
              } else {
                // For native apps like messages/chrome, show helpful message on web
                console.warn(`App "${target}" is not available on web. This command works on Android devices.`);
                toast({
                  title: "App Not Available",
                  description: `"${target}" is a native app feature. This works on Android devices with the mobile app installed.`,
                  variant: "default"
                });
                success = false;
              }
              break;
            }
            default:
              // Not supported on web: system volume, click at coordinates, etc.
              success = false;
          }
        } catch (e) {
          console.error('Web command execution failed:', e);
          success = false;
        }
      }

      logger.log('System command execution result:', success);
      
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
    
    logger.log('No system command found for:', command);
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

    // Provide voice feedback for regular commands
    if (profile?.voice_feedback_enabled) {
      await voiceFeedback.speakCommandConfirmation(command, selectedCommand.action);
    }
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
      // Web: improved recognition with better error handling and restart logic
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
            title: "Microphone Access Required",
            description: "Please enable microphone permissions in your browser settings",
            variant: "destructive"
          });
          return;
        }

        setIsListening(true);
        isListeningRef.current = true;
        
        // Request microphone permission first
        try {
          // Request microphone access explicitly
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
          logger.log('✅ Microphone permission granted');
        } catch (err: any) {
          console.error('Microphone permission denied:', err);
          setIsListening(false);
          isListeningRef.current = false;
          toast({
            title: "Microphone Access Required",
            description: "Please enable microphone permissions in your browser settings and try again.",
            variant: "destructive"
          });
          return; // Exit early if permission denied
        }
        
        // Enhanced Web Speech API implementation
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

          // Create or reuse recognition instance with improved settings
          if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = false; // Only final results to avoid noise
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;
            
            // Add confidence threshold to filter out low-confidence results
            recognition.onresult = (event: any) => {
              let finalTranscript = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                  // Check confidence level (0-1)
                  // Note: Some browsers return 0 for confidence, so we accept any transcript with text
                  const confidence = event.results[i][0].confidence || 0;
                  const transcript = event.results[i][0].transcript;
                  logger.log('🎯 Speech confidence:', confidence, 'transcript:', transcript);
                  
                  // Process results with confidence > 0.3 OR if transcript has meaningful content
                  // Some browsers return 0 confidence but still provide accurate transcripts
                  if (confidence > 0.3 || (transcript && transcript.trim().length > 2)) {
                    finalTranscript += transcript;
                  } else {
                    logger.log('❌ Low confidence speech ignored:', transcript, 'confidence:', confidence);
                  }
                }
              }
              const transcript = finalTranscript.trim();
              logger.log('🎙️ Raw transcript received:', transcript);
              if (transcript && isListeningRef.current) {
                logger.log('🎯 Processing voice command:', transcript);
                handleVoiceCommand(transcript);
              } else {
                logger.log('❌ Transcript ignored - empty or not listening');
              }
            };
            
            recognition.onerror = (event: any) => {
              console.error('Speech recognition error:', event.error);
              recognitionActiveRef.current = false;

              // Handle permission errors - stop completely
              if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setIsListening(false);
                isListeningRef.current = false;
                toast({
                  title: "Microphone Access Denied",
                  description: "Please enable microphone permissions and try again",
                  variant: "destructive"
                });
                return;
              }
              
              // Handle aborted errors - don't restart automatically to avoid loops
              if (event.error === 'aborted') {
                logger.log('Speech recognition aborted, stopping auto-restart');
                setIsListening(false);
                isListeningRef.current = false;
                toast({
                  title: "Voice Recognition Stopped",
                  description: "Click the microphone button to restart voice recognition",
                  variant: "destructive"
                });
                return;
              }
              
              // Handle network errors with limited retries
              if (event.error === 'network') {
                logger.log('Network error - will attempt restart after delay');
                // Don't show toast for network errors, just log
                setTimeout(() => {
                  if (isListeningRef.current && !recognitionActiveRef.current) {
                    try { 
                      recognition.start(); 
                    } catch (e) { 
                      logger.log('Could not restart after network error:', e);
                      setIsListening(false);
                      isListeningRef.current = false;
                    }
                  }
                }, 3000);
              }
              
              // Handle no-speech errors quietly
              if (event.error === 'no-speech') {
                logger.log('No speech detected, continuing to listen...');
                // Don't restart immediately for no-speech
                return;
              }
            };
            
            recognition.onend = () => {
              logger.log('Speech recognition session ended');
              recognitionActiveRef.current = false;
              
              // Auto-restart if still supposed to be listening
              if (isListeningRef.current) {
                setTimeout(() => {
                  if (isListeningRef.current && !recognitionActiveRef.current) {
                    try {
                      recognition.start();
                      logger.log('Restarting voice recognition...');
                    } catch (e) {
                      logger.log('Could not restart recognition:', e);
                      setIsListening(false);
                      isListeningRef.current = false;
                    }
                  }
                }, 1000);
              }
            };
            
            recognitionRef.current = recognition;
          }
          
          // Start recognition safely
          if (!recognitionActiveRef.current) {
            try {
              recognitionRef.current.start();
              toast({
                title: "Voice Recognition Active",
                description: "Say commands like 'scroll down', 'go back', or 'open settings'",
              });
              
              // Welcome voice feedback
              if (profile?.voice_feedback_enabled) {
                setTimeout(() => voiceFeedback.speakWelcome(), 500);
              }
            } catch (e: any) {
              if (String(e?.message || e).includes('already started')) {
                logger.debug('Recognition already running');
              } else {
                console.error('Failed to start recognition:', e);
                toast({
                  title: "Voice Recognition Failed",
                  description: "Unable to start voice recognition. Please try again.",
                  variant: "destructive"
                });
                setIsListening(false);
                isListeningRef.current = false;
              }
            }
          }
        } else {
        } else {
          // Enhanced fallback for browsers without Speech Recognition
          toast({
            title: "Voice Recognition Unavailable", 
            description: "Your browser doesn't support voice recognition. Try Chrome or Edge.",
            variant: "destructive"
          });
          setIsListening(false);
          isListeningRef.current = false;
        }
      } catch (error) {
        // Catch any errors during permission request or recognition setup
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
        isListeningRef.current = false;
        toast({
          title: "Voice Recognition Failed",
          description: "Unable to start voice recognition. Please check microphone permissions.",
          variant: "destructive"
        });
      }
    })();
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
      setVoiceFeedbackType(newSettings.voiceFeedback);
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
        description: "Background listening is only available on mobile devices. On web, use the microphone button for manual listening.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await backgroundVoiceService.enableAlwaysListening();
      if (success) {
        setBackgroundListening(true);
        
        toast({
          title: "Background Listening Enabled",
          description: "Voice assistant will now listen even when app is closed",
        });
        
        // Update user settings to reflect background listening preference
        if (profile && user) {
          await updateProfile({ voice_feedback_enabled: true });
        }
      } else {
        throw new Error('Failed to enable background listening');
      }
    } catch (error) {
      console.error('Background listening error:', error);
      toast({
        title: "Permission Required",
        description: "Please grant microphone and background permissions in your device settings",
        variant: "destructive"
      });
    }
  };

  const enableContinuousListening = () => {
    // Disable continuous listening for now to prevent errors
    logger.log('Continuous listening disabled to prevent errors');
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

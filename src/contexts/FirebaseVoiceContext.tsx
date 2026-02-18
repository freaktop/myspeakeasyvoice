import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { toast } from 'sonner';
import { nativeVoiceCommands } from '@/utils/NativeVoiceCommands';
import { voiceFeedbackService } from '@/utils/VoiceFeedbackService';
import { FirebaseVoiceService, FirebaseVoiceMessage } from '@/services/firebaseVoiceService';

interface FirebaseVoiceContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  clearError: () => void;
  isVoiceFeedbackEnabled: boolean;
  toggleVoiceFeedback: () => void;
  isConnected: boolean;
  messages: FirebaseVoiceMessage[];
  sendMessage: (text: string) => void;
  sendVoiceCommand: (command: string) => void;
  isSpeaking: boolean;
}

const FirebaseVoiceContext = createContext<FirebaseVoiceContextType | undefined>(undefined);

export const FirebaseVoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<FirebaseVoiceMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);
  const voiceServiceRef = useRef<FirebaseVoiceService | null>(null);

  const clearError = () => setError(null);

  const toggleVoiceFeedback = () => {
    const newState = voiceFeedbackService.toggle();
    setIsVoiceFeedbackEnabled(newState);
    toast.success(`Voice feedback ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleError = (errorMessage: string, showToast = true) => {
    setError(errorMessage);
    if (showToast) {
      toast.error("Voice Control Error", {
        description: errorMessage,
      });
    }
    if (isVoiceFeedbackEnabled) {
      voiceFeedbackService.errorOccurred(errorMessage);
    }
  };

  const handleVoiceCommand = async (transcript: string) => {
    try {
      console.log('Voice command received:', transcript);
      
      // Parse and execute the command
      const result = nativeVoiceCommands.parseVoiceCommand(transcript);
      
      if (result) {
        console.log('Command parsed successfully:', result);
        
        // Execute the command
        const success = await nativeVoiceCommands.executeCommand(result);
        
        if (success) {
          // Provide voice feedback for successful command
          if (isVoiceFeedbackEnabled) {
            voiceFeedbackService.speak(`Command executed: ${result.action || 'Command completed'}`);
          }
          
          // Send to Firebase for processing
          if (voiceServiceRef.current) {
            await voiceServiceRef.current.sendVoiceCommand(transcript);
          }
          
          toast.success("Voice Command Executed", {
            description: result.action || 'Command executed successfully',
          });
        } else {
          throw new Error('Command execution failed');
        }
      } else {
        console.log('Command not recognized:', transcript);
        
        // Send unrecognized command to Firebase for AI processing
        if (voiceServiceRef.current) {
          await voiceServiceRef.current.sendTextMessage(transcript);
        }
        
        if (isVoiceFeedbackEnabled) {
          voiceFeedbackService.errorOccurred('Command not recognized');
        }
        
        toast.info("Voice Command", {
          description: "I didn't understand that command. Let me try to help...",
        });
      }
    } catch (error) {
      console.error('Error executing voice command:', error);
      handleError('Failed to execute voice command');
    }
  };

  const startListening = async () => {
    if (isListeningRef.current) return;

    try {
      console.log('Starting voice recognition...');
      setIsListening(true);
      isListeningRef.current = true;

      // Request permission
      const permission = await SpeechRecognition.requestPermissions();
      
      if (!permission) {
        throw new Error('Microphone permission denied');
      }

      // Start recognition
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 1,
        prompt: 'Listening for voice commands...',
        popup: false,
      });

      if (isVoiceFeedbackEnabled) {
        voiceFeedbackService.speak('Listening for voice commands');
      }

      recognitionActiveRef.current = true;

      // Listen for results
      SpeechRecognition.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0) {
          console.log('Partial result:', data.matches[0]);
        }
      });

      // Use the correct event name for final results
      SpeechRecognition.addListener('partialResults', async (data) => {
        if (data.matches && data.matches.length > 0) {
          const transcript = data.matches[0];
          console.log('Final result:', transcript);
          
          await handleVoiceCommand(transcript);
        }
      });

      toast.success("Voice Control", {
        description: "Listening for voice commands...",
      });

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      isListeningRef.current = false;
      handleError('Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    if (!isListeningRef.current) return;

    try {
      console.log('Stopping voice recognition...');
      
      await SpeechRecognition.stop();
      await SpeechRecognition.removeAllListeners();
      
      setIsListening(false);
      isListeningRef.current = false;
      recognitionActiveRef.current = false;

      if (isVoiceFeedbackEnabled) {
        voiceFeedbackService.speak('Voice recognition stopped');
      }

      toast.success("Voice Control", {
        description: "Voice recognition stopped",
      });

    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      handleError('Failed to stop voice recognition');
    }
  };

  const sendMessage = async (text: string) => {
    if (voiceServiceRef.current) {
      try {
        await voiceServiceRef.current.sendTextMessage(text);
      } catch (error) {
        handleError('Failed to send message');
      }
    }
  };

  const sendVoiceCommand = async (command: string) => {
    await handleVoiceCommand(command);
  };

  // Initialize Firebase voice service
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        voiceServiceRef.current = new FirebaseVoiceService({
          onMessage: (message) => {
            setMessages(prev => [...prev, message]);
          },
          onConnectionChange: (connected) => {
            setIsConnected(connected);
          },
          onSpeakingChange: (speaking) => {
            setIsSpeaking(speaking);
          },
          onError: (error) => {
            handleError(error);
          }
        });

        await voiceServiceRef.current.connect();
      } catch (error) {
        console.error('Failed to initialize Firebase voice service:', error);
        handleError('Failed to initialize voice service');
      }
    };

    initializeFirebase();

    // Cleanup
    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.disconnect();
      }
      stopListening();
    };
  }, []);

  const value: FirebaseVoiceContextType = {
    isListening,
    startListening,
    stopListening,
    error,
    clearError,
    isVoiceFeedbackEnabled,
    toggleVoiceFeedback,
    isConnected,
    messages,
    sendMessage,
    sendVoiceCommand,
    isSpeaking,
  };

  return (
    <FirebaseVoiceContext.Provider value={value}>
      {children}
    </FirebaseVoiceContext.Provider>
  );
};

export const useFirebaseVoice = () => {
  const context = useContext(FirebaseVoiceContext);
  if (context === undefined) {
    throw new Error('useFirebaseVoice must be used within a FirebaseVoiceProvider');
  }
  return context;
};

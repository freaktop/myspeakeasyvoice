import React, { createContext, useContext, useState, useRef } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { toast } from 'sonner';
import { nativeVoiceCommands } from '@/utils/NativeVoiceCommands';
import { voiceFeedbackService } from '@/utils/VoiceFeedbackService';

interface VoiceContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  clearError: () => void;
  isVoiceFeedbackEnabled: boolean;
  toggleVoiceFeedback: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const recognitionActiveRef = useRef(false);

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
      
      // Parse the command
      const command = nativeVoiceCommands.parseVoiceCommand(transcript);
      
      if (!command) {
        if (isVoiceFeedbackEnabled) {
          await voiceFeedbackService.noCommandDetected();
        }
        toast.info("Command Not Recognized", {
          description: "Please try speaking clearly",
        });
        return;
      }

      // Provide feedback
      if (isVoiceFeedbackEnabled) {
        await voiceFeedbackService.confirmCommand(command.type);
      }

      // Execute the command
      const success = await nativeVoiceCommands.executeCommand(command);
      
      if (success) {
        if (isVoiceFeedbackEnabled) {
          await voiceFeedbackService.commandSuccess(command.type);
        }
        toast.success("Command Executed", {
          description: `${command.type} completed successfully`,
        });
      } else {
        const errorMsg = `Failed to execute ${command.type}`;
        handleError(errorMsg);
        if (isVoiceFeedbackEnabled) {
          await voiceFeedbackService.commandFailed(command.type);
        }
      }
    } catch (error) {
      const errorMsg = `Error processing voice command: ${error}`;
      handleError(errorMsg);
    }
  };

  const startListening = () => {
  // Native (Android/iOS)
  const isNativeMode = (window as any).Capacitor?.isNativePlatform() || false;
  if (isNativeMode) {
    (async () => {
      try {
        const permissionResult: any = await SpeechRecognition.requestPermissions();
        const granted =
          permissionResult?.speechRecognition === "granted" ||
          permissionResult?.granted === true;

        if (!granted) {
          toast.error("Microphone Permission Required", {
            description: "Please enable microphone permissions in settings",
          });
          return;
        }

        const availability: any = await SpeechRecognition.available();
        const available = availability?.speechRecognition === true;

        if (!available) {
          toast.error("Speech Recognition Unavailable", {
            description: "Speech recognition is not available on this device",
          });
          return;
        }

        await SpeechRecognition.start({
          language: "en-US",
          partialResults: true,
          popup: false,
        });

        setIsListening(true);
        isListeningRef.current = true;
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast.error("Speech Error", {
          description: "Failed to start speech recognition",
        });
      }
    })();

    return;
  }

  // Web (Browser)
  (async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err) {
      console.error("Microphone permission denied:", err);
      setIsListening(false);
      isListeningRef.current = false;
      toast.error("Microphone Access Required", {
        description: "Please enable microphone permissions in your browser settings",
      });
      return;
    }

    setIsListening(true);
    isListeningRef.current = true;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const WebSpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

      if (!recognitionRef.current) {
        const recognition = new WebSpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          const transcript = finalTranscript.trim();
          if (transcript && isListeningRef.current) {
            handleVoiceCommand(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.error("Speech recognition error:", event.error);
          }
          recognitionActiveRef.current = false;

          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setIsListening(false);
            isListeningRef.current = false;
            toast.error("Microphone Access Denied", {
              description: "Please enable microphone permissions and try again",
            });
            return;
          }

          if (event.error === "aborted") {
            setIsListening(false);
            isListeningRef.current = false;
            toast.error("Voice Recognition Stopped", {
              description: "Click the microphone button to restart voice recognition",
            });
            return;
          }

          if (event.error === "network") {
            setTimeout(() => {
              if (isListeningRef.current && !recognitionActiveRef.current) {
                try {
                  recognition.start();
                } catch {
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }, 3000);
          }

          if (event.error === "no-speech") {
            return;
          }
        };

        recognition.onend = () => {
          recognitionActiveRef.current = false;

          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current && !recognitionActiveRef.current) {
                try {
                  recognition.start();
                  recognitionActiveRef.current = true;
                } catch {
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }, 1000);
          }
        };

        recognitionRef.current = recognition;
      }

      if (!recognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
          recognitionActiveRef.current = true;

          toast.success("Voice Recognition Active", {
            description: "Say commands like 'scroll down', 'go back', or 'open settings'",
          });
        } catch {
          recognitionActiveRef.current = false;
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    } else {
      toast.error("Voice Recognition Unavailable", {
        description: "Your browser doesn't support voice recognition. Try Chrome or Edge.",
      });
      setIsListening(false);
      isListeningRef.current = false;
    }
  })();
  };

  const stopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    
    const isNativeMode = (window as any).Capacitor?.isNativePlatform() || false;
    if (isNativeMode) {
      SpeechRecognition.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionActiveRef.current = false;
    }
  };

  return (
    <VoiceContext.Provider value={{ 
      isListening, 
      startListening, 
      stopListening, 
      error, 
      clearError, 
      isVoiceFeedbackEnabled, 
      toggleVoiceFeedback 
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used within a VoiceProvider");
  return context;
};

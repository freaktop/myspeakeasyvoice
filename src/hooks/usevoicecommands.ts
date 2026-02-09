import { useState, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await voiceService.requestPermissions();
    setHasPermission(granted);
  };

  const startListening = async () => {
    if (!hasPermission) {
      await checkPermissions();
      return;
    }

    setIsListening(true);
    await voiceService.startListening((text) => {
      setTranscript(text);
      processCommand(text);
    });
  };

  const stopListening = async () => {
    setIsListening(false);
    await voiceService.stopListening();
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('navigate to') || lowerCommand.includes('take me to')) {
      const destination = lowerCommand.replace(/navigate to|take me to/gi, '').trim();
      handleNavigation(destination);
    }
    else if (lowerCommand.includes('where am i')) {
      voiceService.speak('Getting your current location');
    }
    else if (lowerCommand.includes('stop')) {
      stopListening();
      voiceService.speak('Voice commands stopped');
    }
  };

  const handleNavigation = (destination: string) => {
    voiceService.speak(`Navigating to ${destination}`);
  };

  const speak = async (text: string) => {
    await voiceService.speak(text);
  };

  return {
    isListening,
    transcript,
    hasPermission,
    startListening,
    stopListening,
    speak,
  };
};
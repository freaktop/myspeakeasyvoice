// React hook for managing OpenAI Realtime API conversation
import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeChat, RealtimeMessage } from '@/utils/RealtimeChat';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const chatRef = useRef<RealtimeChat | null>(null);

  const addMessage = useCallback((message: RealtimeMessage) => {
    logger.log("Adding message:", message);
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    logger.log("Speaking changed:", speaking);
    setIsSpeaking(speaking);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    logger.log("Connection changed:", connected);
    setIsConnected(connected);
    setIsLoading(false);
    
    if (connected) {
      toast({
        title: "AI Voice Assistant Connected",
        description: "You can now have a natural conversation with your AI assistant",
      });
    } else {
      toast({
        title: "AI Voice Assistant Disconnected",
        description: "Connection to AI assistant has been lost",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleError = useCallback((error: string) => {
    console.error("Realtime chat error:", error);
    setIsLoading(false);
    toast({
      title: "AI Assistant Error",
      description: error,
      variant: "destructive"
    });
  }, [toast]);

  const connect = useCallback(async () => {
    if (chatRef.current?.connected) {
      logger.log("Already connected");
      return;
    }

    try {
      setIsLoading(true);
      logger.log("Initializing realtime chat...");
      
      chatRef.current = new RealtimeChat({
        onMessage: addMessage,
        onSpeakingChange: handleSpeakingChange,
        onConnectionChange: handleConnectionChange,
        onError: handleError
      });

      await chatRef.current.connect();
    } catch (error) {
      console.error("Error connecting to realtime chat:", error);
      setIsLoading(false);
      handleError(error instanceof Error ? error.message : "Failed to connect");
    }
  }, [addMessage, handleSpeakingChange, handleConnectionChange, handleError]);

  const disconnect = useCallback(() => {
    logger.log("Disconnecting realtime chat...");
    chatRef.current?.disconnect();
    chatRef.current = null;
    setMessages([]);
    setIsConnected(false);
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!chatRef.current?.connected) {
      throw new Error("Not connected to AI assistant");
    }

    try {
      await chatRef.current.sendTextMessage(text);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logger.log("Cleaning up realtime chat...");
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    // State
    messages,
    isConnected,
    isSpeaking,
    isLoading,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    clearMessages
  };
};
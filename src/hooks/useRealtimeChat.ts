// React hook for managing OpenAI Realtime API conversation
import { useState, useEffect, useRef, useCallback } from 'react';
import { FirebaseVoiceService, FirebaseVoiceMessage, ChatHistoryMessage } from '@/services/firebaseVoiceService';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<FirebaseVoiceMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const chatRef = useRef<FirebaseVoiceService | null>(null);

  const addMessage = useCallback((message: FirebaseVoiceMessage) => {
    console.log("Adding message:", message);
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    console.log("Speaking changed:", speaking);
    setIsSpeaking(speaking);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log("Connection changed:", connected);
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
      console.log("Already connected");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Initializing realtime chat...");
      
      chatRef.current = new FirebaseVoiceService({
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
    console.log("Disconnecting realtime chat...");
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
      const history: ChatHistoryMessage[] = messages
        .filter((m) => m.type === 'user' || m.type === 'assistant')
        .slice(-10)
        .map((m) => ({
          role: m.type,
          content: m.content,
        }));

      await chatRef.current.sendTextMessage(text, history);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up realtime chat...");
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
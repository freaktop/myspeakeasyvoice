import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type WebSocketMessage = {
  type: string;
  data?: any;
  timestamp?: number;
};

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useWebSocket(
  onMessage?: (message: WebSocketMessage) => void,
  onError?: (error: Event) => void
) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    
    if (!websocketUrl) {
      console.warn('VITE_WEBSOCKET_URL not set. WebSocket features will be disabled.');
      setStatus('error');
      return;
    }

    // Ensure we're not using functions/v1 URLs
    if (websocketUrl.includes('/functions/v1/')) {
      console.error('WebSocket URL should not use functions/v1. Please use a direct WebSocket URL.');
      setStatus('error');
      return;
    }

    // Get auth token if available
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      // Construct WebSocket URL with auth token if available
      let wsUrl = websocketUrl;
      if (token) {
        const separator = wsUrl.includes('?') ? '&' : '?';
        wsUrl = `${wsUrl}${separator}token=${encodeURIComponent(token)}`;
      }

      setStatus('connecting');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
        if (onError) {
          onError(error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          setStatus('error');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setStatus('error');
    }
  }, [onMessage, onError]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now(),
      }));
      return true;
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    isConnected: status === 'connected',
  };
}


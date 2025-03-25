import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type WebSocketMessage = {
  type: string;
  payload: any;
};

type UseWebSocketOptions = {
  onMessage?: (data: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
};

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 5000,
  } = options;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Connect to the WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      setIsConnecting(true);
      
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        
        // Authenticate the connection with user ID if logged in
        if (user) {
          socket.send(JSON.stringify({ 
            type: 'auth', 
            payload: { userId: user.id } 
          }));
        }
        
        if (onConnect) onConnect();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle specific message types
          if (data.type === 'notification') {
            toast({
              title: data.payload.type === 'error' ? 'Alert' : 'Notification',
              description: data.payload.message,
              variant: data.payload.type === 'error' ? 'destructive' : 'default',
            });
          }
          
          // Pass all messages to the callback
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (onDisconnect) onDisconnect();
        
        // Auto reconnect if enabled
        if (autoReconnect) {
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

      socketRef.current = socket;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setIsConnecting(false);
    }
  }, [user, onConnect, onDisconnect, onMessage, autoReconnect, reconnectInterval, toast]);

  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Send message to the WebSocket server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    }
    return false;
  }, []);

  // Connect when component is mounted and disconnect when unmounted
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when user changes (login/logout)
  useEffect(() => {
    if (isConnected && user) {
      // Re-authenticate with the new user ID
      sendMessage('auth', { userId: user.id });
    }
  }, [user, isConnected, sendMessage]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
  };
}

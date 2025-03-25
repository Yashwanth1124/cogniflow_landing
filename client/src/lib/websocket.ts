import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Connect to WebSocket server
  const connect = useCallback((userId: number) => {
    // Close any existing connection
    if (socket) {
      socket.close();
    }

    // Determine WebSocket protocol based on current protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        setIsConnected(true);
        // Authenticate the connection
        newSocket.send(JSON.stringify({
          type: "auth",
          userId
        }));
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          // Handle different message types
          switch (data.type) {
            case "auth_success":
              console.log("WebSocket authentication successful");
              break;
              
            case "auth_error":
              toast({
                title: "Connection Error",
                description: data.message || "Failed to authenticate WebSocket connection",
                variant: "destructive"
              });
              break;
              
            case "notifications":
              if (data.notifications && data.notifications.length > 0) {
                toast({
                  title: "New Notifications",
                  description: `You have ${data.notifications.length} unread notifications`,
                });
              }
              break;
              
            case "new_message":
              // This will be handled by the chat component via refetching messages
              break;
              
            case "error":
              toast({
                title: "Connection Error",
                description: data.message || "An error occurred",
                variant: "destructive"
              });
              break;
              
            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
      
      newSocket.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket connection closed");
      };
      
      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to establish WebSocket connection",
          variant: "destructive"
        });
      };
      
      setSocket(newSocket);
      
    } catch (error) {
      console.error("Failed to connect to WebSocket server:", error);
      toast({
        title: "Connection Error",
        description: "Failed to establish WebSocket connection",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      toast({
        title: "Connection Error",
        description: "Cannot send message, socket is not connected",
        variant: "destructive"
      });
    }
  }, [socket, toast]);

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    isConnected,
    connect,
    sendMessage
  };
}

import { WebSocketServer, WebSocket } from "ws";
import { IStorage } from "./storage";

export function setupWebSockets(wss: WebSocketServer, storage: IStorage) {
  // Store active connections
  const clients = new Map<number, WebSocket[]>();
  
  wss.on("connection", (ws) => {
    let userId: number | null = null;
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Authenticate websocket connection
        if (data.type === "auth") {
          const user = await storage.getUser(data.userId);
          if (user) {
            userId = user.id;
            
            // Register client connection
            if (!clients.has(userId)) {
              clients.set(userId, []);
            }
            clients.get(userId)!.push(ws);
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: "auth_success",
              userId
            }));
            
            // Send any pending notifications
            const notifications = await storage.getNotificationsByUserId(userId);
            const unreadNotifications = notifications.filter(n => !n.read);
            
            if (unreadNotifications.length > 0) {
              ws.send(JSON.stringify({
                type: "notifications",
                notifications: unreadNotifications
              }));
            }
          } else {
            ws.send(JSON.stringify({
              type: "auth_error",
              message: "User not found"
            }));
          }
        }
        
        // Handle messages
        if (data.type === "message" && userId) {
          // Store message in database
          const message = await storage.createMessage({
            userId,
            content: data.content,
            isAi: false
          });
          
          // Broadcast to all connected clients for this user
          broadcastToUser(userId, {
            type: "new_message",
            message
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid message format"
        }));
      }
    });
    
    ws.on("close", () => {
      if (userId) {
        // Remove this connection from the client list
        const userConnections = clients.get(userId);
        if (userConnections) {
          const index = userConnections.indexOf(ws);
          if (index !== -1) {
            userConnections.splice(index, 1);
          }
          
          // If no more connections for this user, remove from map
          if (userConnections.length === 0) {
            clients.delete(userId);
          }
        }
      }
    });
  });
  
  // Helper function to broadcast to all connected clients for a user
  function broadcastToUser(userId: number, data: any) {
    const userConnections = clients.get(userId);
    if (userConnections) {
      const message = JSON.stringify(data);
      userConnections.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }
  
  // Expose the broadcast function for use from other parts of the application
  return {
    broadcastToUser
  };
}

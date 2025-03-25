import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useWebSocket } from "@/lib/websocket";
import { ChatMessage } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  onClose?: () => void;
  minimized?: boolean;
}

export function ChatPanel({ onClose, minimized = false }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Query for chat messages
  const { data: chatMessages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages"],
    enabled: !!user,
  });

  // Set up websocket for real-time chat
  const { sendMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === "new-chat-message") {
        // Invalidate the chat messages query to re-fetch
        queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      }
    },
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat-messages", {
        content,
        timestamp: new Date(),
        isRead: false,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      
      // Trigger AI response after a short delay
      setTimeout(async () => {
        try {
          // Send AI query
          const aiResponse = await apiRequest("POST", "/api/ai/query", {
            query: message,
          });
          const aiData = await aiResponse.json();
          
          // Create a new message from AI
          await apiRequest("POST", "/api/chat-messages", {
            content: aiData.answer,
            timestamp: new Date(),
            isRead: false,
            userId: 1, // Assuming AI messages come from an admin user
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
        } catch (error) {
          console.error("Error getting AI response:", error);
        }
      }, 1000);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
      
      // Also send via WebSocket for real-time updates
      sendMessage({
        type: "chat-message",
        content: message,
        userId: user?.id,
      });
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!minimized) {
      inputRef.current?.focus();
    }
  }, [minimized]);

  if (minimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={onClose}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] shadow-lg flex flex-col">
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                AI
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">AI Assistant</CardTitle>
              <CardDescription className="text-xs">
                Ask me anything about your finances
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${
                    i % 2 === 0 ? "justify-start" : "justify-end"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[80%] ${
                      i % 2 === 0
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    } rounded-lg p-3`}
                  >
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {(!chatMessages || chatMessages.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Bot className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium">How can I help you today?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask me about your finances, invoices, or business insights.
                  </p>
                </div>
              )}
              
              {chatMessages &&
                chatMessages.map((msg) => {
                  const isCurrentUser = msg.userId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "mb-4 max-w-[80%]",
                        isCurrentUser
                          ? "ml-auto"
                          : "mr-auto flex items-start gap-2"
                      )}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isCurrentUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDistanceToNow(new Date(msg.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

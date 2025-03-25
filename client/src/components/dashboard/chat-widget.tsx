import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BrainCircuitIcon, SendIcon, XIcon } from "lucide-react";

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  userId: number;
  content: string;
  isAi: boolean;
  timestamp: Date;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user && isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { message: content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 md:w-96 shadow-xl">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-md flex items-center">
            <BrainCircuitIcon className="h-5 w-5 mr-2 text-primary" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <BrainCircuitIcon className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="font-medium">Welcome to Cogniflow AI Assistant</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask me anything about your finances, invoices, or how to use Cogniflow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isAi ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`flex ${
                        msg.isAi ? "flex-row" : "flex-row-reverse"
                      } max-w-[80%] gap-2 items-start`}
                    >
                      <Avatar className={`h-8 w-8 ${msg.isAi ? 'bg-primary' : 'bg-gray-500'}`}>
                        {msg.isAi ? (
                          <BrainCircuitIcon className="h-5 w-5 text-white" />
                        ) : (
                          <AvatarFallback>
                            {user?.fullName?.substring(0, 2) ||
                              user?.username?.substring(0, 2) ||
                              "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            msg.isAi
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <Separator />
        <CardFooter className="p-3">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

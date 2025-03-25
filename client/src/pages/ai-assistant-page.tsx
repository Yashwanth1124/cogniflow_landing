import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mic, MicOff, Send, Bot, RefreshCw, ArrowUp, BrainCircuit, Zap, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/use-websocket";

export default function AiAssistantPage() {
  const [command, setCommand] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("assistant");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<number | null>(null);
  const { toast } = useToast();

  // Setup WebSocket
  const { sendMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'chat_message') {
        refetchMessages();
      }
    }
  });

  // Fetch chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/messages"],
  });

  // Process AI command
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const res = await apiRequest('POST', '/api/ai/process-command', { command });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Command processed",
          description: data.response,
        });
        
        // Send response to chat
        sendMessage('chat_message', { 
          content: data.response,
          isBot: true 
        });
        
        // If the command triggered any action, update relevant data
        if (data.action) {
          // Invalidate queries based on the action
          if (data.action === 'create_transaction' || 
              data.action === 'generate_insight' || 
              data.action === 'analyze_data') {
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
          }
        }
      } else {
        toast({
          title: "Command failed",
          description: data.response || "Could not process your command",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
      setCommand("");
    },
    onError: (error) => {
      toast({
        title: "Error processing command",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  // Initialize speech recognition if available
  useState(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };
      
      setVoiceRecognition(recognition);
    }
  });

  const handleSendCommand = () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    // Send message to chat for display
    sendMessage('chat_message', { content: command });
    
    // Process command with AI
    processCommandMutation.mutate(command);
  };

  const toggleVoiceRecording = () => {
    if (!voiceRecognition) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }
    
    if (isRecording) {
      voiceRecognition.stop();
      setIsRecording(false);
    } else {
      setCommand("");
      voiceRecognition.start();
      setIsRecording(true);
      toast({
        title: "Voice Recognition Active",
        description: "Speak now... Start with 'Cogniflow' to use a command.",
      });
    }
  };

  // Group messages by day for history view
  const groupedMessages = messages.reduce((groups: any, message: any) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const handleHistoryItemClick = (id: number) => {
    setSelectedHistoryItem(id);
    const message = messages.find((m: any) => m.id === id);
    if (message) {
      setCommand(message.content);
    }
  };

  const renderCommandSuggestions = () => {
    const suggestions = [
      { text: "Generate a financial insight", icon: BrainCircuit },
      { text: "Create a new expense transaction", icon: ArrowUp },
      { text: "Show me revenue for this month", icon: Zap },
      { text: "What's my current balance?", icon: RefreshCw },
      { text: "What can you do?", icon: Bot },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="flex items-center p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
            onClick={() => setCommand(suggestion.text)}
          >
            <suggestion.icon className="h-5 w-5 mr-3 text-primary/70" />
            {suggestion.text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 md:ml-64">
        <Header />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Ask Cogniflow to perform tasks and analyze your business data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="px-4 py-3 border-b flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-primary" />
                      Cogniflow Virtual Assistant
                    </CardTitle>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="assistant">Assistant</TabsTrigger>
                        <TabsTrigger value="history">
                          <History className="h-4 w-4 mr-2" />
                          History
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-grow overflow-hidden">
                  <TabsContent value="assistant" className="h-full flex flex-col m-0 data-[state=inactive]:hidden">
                    <div className="p-6 flex-grow overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <Bot className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
                          <h3 className="text-lg font-medium mb-2">Welcome to Cogniflow Assistant</h3>
                          <p className="text-muted-foreground mb-8 max-w-md">
                            I can help you generate insights, create transactions, analyze data, and more. Try asking me something!
                          </p>
                          {renderCommandSuggestions()}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.isBot ? "justify-start" : "justify-end"
                              }`}
                            >
                              {message.isBot && (
                                <Avatar className="h-8 w-8 mr-2 mt-1">
                                  <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                  message.isBot
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t bg-background">
                      <div className="flex space-x-2">
                        <Button
                          variant={isRecording ? "default" : "outline"}
                          size="icon"
                          onClick={toggleVoiceRecording}
                          className={isRecording ? "bg-destructive text-destructive-foreground" : ""}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Input
                          placeholder={isRecording ? "Listening..." : "Ask Cogniflow..."}
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <Button
                          onClick={handleSendCommand}
                          disabled={!command.trim() || isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Send
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="h-full m-0 data-[state=inactive]:hidden">
                    <div className="p-4 h-full overflow-y-auto">
                      {Object.keys(groupedMessages).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                          <div>
                            <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-medium mb-2">No conversation history</h3>
                            <p className="text-muted-foreground">
                              Your conversations with the assistant will appear here
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(groupedMessages)
                            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                            .map(([date, messages]: [string, any]) => (
                              <div key={date}>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">{date}</h3>
                                <div className="space-y-2">
                                  {messages
                                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .filter((m: any) => !m.isBot)
                                    .map((message: any) => (
                                      <button
                                        key={message.id}
                                        className={`w-full text-left p-3 rounded-lg text-sm ${
                                          selectedHistoryItem === message.id
                                            ? "bg-primary/10 border border-primary/20"
                                            : "bg-muted/50 hover:bg-muted"
                                        }`}
                                        onClick={() => handleHistoryItemClick(message.id)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <span className="line-clamp-1">{message.content}</span>
                                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>AI Assistant Capabilities</CardTitle>
                  <CardDescription>
                    Things you can ask Cogniflow to do
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Generate Insights</h3>
                        <p className="text-sm text-muted-foreground">
                          "Generate financial insights for this month"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <ArrowUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Create Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                          "Create an expense of $50 for office supplies"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Generate Reports</h3>
                        <p className="text-sm text-muted-foreground">
                          "Show me the revenue report for Q2"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Check Status</h3>
                        <p className="text-sm text-muted-foreground">
                          "What's my current financial status?"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voice Commands</CardTitle>
                  <CardDescription>
                    Using your voice to control Cogniflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Click the microphone button or press these keyboard shortcuts to use voice commands:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Start recording:</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded">Alt + M</kbd></div>
                      
                      <div className="font-medium">Stop recording:</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd></div>
                      
                      <div className="font-medium">Execute command:</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd></div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted/60 rounded-md">
                      <p className="text-sm font-medium mb-2">Tips for voice commands:</p>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Start with "Hey Cogniflow" for best results</li>
                        <li>Speak clearly and naturally</li>
                        <li>Include specific amounts, dates, or categories</li>
                        <li>Review the command before sending</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={toggleVoiceRecording} 
                    className="w-full"
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Voice Command
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

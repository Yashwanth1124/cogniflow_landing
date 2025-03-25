import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandProps {
  onClose?: () => void;
  minimized?: boolean;
}

export function VoiceCommand({ onClose, minimized = false }: VoiceCommandProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [commandResult, setCommandResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // SpeechRecognition setup
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    // Browser compatibility check
    if (!('webkitSpeechRecognition' in window) && 
        !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Try using Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }
    
    // Initialize the SpeechRecognition object
    // @ts-ignore - TypeScript doesn't have the speech recognition API types
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    // @ts-ignore
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setCommandResult(null);
    };
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const command = event.results[current][0].transcript;
      setTranscript(command);
      processCommand(command);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        title: "Voice Recognition Error",
        description: event.error === 'no-speech' 
          ? "No speech was detected. Please try again." 
          : `Error: ${event.error}`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);
  
  // Process command mutation
  const processCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const res = await apiRequest('POST', '/api/voice/process', { command });
      return res.json();
    },
    onSuccess: (data) => {
      setCommandResult({
        success: data.success,
        message: data.response
      });
      if (data.success) {
        toast({
          title: "Command Executed",
          description: data.response,
        });
      } else {
        toast({
          title: "Command Not Recognized",
          description: data.response,
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      setCommandResult({
        success: false,
        message: error.message
      });
      toast({
        title: "Error Processing Command",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setProcessing(false);
    }
  });
  
  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  // Process the voice command
  const processCommand = (command: string) => {
    if (!command.trim()) return;
    
    setProcessing(true);
    processCommandMutation.mutate(command);
  };
  
  if (minimized) {
    return (
      <Button
        size="icon"
        variant={isListening ? "destructive" : "outline"}
        className="rounded-full h-12 w-12 fixed bottom-6 right-24 z-50 shadow-lg"
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
    );
  }
  
  return (
    <Card className="w-80 md:w-96 shadow-xl fixed bottom-20 right-6 z-40">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md flex items-center">
          <Mic className="h-5 w-5 mr-2 text-primary" />
          Voice Commands
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <MicOff className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="text-center space-y-2">
          {!isListening && !processing && !commandResult && (
            <p className="text-muted-foreground text-sm">
              Click the mic button and speak commands like:
              <br />
              "Generate invoice for ABC Ltd"
              <br />
              "Show me sales for last month"
              <br />
              "Create expense of $500 for office supplies"
            </p>
          )}
          
          {isListening && (
            <div className="animate-pulse text-primary font-medium">
              Listening...
              <div className="flex justify-center mt-2 space-x-1">
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          
          {transcript && (
            <div className="bg-secondary p-3 rounded-md text-sm mt-4">
              <p className="font-medium">Command:</p>
              <p>"{transcript}"</p>
            </div>
          )}
          
          {processing && (
            <div className="text-primary font-medium mt-4">
              Processing command...
              <div className="mt-2 flex justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          {commandResult && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              commandResult.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <div className="flex items-start gap-2">
                {commandResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {commandResult.success ? 'Command executed' : 'Command failed'}
                  </p>
                  <p className="text-muted-foreground">
                    {commandResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-center">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className="rounded-full h-16 w-16"
          onClick={isListening ? stopListening : startListening}
          disabled={processing}
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
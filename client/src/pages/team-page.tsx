import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/use-websocket";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Loader2,
  CheckCircle2,
  Users,
  User,
  MessageSquare
} from "lucide-react";

// Form schema for messages
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});
type MessageFormValues = z.infer<typeof messageSchema>;

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState("team");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch team members (users)
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/user/team"],
    // Using the existing users from storage since there's no specific team endpoint yet
    queryFn: async () => {
      // Simulate fetching team members
      return [
        {
          id: 1,
          username: "admin",
          email: "admin@cogniflow.com",
          fullName: "Admin User",
          role: "admin",
          department: "Management",
          location: "New York, USA",
          phone: "+1 (555) 123-4567",
          lastActive: new Date().toISOString()
        },
        {
          id: 2,
          username: "accountant",
          email: "accountant@cogniflow.com",
          fullName: "Accountant User",
          role: "accountant",
          department: "Finance",
          location: "Chicago, USA",
          phone: "+1 (555) 234-5678",
          lastActive: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          id: 3,
          username: "manager",
          email: "manager@cogniflow.com",
          fullName: "Manager User",
          role: "manager",
          department: "Operations",
          location: "San Francisco, USA",
          phone: "+1 (555) 345-6789",
          lastActive: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
          id: 4,
          username: "sarah.johnson",
          email: "sarah.johnson@cogniflow.com",
          fullName: "Sarah Johnson",
          role: "user",
          department: "Marketing",
          location: "Los Angeles, USA",
          phone: "+1 (555) 456-7890",
          lastActive: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 5,
          username: "john.smith",
          email: "john.smith@cogniflow.com",
          fullName: "John Smith",
          role: "user",
          department: "Engineering",
          location: "Boston, USA",
          phone: "+1 (555) 567-8901",
          lastActive: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
    }
  });

  // Fetch chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/messages"],
  });

  // Setup WebSocket
  const { sendMessage } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'chat_message') {
        refetchMessages();
      }
    }
  });

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user.fullName && user.fullName.toLowerCase().includes(query)) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.department && user.department.toLowerCase().includes(query))
    );
  });

  // Send message form
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  // Handle sending a message
  const onSendMessage = (values: MessageFormValues) => {
    if (!selectedUser) return;
    
    // Send via WebSocket for real-time updates
    sendMessage('chat_message', { content: values.content });
    
    // Reset form
    messageForm.reset();
    
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${selectedUser.fullName || selectedUser.username}`,
    });
  };

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 md:ml-64">
        <Header />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Team Collaboration</h1>
              <p className="text-muted-foreground">
                Manage your team and communicate in real-time
              </p>
            </div>
            <div className="mt-3 md:mt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a team member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your Cogniflow workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" placeholder="colleague@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue="user">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">Regular User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal message (optional)</Label>
                      <textarea
                        id="message"
                        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="I'd like to invite you to collaborate on our Cogniflow workspace..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Filter">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="h-[500px] overflow-y-auto p-0">
                  {isUsersLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <Users className="h-12 w-12 mb-4 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground">No team members found</p>
                      {searchQuery && (
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery("")}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {filteredUsers.map((user: any) => (
                        <li key={user.id}>
                          <button
                            className={`w-full flex items-center p-3 hover:bg-muted/50 transition-colors text-left ${
                              selectedUser?.id === user.id ? "bg-muted" : ""
                            }`}
                            onClick={() => setSelectedUser(user)}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>
                                {user.fullName ? getInitials(user.fullName) : user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {user.fullName || user.username}
                                </p>
                                <div className="ml-2 flex-shrink-0">
                                  <span className={`inline-block h-2 w-2 rounded-full ${
                                    new Date(user.lastActive).getTime() > Date.now() - 3600000
                                      ? "bg-green-500"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}></span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                {user.department ? ` • ${user.department}` : ""}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="border-t p-3 text-xs text-muted-foreground">
                  {filteredUsers.length} team member{filteredUsers.length !== 1 ? "s" : ""}
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedUser ? (
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-3 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {selectedUser.fullName 
                              ? getInitials(selectedUser.fullName) 
                              : selectedUser.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{selectedUser.fullName || selectedUser.username}</CardTitle>
                          <CardDescription className="text-xs">
                            {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                            {selectedUser.department ? ` • ${selectedUser.department}` : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="team">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </TabsTrigger>
                          <TabsTrigger value="chat">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 flex-grow overflow-hidden">
                    <TabsContent value="team" className="h-full m-0 data-[state=inactive]:hidden">
                      <div className="p-6 h-full overflow-y-auto">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span className="text-sm">{selectedUser.email}</span>
                              </div>
                              {selectedUser.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                                  <span className="text-sm">{selectedUser.phone}</span>
                                </div>
                              )}
                              {selectedUser.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                                  <span className="text-sm">{selectedUser.location}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span className="text-sm">
                                  Last active {formatRelativeTime(selectedUser.lastActive)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Activity</h3>
                            <div className="space-y-2">
                              {[...Array(3)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className="p-3 rounded-md bg-muted/50 text-sm"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">
                                      {i === 0 ? "Updated financial report" : 
                                       i === 1 ? "Created new transaction" : 
                                       "Commented on invoice #2453"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {i === 0 ? "2h ago" : 
                                       i === 1 ? "Yesterday" : 
                                       "3d ago"}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground text-xs">
                                    {i === 0 ? "Updated Q2 financial forecast with new projections" : 
                                     i === 1 ? "Added expense transaction for office supplies" : 
                                     "Left a comment regarding payment terms on invoice #2453"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Permissions</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm">Access financial reports</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm">Create transactions</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm">View team analytics</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm">Manage user permissions</span>
                                {selectedUser.role === "admin" ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="flex items-center text-muted-foreground">
                                    <span className="text-xs mr-1">Admin only</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="h-full flex flex-col m-0 data-[state=inactive]:hidden">
                      <div className="p-6 flex-grow overflow-y-auto">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                              Start a conversation with {selectedUser.fullName || selectedUser.username} using the message box below.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {messages.map((message: any) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.userId === selectedUser.id ? "justify-start" : "justify-end"
                                }`}
                              >
                                {message.userId === selectedUser.id && (
                                  <Avatar className="h-8 w-8 mr-2 mt-1">
                                    <AvatarFallback>
                                      {selectedUser.fullName 
                                        ? getInitials(selectedUser.fullName) 
                                        : selectedUser.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.userId === selectedUser.id
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
                        <Form {...messageForm}>
                          <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="flex space-x-2">
                            <FormField
                              control={messageForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder={`Message ${selectedUser.fullName || selectedUser.username}...`}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" disabled={messageForm.formState.isSubmitting}>
                              <Send className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <h3 className="text-xl font-medium mb-2">Select a team member</h3>
                    <p className="text-muted-foreground">
                      Choose a team member from the list to view their profile or start a conversation
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper Label component
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserCog, Shield, Globe, Bell, Moon, Key, Smartphone, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form schema for profile settings
const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// Form schema for security settings
const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type SecurityFormValues = z.infer<typeof securitySchema>;

// Form schema for notification settings
const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  financialAlerts: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
});
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: "",
      department: "",
      location: "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      financialAlerts: true,
      securityAlerts: true,
      marketingEmails: false,
    },
  });

  // Handle profile update
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle password update
  const passwordUpdateMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const res = await apiRequest("POST", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      securityForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle notification settings update
  const notificationUpdateMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      const res = await apiRequest("POST", "/api/user/notifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    profileUpdateMutation.mutate(values);
  };

  // Handle security form submission
  const onSecuritySubmit = (values: SecurityFormValues) => {
    passwordUpdateMutation.mutate(values);
  };

  // Handle notification form submission
  const onNotificationSubmit = (values: NotificationFormValues) => {
    notificationUpdateMutation.mutate(values);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-16 md:ml-64">
        <Header />
        <main className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <Card>
                <CardContent className="p-4">
                  <Tabs
                    orientation="vertical"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full"
                  >
                    <TabsList className="flex flex-col items-stretch h-auto bg-transparent space-y-1">
                      <TabsTrigger
                        value="profile"
                        className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger
                        value="security"
                        className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger
                        value="notifications"
                        className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </TabsTrigger>
                      <TabsTrigger
                        value="appearance"
                        className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Appearance
                      </TabsTrigger>
                      <TabsTrigger
                        value="integrations"
                        className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Integrations
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              <Card className="h-full">
                <TabsContent value="profile" className="mt-0 space-y-4">
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your personal information and profile settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-52 flex-shrink-0 flex flex-col items-center space-y-3">
                        <Avatar className="h-32 w-32">
                          <AvatarFallback className="text-3xl">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                        <div className="text-center mt-2">
                          <p className="text-sm font-medium">Account Type</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {user?.role || "User"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <FormField
                              control={profileForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={profileForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your phone number" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Used for multi-factor authentication (optional)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="department"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Finance, Marketing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="location"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. New York, USA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <Button 
                              type="submit" 
                              className="mt-4"
                              disabled={profileUpdateMutation.isPending}
                            >
                              {profileUpdateMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0 space-y-4">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                          <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={securityForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={securityForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Button 
                            type="submit" 
                            variant="default"
                            disabled={passwordUpdateMutation.isPending}
                          >
                            {passwordUpdateMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Key className="mr-2 h-4 w-4" />
                                Update Password
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable 2FA</p>
                          <p className="text-sm text-muted-foreground">
                            Enhance your account security with two-factor authentication
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="mt-4">
                        <Button variant="outline" className="mt-2">
                          <Smartphone className="mr-2 h-4 w-4" />
                          Setup Authenticator App
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-muted-foreground">
                                {navigator.userAgent}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                IP: 192.168.1.1 • Last active: Just now
                              </p>
                            </div>
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                              Current
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          Log Out of All Sessions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0 space-y-4">
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Delivery Methods</h3>
                          <div className="space-y-4">
                            <FormField
                              control={notificationForm.control}
                              name="emailNotifications"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="font-medium">Email Notifications</FormLabel>
                                    <FormDescription>
                                      Receive notifications via email
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationForm.control}
                              name="pushNotifications"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="font-medium">Push Notifications</FormLabel>
                                    <FormDescription>
                                      Receive notifications in your browser
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                          <div className="space-y-4">
                            <FormField
                              control={notificationForm.control}
                              name="financialAlerts"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="font-medium">Financial Alerts</FormLabel>
                                    <FormDescription>
                                      Notifications about transactions, invoices, and financial reports
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationForm.control}
                              name="securityAlerts"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="font-medium">Security Alerts</FormLabel>
                                    <FormDescription>
                                      Notifications about login attempts, password changes, and security concerns
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={notificationForm.control}
                              name="marketingEmails"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <div>
                                    <FormLabel className="font-medium">Marketing Emails</FormLabel>
                                    <FormDescription>
                                      Receive product updates, tips, and promotional offers
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={notificationUpdateMutation.isPending}
                        >
                          {notificationUpdateMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="appearance" className="mt-0">
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how Cogniflow looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                          <div className="flex justify-between mb-2">
                            <div className="h-4 w-4 rounded-full bg-background"></div>
                            <div className="h-4 w-4 rounded-full bg-primary"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 rounded bg-muted"></div>
                            <div className="h-2 rounded bg-muted w-3/4"></div>
                          </div>
                          <p className="text-center text-xs mt-2">Light</p>
                        </div>
                        
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary bg-gray-950 text-white">
                          <div className="flex justify-between mb-2">
                            <div className="h-4 w-4 rounded-full bg-gray-800"></div>
                            <div className="h-4 w-4 rounded-full bg-primary"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 rounded bg-gray-800"></div>
                            <div className="h-2 rounded bg-gray-800 w-3/4"></div>
                          </div>
                          <p className="text-center text-xs mt-2">Dark</p>
                        </div>
                        
                        <div className="border rounded-md p-3 cursor-pointer hover:border-primary">
                          <div className="flex justify-between mb-2">
                            <div className="h-4 w-4 rounded-full bg-background"></div>
                            <div className="h-4 w-4 rounded-full bg-primary"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 rounded bg-muted"></div>
                            <div className="h-2 rounded bg-muted w-3/4"></div>
                          </div>
                          <p className="text-center text-xs mt-2">System</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Dashboard Layout</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compact View</p>
                            <p className="text-sm text-muted-foreground">
                              Display more information in a compact layout
                            </p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Show Quick Actions</p>
                            <p className="text-sm text-muted-foreground">
                              Display quick action buttons on dashboard
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Accent Color</h3>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="h-10 w-10 bg-blue-500 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500"></div>
                        <div className="h-10 w-10 bg-green-500 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-green-500"></div>
                        <div className="h-10 w-10 bg-purple-500 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500"></div>
                        <div className="h-10 w-10 bg-amber-500 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-amber-500"></div>
                        <div className="h-10 w-10 bg-rose-500 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-rose-500"></div>
                      </div>
                    </div>
                    
                    <Button variant="default">
                      <Save className="mr-2 h-4 w-4" />
                      Save Appearance Settings
                    </Button>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="integrations" className="mt-0">
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>
                      Connect Cogniflow with other services and applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-md">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-[#34A853] text-white flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table-2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3h10a2 2 0 0 1 2 2v4"/><path d="M9 3v18"/><path d="M3 9v10a2 2 0 0 0 2 2h4"/><path d="M21 9v10a2 2 0 0 1-2 2h-4"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Google Sheets</h4>
                            <p className="text-sm text-muted-foreground">
                              Import and export data from Google Sheets
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-[#00a2ed] text-white flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium">QuickBooks</h4>
                            <p className="text-sm text-muted-foreground">
                              Sync financial data with QuickBooks
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-[#E01E5A] text-white flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Slack</h4>
                            <p className="text-sm text-muted-foreground">
                              Get notifications in your Slack workspace
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-[#0078d4] text-white flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Microsoft 365</h4>
                            <p className="text-sm text-muted-foreground">
                              Sync with Outlook calendar and Microsoft apps
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <span className="mr-2">+</span> Add Custom Integration
                    </Button>
                  </CardContent>
                </TabsContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

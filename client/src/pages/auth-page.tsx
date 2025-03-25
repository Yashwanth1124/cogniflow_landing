import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Logo } from "@/components/ui/logo";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Left Column - Authentication Forms */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Logo className="h-12 w-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {activeTab === "login" 
                ? "Sign in to your Cogniflow account to continue" 
                : "Join Cogniflow and revolutionize your business operations"}
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <LoginForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <RegisterForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="w-full md:w-1/2 bg-primary-600 p-12 hidden md:flex flex-col justify-center relative overflow-hidden h-full rounded-r-lg ml-4 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full bg-primary-600 opacity-90"></div>
        <div className="absolute top-20 left-0 w-64 h-64 bg-primary-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary-800 rounded-full filter blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg mx-auto text-white">
          <h2 className="text-3xl font-bold mb-6">
            Transform Your Business with AI-Powered ERP
          </h2>
          
          <p className="text-primary-100 mb-8 text-lg">
            Cogniflow combines artificial intelligence, blockchain, and IoT to create the most intuitive and powerful enterprise resource planning system available today.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">AI-Powered Insights</h3>
                <p className="text-primary-100">Get real-time financial forecasts and business recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Secure & Compliant</h3>
                <p className="text-primary-100">Bank-level security with blockchain verification for all transactions</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Real-Time Collaboration</h3>
                <p className="text-primary-100">Connect your entire team with integrated chat and notification system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

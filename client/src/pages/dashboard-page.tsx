import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import Overview from "@/components/dashboard/overview";
import FinanceModule from "@/components/dashboard/finance-module";
import AIInsights from "@/components/dashboard/ai-insights";
import ChatWidget from "@/components/dashboard/chat-widget";
import { useWebSocket } from "@/lib/websocket";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { connect } = useWebSocket();

  useEffect(() => {
    // Connect to WebSocket when dashboard mounts
    if (user) {
      connect(user.id);
    }
  }, [user, connect]);

  useEffect(() => {
    // If path is just /dashboard, redirect to /dashboard/overview
    if (location === "/dashboard") {
      setLocation("/dashboard/overview");
    }
  }, [location, setLocation]);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Toggle chat widget
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Logout handler
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user}
          onMenuClick={toggleMobileSidebar}
          onLogout={handleLogout}
          onChatToggle={toggleChat}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Switch>
            <Route path="/dashboard/overview" component={Overview} />
            <Route path="/dashboard/finance" component={FinanceModule} />
            <Route path="/dashboard/ai-insights" component={AIInsights} />
            <Route>
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    This module is under development
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please check back later for updates
                  </p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

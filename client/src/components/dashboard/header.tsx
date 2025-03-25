import { useState, useEffect, useRef } from "react";
import { User } from "@shared/schema";
import { Link } from "wouter";
import {
  BellIcon,
  MessageCircleIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { OfflineStatus } from "@/components/ui/offline-status";

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
  onChatToggle: () => void;
}

export default function Header({
  user,
  onMenuClick,
  onLogout,
  onChatToggle,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Get notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Check if user has unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside notifications panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-30 bg-white dark:bg-gray-900 transition-shadow duration-200 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <div className="relative hidden md:block w-72">
            <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-full"
            />
          </div>
          
          {/* Offline status indicator - desktop */}
          <div className="ml-4 hidden lg:block">
            <OfflineStatus />
          </div>
        </div>
        
        {/* Offline status indicator - mobile */}
        <div className="lg:hidden flex items-center mr-2">
          <OfflineStatus className="scale-75 transform origin-right" />
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          {/* Chat button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onChatToggle}
            aria-label="Chat"
          >
            <MessageCircleIcon className="h-5 w-5" />
          </Button>
          
          {/* Contact Support button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={() => window.open('mailto:support@cogniflow.com', '_blank')}
          >
            Contact Support
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="relative"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-medium">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </div>
                <div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            notification.createdAt
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/dashboard/notifications">
                    <a className="block text-center text-sm text-primary hover:underline">
                      View all notifications
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 rounded-full"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${
                      user?.fullName || user?.username || "User"
                    }&background=random`}
                    alt={user?.fullName || user?.username || "User"}
                  />
                  <AvatarFallback>
                    {getInitials(user?.fullName || user?.username || "User")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.fullName && (
                    <p className="font-medium">{user.fullName}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || user?.username || ""}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <a className="cursor-pointer flex w-full">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <a className="cursor-pointer flex w-full">
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Settings</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <a 
                  href="mailto:support@cogniflow.com" 
                  className="flex w-full"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 1-9 9c-2.97 0-5.57-1.47-7.15-3.71" />
                    <path d="M12 3a9 9 0 0 0-9 9v.75" />
                    <path d="M3 12.75h.75" />
                    <path d="M12 21v-9" />
                    <path d="M16.5 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  <span>Contact Support</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

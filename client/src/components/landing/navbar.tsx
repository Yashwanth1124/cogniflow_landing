import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, Sun, Moon } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && 
     window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle dark mode toggle
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <nav className={`fixed w-full z-30 transition-all duration-300 ${
      isScrolled ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/landing">
              <a className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">Cogniflow</span>
              </a>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/landing#features">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Features</a>
            </Link>
            <Link href="/landing#why-cogniflow">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Why Cogniflow</a>
            </Link>
            <Link href="/landing#demo">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Demo</a>
            </Link>
            <Link href="/landing#pricing">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Pricing</a>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            {user ? (
              <Button 
                variant="default" 
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex"
                >
                  Log in
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => navigate("/auth")}
                  className="hidden sm:inline-flex"
                >
                  Get Started
                </Button>
              </>
            )}
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="sm:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/landing#features">
                    <a className="px-3 py-2 text-lg font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Features</a>
                  </Link>
                  <Link href="/landing#why-cogniflow">
                    <a className="px-3 py-2 text-lg font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Why Cogniflow</a>
                  </Link>
                  <Link href="/landing#demo">
                    <a className="px-3 py-2 text-lg font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Demo</a>
                  </Link>
                  <Link href="/landing#pricing">
                    <a className="px-3 py-2 text-lg font-medium text-gray-700 hover:text-primary-500 dark:text-gray-300 dark:hover:text-white">Pricing</a>
                  </Link>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    {user ? (
                      <Button className="w-full" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate("/auth")}
                        >
                          Log in
                        </Button>
                        <Button 
                          className="w-full"
                          onClick={() => navigate("/auth")}
                        >
                          Get Started
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

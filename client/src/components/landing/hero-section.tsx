import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay animation to ensure it triggers after component mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-primary-500 to-accent-500 dark:from-primary-700 dark:to-accent-600 pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <motion.div 
            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Transform your business with</span>
              <span className="block text-indigo-200">AI-powered ERP</span>
            </h1>
            <p className="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Cogniflow is the next-generation enterprise resource planning platform that uses artificial intelligence to streamline your business operations, improve decision-making, and drive growth.
            </p>
            <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
              <motion.div 
                className="rounded-md shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-white text-primary-600 hover:bg-gray-50 sm:w-auto"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </motion.div>
              <motion.div 
                className="mt-3 sm:mt-0 sm:ml-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-white bg-primary-600 bg-opacity-60 hover:bg-opacity-70 border-white border-opacity-20 sm:w-auto"
                  onClick={() => {
                    const demoSection = document.getElementById("demo");
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Live Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <svg
                  className="w-full"
                  viewBox="0 0 800 450"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="800" height="450" rx="5" fill="#f1f5f9" />
                  {/* Dashboard Header */}
                  <rect y="0" width="800" height="60" fill="#3B82F6" />
                  <circle cx="30" cy="30" r="15" fill="white" fillOpacity="0.3" />
                  <rect x="60" y="20" width="120" height="20" rx="3" fill="white" fillOpacity="0.3" />
                  <rect x="650" y="20" width="120" height="20" rx="10" fill="white" fillOpacity="0.2" />
                  
                  {/* Sidebar */}
                  <rect x="0" y="60" width="200" height="390" fill="#1E40AF" />
                  <rect x="20" y="100" width="160" height="12" rx="2" fill="white" fillOpacity="0.2" />
                  <rect x="20" y="130" width="160" height="12" rx="2" fill="white" fillOpacity="0.2" />
                  <rect x="20" y="160" width="160" height="12" rx="2" fill="white" fillOpacity="0.2" />
                  <rect x="20" y="190" width="160" height="12" rx="2" fill="white" fillOpacity="0.2" />
                  <rect x="20" y="220" width="160" height="12" rx="2" fill="white" fillOpacity="0.2" />
                  
                  {/* Content */}
                  <rect x="220" y="80" width="560" height="60" rx="4" fill="#E0E7FF" />
                  <rect x="240" y="100" width="300" height="20" rx="2" fill="#6366F1" fillOpacity="0.6" />
                  
                  {/* Charts */}
                  <rect x="220" y="160" width="270" height="180" rx="4" fill="white" />
                  <path d="M240 300 L240 220 L290 260 L340 200 L390 240 L440 210 L460 300 Z" fill="#3B82F6" fillOpacity="0.2" />
                  <polyline points="240,220 290,260 340,200 390,240 440,210 460,210" stroke="#3B82F6" strokeWidth="2" fill="none" />
                  <rect x="240" y="180" width="120" height="10" rx="2" fill="#E5E7EB" />
                  
                  <rect x="510" y="160" width="270" height="180" rx="4" fill="white" />
                  <circle cx="645" cy="250" r="70" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="30" strokeOpacity="0.3" />
                  <rect x="530" y="180" width="120" height="10" rx="2" fill="#E5E7EB" />
                  
                  {/* Bottom Cards */}
                  <rect x="220" y="360" width="175" height="80" rx="4" fill="white" />
                  <rect x="240" y="380" width="80" height="10" rx="2" fill="#E5E7EB" />
                  <rect x="240" y="400" width="40" height="20" rx="2" fill="#10B981" />
                  
                  <rect x="413" y="360" width="175" height="80" rx="4" fill="white" />
                  <rect x="433" y="380" width="80" height="10" rx="2" fill="#E5E7EB" />
                  <rect x="433" y="400" width="40" height="20" rx="2" fill="#EF4444" />
                  
                  <rect x="605" y="360" width="175" height="80" rx="4" fill="white" />
                  <rect x="625" y="380" width="80" height="10" rx="2" fill="#E5E7EB" />
                  <rect x="625" y="400" width="40" height="20" rx="2" fill="#F59E0B" />
                </svg>
                
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <Button variant="default" size="icon" className="h-16 w-16 rounded-full bg-primary-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Play } from "lucide-react";

export function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [, navigate] = useLocation();
  
  const steps = [
    {
      number: "1",
      title: "Dashboard Overview",
      description: "Personalized dashboard with AI-driven insights showing financial health, workflow status, and real-time analytics."
    },
    {
      number: "2",
      title: "Financial Management",
      description: "Intelligent invoice processing, automated reconciliation, and fraud detection in real-time."
    },
    {
      number: "3",
      title: "AI Assistant Integration",
      description: "Voice-enabled AI assistant helps you generate reports, create invoices, and get insights with simple voice commands."
    },
    {
      number: "4",
      title: "Team Collaboration",
      description: "Real-time chat, notifications, and document sharing for seamless team collaboration across departments."
    }
  ];
  
  return (
    <div id="demo" className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Interactive Demo</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            See Cogniflow in action
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Explore how Cogniflow transforms your business operations with powerful AI-driven insights and automation.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div 
              className="mt-10 lg:mt-0 lg:col-span-6"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-w-16 aspect-h-9 shadow-xl rounded-xl overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 562.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="1000" height="562.5" rx="8" fill="#f8fafc" />
                  {/* Dashboard Header */}
                  <rect x="0" y="0" width="1000" height="60" fill="#3B82F6" />
                  <circle cx="30" cy="30" r="15" fill="white" fillOpacity="0.3" />
                  <rect x="60" y="20" width="120" height="20" rx="3" fill="white" fillOpacity="0.3" />
                  <circle cx="950" cy="30" r="15" fill="white" fillOpacity="0.2" />
                  <circle cx="900" cy="30" r="15" fill="white" fillOpacity="0.2" />

                  {/* Sidebar */}
                  <rect x="0" y="60" width="220" height="502.5" fill="#1E40AF" />
                  <rect x="20" y="100" width="180" height="40" rx="4" fill="#3B82F6" />
                  <rect x="30" y="115" width="20" height="10" rx="2" fill="white" fillOpacity="0.6" />
                  <rect x="60" y="110" width="120" height="20" rx="2" fill="white" fillOpacity="0.6" />
                  
                  <rect x="20" y="160" width="180" height="20" rx="2" fill="white" fillOpacity="0.1" />
                  <rect x="20" y="200" width="180" height="20" rx="2" fill="white" fillOpacity="0.1" />
                  <rect x="20" y="240" width="180" height="20" rx="2" fill="white" fillOpacity="0.1" />
                  <rect x="20" y="280" width="180" height="20" rx="2" fill="white" fillOpacity="0.1" />

                  {/* Main Content */}
                  <rect x="240" y="80" width="740" height="60" rx="4" fill="#E0E7FF" />
                  <rect x="260" y="95" width="300" height="30" rx="2" fill="#4F46E5" fillOpacity="0.7" />
                  <rect x="820" y="95" width="140" height="30" rx="15" fill="white" />

                  {/* Stats Cards */}
                  <rect x="240" y="160" width="220" height="100" rx="8" fill="white" />
                  <rect x="260" y="180" width="120" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="260" y="210" width="80" height="30" rx="2" fill="#3B82F6" fillOpacity="0.2" />
                  <circle cx="410" cy="210" r="25" fill="#10B981" fillOpacity="0.2" />
                  <path d="M400 210 L410 200 L420 210" stroke="#10B981" strokeWidth="2" />

                  <rect x="480" y="160" width="220" height="100" rx="8" fill="white" />
                  <rect x="500" y="180" width="120" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="500" y="210" width="80" height="30" rx="2" fill="#EF4444" fillOpacity="0.2" />
                  <circle cx="650" cy="210" r="25" fill="#EF4444" fillOpacity="0.2" />
                  <path d="M640 200 L650 210 L660 200" stroke="#EF4444" strokeWidth="2" />

                  <rect x="720" y="160" width="260" height="100" rx="8" fill="white" />
                  <rect x="740" y="180" width="120" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="740" y="210" width="80" height="30" rx="2" fill="#F59E0B" fillOpacity="0.2" />
                  <rect x="860" y="195" width="100" height="10" rx="5" fill="#F59E0B" fillOpacity="0.2" />
                  <rect x="860" y="215" width="80" height="10" rx="5" fill="#F59E0B" fillOpacity="0.1" />
                  <rect x="860" y="235" width="60" height="10" rx="5" fill="#F59E0B" fillOpacity="0.1" />

                  {/* Charts */}
                  <rect x="240" y="280" width="460" height="260" rx="8" fill="white" />
                  <rect x="260" y="300" width="200" height="20" rx="2" fill="#E5E7EB" />
                  <path d="M260 440 L260 380 L310 420 L360 360 L410 400 L460 380 L510 400 L560 370 L610 420 L660 380" 
                       stroke="#3B82F6" strokeWidth="3" fill="none" />
                  <rect x="260" y="480" width="50" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="340" y="480" width="50" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="420" y="480" width="50" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="500" y="480" width="50" height="15" rx="2" fill="#E5E7EB" />
                  <rect x="580" y="480" width="50" height="15" rx="2" fill="#E5E7EB" />

                  {/* AI Assistant Panel */}
                  <rect x="720" y="280" width="260" height="260" rx="8" fill="white" />
                  <rect x="740" y="300" width="150" height="20" rx="2" fill="#E5E7EB" />
                  <rect x="740" y="340" width="220" height="40" rx="20" fill="#E5E7EB" />
                  <rect x="740" y="400" width="180" height="40" rx="20" fill="#3B82F6" fillOpacity="0.1" />
                  <rect x="780" y="460" width="180" height="40" rx="20" fill="#E5E7EB" />
                  <rect x="740" y="510" width="220" height="15" rx="7.5" fill="#F3F4F6" />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="default" size="icon" className="h-16 w-16 rounded-full bg-primary-500 text-white shadow-lg">
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="mt-10 mb-10 lg:mt-0">
                {/* Stepped demonstration of features */}
                <dl className="space-y-6">
                  {steps.map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                    >
                      <dt>
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                          <span className="text-lg font-bold">{step.number}</span>
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{step.title}</p>
                      </dt>
                      <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                        {step.description}
                      </dd>
                    </motion.div>
                  ))}
                </dl>
              </div>
              
              <motion.div 
                className="mt-10 flex justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button 
                  variant="default"
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={() => navigate("/auth")}
                >
                  Schedule a full demo
                </Button>
                <Button 
                  variant="outline"
                  className="ml-4 border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => navigate("/auth")}
                >
                  Sign up for trial
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

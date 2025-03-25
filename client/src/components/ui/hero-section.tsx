import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo: () => void;
}

export default function HeroSection({ onGetStarted, onWatchDemo }: HeroSectionProps) {
  return (
    <section className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <motion.div 
            className="w-full lg:w-1/2 mb-12 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
              Revolutionize Your Business with
              <span className="text-primary dark:text-primary-400"> AI-Powered ERP</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              Cogniflow combines artificial intelligence, blockchain, and IoT to create the most intuitive and powerful enterprise resource planning system available today.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button size="lg" onClick={onGetStarted} className="px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={onWatchDemo} className="px-8">
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center text-gray-500 dark:text-gray-400">
              <span className="mr-2">Trusted by 2000+ companies worldwide</span>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <svg key={index} className="h-5 w-auto" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z"/>
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-1/2 lg:pl-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Cogniflow Dashboard" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <Button onClick={onWatchDemo} className="px-6 py-6 bg-white text-primary hover:bg-gray-100">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="flex justify-around mt-6 space-x-4">
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-primary dark:text-primary-400">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-primary dark:text-primary-400">35%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</div>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
                <div className="text-2xl font-bold text-primary dark:text-primary-400">3.5x</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Productivity</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-primary-300/20 dark:bg-primary-900/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-900/20 rounded-full filter blur-3xl"></div>
    </section>
  );
}

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [, navigate] = useLocation();
  
  return (
    <div id="signup" className="py-12 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          className="lg:flex lg:items-center lg:justify-between"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="block">Ready to transform your business?</span>
            <span className="block text-indigo-100">Get started with Cogniflow today.</span>
          </motion.h2>
          <motion.div 
            className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="inline-flex rounded-md shadow">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-50"
                onClick={() => navigate("/auth")}
              >
                Start free trial
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                size="lg"
                className="bg-primary-700 hover:bg-primary-800"
                onClick={() => navigate("/auth")}
              >
                Schedule a demo
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

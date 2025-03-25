import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  ChartLine, 
  Robot, 
  Users, 
  MessageSquare, 
  Link, 
  Shield 
} from "lucide-react";

const features = [
  {
    title: "Finance Module",
    description: [
      "AI-powered financial insights",
      "Automated ledger & accounting",
      "Smart invoicing with ML validation",
      "Fraud detection & prevention"
    ],
    icon: ChartLine,
    color: "bg-primary-500"
  },
  {
    title: "AI Automation",
    description: [
      "Smart project tracking & updates",
      "Predictive analytics for business growth",
      "Automated document processing (OCR)",
      "Voice-enabled AI assistant"
    ],
    icon: Robot,
    color: "bg-accent-500"
  },
  {
    title: "HR & Compliance",
    description: [
      "Streamlined payroll management",
      "Employee performance tracking",
      "Automated compliance reporting",
      "Legal requirement monitoring"
    ],
    icon: Users,
    color: "bg-secondary-500"
  },
  {
    title: "Real-time Collaboration",
    description: [
      "Team chat & notifications",
      "Document sharing & collaboration",
      "Task management & delegation",
      "WebSockets for instant updates"
    ],
    icon: MessageSquare,
    color: "bg-primary-500"
  },
  {
    title: "Blockchain & Smart Contracts",
    description: [
      "Immutable transaction records",
      "Smart contract procurement",
      "Automated supplier payments",
      "Enhanced security & transparency"
    ],
    icon: Link,
    color: "bg-accent-500"
  },
  {
    title: "Security & Access Control",
    description: [
      "Role-based access control (RBAC)",
      "Multi-factor authentication",
      "Encrypted data storage",
      "Comprehensive audit logging"
    ],
    icon: Shield,
    color: "bg-secondary-500"
  }
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <div id="features" className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to run your business
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Cogniflow combines advanced AI technology with enterprise-grade ERP functionality to optimize your business operations.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md"
                variants={itemVariants}
              >
                <div>
                  <div className={`flex items-center justify-center h-12 w-12 rounded-md ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.title}</h3>
                  <div className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    <ul className="list-disc list-inside space-y-1">
                      {feature.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

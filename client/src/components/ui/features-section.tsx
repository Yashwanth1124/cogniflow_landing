import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

const features = [
  {
    icon: "chart-line",
    title: "Finance Module",
    description: "AI-powered financial insights, ledger tracking, and automated invoicing with fraud detection and real-time currency conversion.",
    benefits: [
      "Intelligent financial forecasting",
      "Real-time multi-currency support",
      "Automated invoice processing"
    ],
    color: "primary"
  },
  {
    icon: "robot",
    title: "AI Automation",
    description: "Smart project tracking, predictive analytics, and AI-powered workflows that optimize your business processes.",
    benefits: [
      "Predictive supply chain management",
      "Voice-activated ERP assistant",
      "Automated document processing"
    ],
    color: "purple"
  },
  {
    icon: "users",
    title: "HR & Compliance",
    description: "Streamlined payroll, employee management, and automated compliance tracking to keep your business running smoothly.",
    benefits: [
      "Intelligent payroll processing",
      "Automated compliance reporting",
      "Employee performance analytics"
    ],
    color: "green"
  },
  {
    icon: "link",
    title: "Blockchain Integration",
    description: "Secure, transparent transactions and smart contract procurement to enhance trust and reduce fraud.",
    benefits: [
      "Immutable transaction records",
      "Smart contract automation",
      "Enhanced supply chain visibility"
    ],
    color: "yellow"
  },
  {
    icon: "microchip",
    title: "IoT Integration",
    description: "Asset tracking and predictive maintenance powered by IoT sensors to maximize operational efficiency.",
    benefits: [
      "Real-time equipment monitoring",
      "Predictive maintenance alerts",
      "Automated inventory management"
    ],
    color: "purple"
  },
  {
    icon: "shield",
    title: "Security & Compliance",
    description: "Robust authentication, role-based access control, and automated compliance reporting to protect your data.",
    benefits: [
      "Multi-factor authentication",
      "Role-based access control",
      "Comprehensive audit logging"
    ],
    color: "red"
  }
];

// Map to get icons
const getIcon = (iconName: string) => {
  switch (iconName) {
    case "chart-line":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
      </svg>;
    case "robot":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
      </svg>;
    case "users":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>;
    case "link":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>;
    case "microchip":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
      </svg>;
    case "shield":
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>;
    default:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>;
  }
};

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features for Modern Businesses</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Cogniflow's comprehensive suite of tools helps you streamline operations, automate workflows, and gain invaluable insights.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/50 rounded-lg flex items-center justify-center mb-4`}>
                    {getIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  <ul className="mt-4 space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

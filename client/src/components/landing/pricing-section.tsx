import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline";
};

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small businesses just getting started with ERP.",
    features: [
      "Core ERP functionality",
      "5 user accounts",
      "Basic financial reporting",
      "Email support"
    ],
    buttonText: "Get started",
    buttonVariant: "outline"
  },
  {
    name: "Professional",
    price: "$149",
    description: "Advanced features for growing businesses with complex needs.",
    features: [
      "Everything in Starter, plus:",
      "20 user accounts",
      "AI-powered insights",
      "Advanced financial reporting",
      "Priority support"
    ],
    popular: true,
    buttonText: "Get started",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    price: "$499",
    description: "Full-featured solution for large organizations with custom needs.",
    features: [
      "Everything in Professional, plus:",
      "Unlimited users",
      "Blockchain integration",
      "Voice command capabilities",
      "Custom integrations",
      "Dedicated account manager"
    ],
    buttonText: "Contact sales",
    buttonVariant: "outline"
  }
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [, navigate] = useLocation();
  
  return (
    <div id="pricing" className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Choose the plan that works best for your business needs.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {pricingTiers.map((tier, index) => (
            <motion.div 
              key={index}
              className={`relative p-6 rounded-lg ${tier.popular 
                ? "shadow-lg border-2 border-primary-500" 
                : "shadow-sm border border-gray-200 dark:border-gray-700"} 
                bg-white dark:bg-gray-900 flex flex-col`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary-500 text-white">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                <p className="mt-6 text-gray-500 dark:text-gray-400">{tier.description}</p>

                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-base text-gray-500 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button 
                  variant={tier.buttonVariant}
                  className={`w-full ${tier.buttonVariant === "outline" 
                    ? "bg-primary-50 dark:bg-gray-800 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-700 border-primary-300 dark:border-gray-600" 
                    : "bg-primary-600 hover:bg-primary-700 text-white"}`}
                  onClick={() => navigate("/auth")}
                >
                  {tier.buttonText}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ data
const faqItems = [
  {
    question: "How does Cogniflow's AI technology work?",
    answer: "Cogniflow uses a combination of machine learning, natural language processing, and predictive analytics to analyze your business data and provide actionable insights. The system continuously learns from your data patterns to improve its recommendations over time."
  },
  {
    question: "Is my data secure with Cogniflow?",
    answer: "Absolutely. Cogniflow employs enterprise-grade security measures including AES-256 encryption, role-based access control, multi-factor authentication, and regular security audits. Your data is stored in SOC 2 compliant data centers with 24/7 monitoring."
  },
  {
    question: "How long does implementation take?",
    answer: "Most businesses can be up and running with Cogniflow within 2-4 weeks, depending on the complexity of your operations and data migration needs. Our implementation team works closely with you to ensure a smooth transition with minimal disruption to your business."
  },
  {
    question: "Can Cogniflow integrate with my existing software?",
    answer: "Yes, Cogniflow offers robust API integration capabilities that allow it to connect with popular business software including Salesforce, QuickBooks, SAP, Zoho, and many others. We also offer custom integration services for specialized systems."
  },
  {
    question: "What kind of support do you offer?",
    answer: "Cogniflow provides 24/7 support through multiple channels including email, chat, and phone. Professional and Enterprise plans include priority support with dedicated account managers. We also offer comprehensive documentation, video tutorials, and regular webinars."
  }
];

export function FaqSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">FAQ</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently asked questions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Find answers to common questions about Cogniflow.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
              >
                <AccordionItem value={`item-${index}`} className="bg-white dark:bg-gray-900 shadow overflow-hidden rounded-md border-0">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}

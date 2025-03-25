import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const faqItems = [
    {
      id: "1",
      question: "How quickly can we implement Cogniflow?",
      answer: "Unlike traditional ERP systems that take months to implement, Cogniflow can be fully operational in as little as 2-4 weeks. Our AI-powered setup wizard and pre-configured templates allow for rapid deployment, and our team provides comprehensive onboarding support to ensure a smooth transition."
    },
    {
      id: "2",
      question: "How does Cogniflow protect our data?",
      answer: "Cogniflow employs enterprise-grade security measures including AES-256 encryption for sensitive data, multi-factor authentication, role-based access control, and comprehensive audit logging. Our blockchain integration provides an additional layer of security by creating immutable records of all transactions. We also maintain compliance with GDPR, HIPAA, SOC 2, and other industry standards."
    },
    {
      id: "3",
      question: "Can Cogniflow integrate with our existing systems?",
      answer: "Yes, Cogniflow is designed for seamless integration with your existing software ecosystem. We offer pre-built connectors for popular platforms like Salesforce, QuickBooks, Shopify, and many others. Our robust API and webhooks allow for custom integrations with any system, and our development team can assist with creating specialized connectors for your unique requirements."
    },
    {
      id: "4",
      question: "What kind of support does Cogniflow provide?",
      answer: "We offer 24/7 technical support through multiple channels including phone, email, and live chat. Our premium support plans include dedicated account managers and regular strategy sessions. All customers have access to our comprehensive knowledge base, video tutorials, and regular webinars. Additionally, the AI-powered virtual assistant within Cogniflow can answer many questions and guide users through common tasks."
    },
    {
      id: "5",
      question: "Can Cogniflow scale with our business?",
      answer: "Absolutely. Cogniflow is built on a highly scalable, cloud-native architecture that can grow with your business. Whether you're a startup with 10 employees or an enterprise with 10,000, our platform adjusts automatically to your needs. Our modular approach allows you to start with essential modules and add functionality as your requirements evolve, ensuring you only pay for what you need."
    }
  ];
  
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Find answers to common questions about Cogniflow.</p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem value={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                  <AccordionTrigger className="px-5 py-4 text-lg font-medium text-gray-900 dark:text-white hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pt-0 text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">Still have questions? Contact our support team for assistance.</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Contact Support</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <ContactForm onClose={() => document.querySelector('dialog')?.close()} />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
}

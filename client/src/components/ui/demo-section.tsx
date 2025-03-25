import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface DemoSectionProps {
  onScheduleDemo: () => void;
}

export default function DemoSection({ onScheduleDemo }: DemoSectionProps) {
  const demoTopics = [
    {
      number: 1,
      title: "Financial Dashboard",
      description: "The AI-powered financial dashboard provides real-time insights into your company's financial health, with predictive analytics and anomaly detection."
    },
    {
      number: 2,
      title: "AI Assistant & Automation",
      description: "See how the AI assistant can automate routine tasks, answer complex queries, and help you make data-driven decisions faster than ever before."
    },
    {
      number: 3,
      title: "Blockchain & Security",
      description: "Learn how Cogniflow's blockchain integration ensures secure, transparent transactions and provides immutable audit logs for compliance."
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">See Cogniflow in Action</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Watch our interactive demo to discover how Cogniflow can transform your business operations.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 dark:bg-black/30">
                  <Button variant="default" size="lg" className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Button>
                  <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Full Product Demo</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">10:24 • See all Cogniflow features in action</p>
                      </div>
                    </div>
                  </div>
                </div>
                <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Cogniflow Dashboard Demo" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-8">
            {demoTopics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary dark:text-primary-400 font-bold">{topic.number}</span>
                      </div>
                      <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">{topic.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{topic.description}</p>
                    <div className="mt-4">
                      <Button variant="link" className="text-primary hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-0 h-auto">
                        Watch this section
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button size="lg" onClick={onScheduleDemo}>
            Schedule a Personalized Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

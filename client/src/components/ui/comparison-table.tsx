import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { CheckIcon, XIcon } from "lucide-react";

interface ComparisonTableProps {
  onStartTrial: () => void;
}

export default function ComparisonTable({ onStartTrial }: ComparisonTableProps) {
  const comparisonData = [
    {
      feature: "AI Capabilities",
      cogniflow: { value: "Advanced", positive: true },
      sap: { value: "Basic", positive: true, limited: true },
      oracle: { value: "Basic", positive: true, limited: true },
      zoho: { value: "Limited", positive: true, limited: true }
    },
    {
      feature: "Blockchain Integration",
      cogniflow: { value: "Native", positive: true },
      sap: { value: "Add-on", positive: false },
      oracle: { value: "Add-on", positive: false },
      zoho: { value: "None", positive: false }
    },
    {
      feature: "Setup Time",
      cogniflow: { value: "Days", positive: true },
      sap: { value: "Months", positive: false },
      oracle: { value: "Months", positive: false },
      zoho: { value: "Weeks", positive: true, limited: true }
    },
    {
      feature: "Implementation Cost",
      cogniflow: { value: "Low", positive: true },
      sap: { value: "Very High", positive: false },
      oracle: { value: "High", positive: false },
      zoho: { value: "Medium", positive: true, limited: true }
    },
    {
      feature: "Mobile Experience",
      cogniflow: { value: "Excellent", positive: true },
      sap: { value: "Good", positive: true, limited: true },
      oracle: { value: "Good", positive: true, limited: true },
      zoho: { value: "Very Good", positive: true }
    },
    {
      feature: "Subscription Cost",
      cogniflow: { value: "$$ (Affordable)", positive: true },
      sap: { value: "$$$$ (Expensive)", positive: false },
      oracle: { value: "$$$$ (Expensive)", positive: false },
      zoho: { value: "$$$ (Moderate)", positive: true, limited: true }
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Cogniflow?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">See how Cogniflow compares to traditional ERP solutions and discover the advantages of our next-generation platform.</p>
        </motion.div>
        
        <motion.div 
          className="overflow-x-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                <th className="p-4 border border-gray-200 dark:border-gray-700 min-w-[200px]"></th>
                <th className="p-4 border border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/30">
                  <div className="flex items-center justify-center">
                    <Logo className="h-8 w-8 text-primary dark:text-primary-400 mr-2" />
                    <span className="text-xl font-bold text-primary dark:text-primary-400">Cogniflow</span>
                  </div>
                </th>
                <th className="p-4 border border-gray-200 dark:border-gray-700 min-w-[180px]">SAP</th>
                <th className="p-4 border border-gray-200 dark:border-gray-700 min-w-[180px]">Oracle</th>
                <th className="p-4 border border-gray-200 dark:border-gray-700 min-w-[180px]">Zoho</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index}>
                  <td className="p-4 border border-gray-200 dark:border-gray-700 font-medium">{row.feature}</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/30 text-center">
                    <span className={`text-${row.cogniflow.positive ? 'green' : 'red'}-600 dark:text-${row.cogniflow.positive ? 'green' : 'red'}-500`}>
                      {row.cogniflow.positive ? <CheckIcon className="inline h-5 w-5 mr-1" /> : <XIcon className="inline h-5 w-5 mr-1" />}
                      <span className="ml-1 font-medium">{row.cogniflow.value}</span>
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <span className={`text-${row.sap.positive ? (row.sap.limited ? 'yellow' : 'green') : 'red'}-600 dark:text-${row.sap.positive ? (row.sap.limited ? 'yellow' : 'green') : 'red'}-500`}>
                      {row.sap.positive ? <CheckIcon className="inline h-5 w-5 mr-1" /> : <XIcon className="inline h-5 w-5 mr-1" />}
                      <span className="ml-1 font-medium">{row.sap.value}</span>
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <span className={`text-${row.oracle.positive ? (row.oracle.limited ? 'yellow' : 'green') : 'red'}-600 dark:text-${row.oracle.positive ? (row.oracle.limited ? 'yellow' : 'green') : 'red'}-500`}>
                      {row.oracle.positive ? <CheckIcon className="inline h-5 w-5 mr-1" /> : <XIcon className="inline h-5 w-5 mr-1" />}
                      <span className="ml-1 font-medium">{row.oracle.value}</span>
                    </span>
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">
                    <span className={`text-${row.zoho.positive ? (row.zoho.limited ? 'yellow' : 'green') : 'red'}-600 dark:text-${row.zoho.positive ? (row.zoho.limited ? 'yellow' : 'green') : 'red'}-500`}>
                      {row.zoho.positive ? <CheckIcon className="inline h-5 w-5 mr-1" /> : <XIcon className="inline h-5 w-5 mr-1" />}
                      <span className="ml-1 font-medium">{row.zoho.value}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button size="lg" onClick={onStartTrial}>
            Start Your Free Trial Today
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

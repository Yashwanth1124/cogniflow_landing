import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, MinusCircle, XCircle } from "lucide-react";

// Comparison features data
const comparisonFeatures = [
  {
    feature: "AI-Powered Automation",
    cogniflow: true,
    sap: "partial",
    zoho: false,
    others: false
  },
  {
    feature: "Blockchain Integration",
    cogniflow: true,
    sap: false,
    zoho: false,
    others: false
  },
  {
    feature: "Real-Time Analytics",
    cogniflow: true,
    sap: true,
    zoho: "partial",
    others: "partial"
  },
  {
    feature: "Voice Commands",
    cogniflow: true,
    sap: false,
    zoho: false,
    others: false
  },
  {
    feature: "Deployment Flexibility",
    cogniflow: true,
    sap: "partial",
    zoho: true,
    others: "partial"
  }
];

// Helper component for displaying status icons
const StatusIcon = ({ status }: { status: boolean | string }) => {
  if (status === true) {
    return <span className="text-green-500"><CheckCircle className="h-5 w-5 inline" /></span>;
  } else if (status === "partial") {
    return <span className="text-yellow-500"><MinusCircle className="h-5 w-5 inline" /></span>;
  } else {
    return <span className="text-red-500"><XCircle className="h-5 w-5 inline" /></span>;
  }
};

export function WhyChooseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <div id="why-cogniflow" className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Why Choose Cogniflow</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Superior to traditional ERP systems
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            See how Cogniflow compares to other leading ERP solutions in the market.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-12 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-lg shadow-lg overflow-hidden">
                <div className="bg-white dark:bg-gray-900 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                          Features
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                          Cogniflow
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                          SAP
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                          Zoho
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                          Others
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisonFeatures.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.feature}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                            <StatusIcon status={item.cogniflow} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                            <StatusIcon status={item.sap} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                            <StatusIcon status={item.zoho} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                            <StatusIcon status={item.others} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

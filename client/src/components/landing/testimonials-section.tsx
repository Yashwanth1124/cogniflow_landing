import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

// Testimonial data
const testimonials = [
  {
    content: "Cogniflow has transformed how we manage our finances. The AI-powered insights have helped us identify cost-saving opportunities we never knew existed.",
    author: "Sarah Johnson",
    role: "CFO, TechStart Inc.",
    rating: 5
  },
  {
    content: "The blockchain integration for our procurement processes has eliminated disputes with suppliers and streamlined our entire supply chain.",
    author: "Michael Chen",
    role: "Operations Director, Global Logistics",
    rating: 5
  },
  {
    content: "The voice-enabled assistant has made it incredibly easy for our team to generate reports and get insights without navigating through complex menus.",
    author: "David Rodriguez",
    role: "CEO, Innovate Solutions",
    rating: 4.5
  }
];

// Helper to render stars based on rating
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex flex-row text-yellow-400">
      {[...Array(5)].map((_, i) => {
        if (i < Math.floor(rating)) {
          return <Star key={i} className="h-4 w-4 fill-current" />;
        } else if (i < Math.ceil(rating) && !Number.isInteger(rating)) {
          return (
            <div key={i} className="relative">
              <Star className="h-4 w-4 fill-current" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-white dark:bg-gray-800"></div>
            </div>
          );
        } else {
          return <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />;
        }
      })}
    </div>
  );
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  return (
    <div className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by businesses worldwide
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            See what our customers have to say about Cogniflow.
          </p>
        </div>

        <motion.div 
          ref={ref}
          className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
            >
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <RatingStars rating={testimonial.rating} />
                  </div>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                    "{testimonial.content}"
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

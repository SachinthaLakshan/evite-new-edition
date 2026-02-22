
import React from "react";
import { motion } from "framer-motion";
import { ThemeColor } from "@/types/theme";

interface EventThankYouProps {
  theme: ThemeColor;
  sectionVariants: any;
}

const EventThankYou: React.FC<EventThankYouProps> = ({
  theme,
  sectionVariants,
}) => {
  const isGreyTheme = theme.background === "#F1F1F1";
  const layoutType = theme.layout?.id || "vertical";

  if (isGreyTheme) {
    // Different layouts for grey themes
    switch (layoutType) {
      case "circular":
        return (
          <section className="py-8 text-center">
            <motion.div
              variants={sectionVariants}
              initial="initial"
              animate="animate"
            >
              <div className="bg-gray-200 rounded-md p-6">
                <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="bg-gray-300 rounded-md w-24 h-24"></div>
                  <div className="bg-gray-300 rounded-md w-24 h-24"></div>
                  <div className="bg-gray-300 rounded-md w-24 h-24"></div>
                  <div className="bg-gray-300 rounded-md w-24 h-24"></div>
                </div>
                <p className="text-sm mt-8 max-w-md mx-auto">
                  Thank you for being a part of our special event. 
                  We look forward to celebrating with you!
                </p>
              </div>
            </motion.div>
          </section>
        );
        
      case "diagonal":
        return (
          <section className="py-8 text-center">
            <motion.div
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              className="transform -rotate-2"
            >
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <div className="flex justify-center flex-wrap gap-4">
                <div className="bg-gray-200 transform rotate-3 w-32 h-32 shadow-md"></div>
                <div className="bg-gray-200 transform -rotate-2 w-32 h-32 shadow-md"></div>
                <div className="bg-gray-200 transform rotate-5 w-32 h-32 shadow-md"></div>
                <div className="bg-gray-200 transform -rotate-3 w-32 h-32 shadow-md"></div>
                <div className="bg-gray-200 transform rotate-1 w-32 h-32 shadow-md"></div>
              </div>
              <p className="text-sm mt-8 max-w-md mx-auto">
                Thank you for being a part of our special event. 
                We look forward to celebrating with you!
              </p>
            </motion.div>
          </section>
        );
      
      case "stacked":
        return (
          <section className="py-8 text-center">
            <motion.div
              variants={sectionVariants}
              initial="initial"
              animate="animate"
            >
              <div className="bg-gray-200 rounded-md border-l-4 border-gray-300 p-6">
                <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-300 rounded-md aspect-square"></div>
                  <div className="bg-gray-300 rounded-md aspect-square"></div>
                  <div className="bg-gray-300 rounded-md aspect-square"></div>
                  <div className="bg-gray-300 rounded-md aspect-square"></div>
                </div>
                <p className="text-sm mt-8 max-w-md mx-auto">
                  Thank you for being a part of our special event. 
                  We look forward to celebrating with you!
                </p>
              </div>
            </motion.div>
          </section>
        );
      
      case "vertical":
      default:
        return (
          <section className="py-8 text-center">
            <motion.div
              variants={sectionVariants}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
              <div className="flex justify-center">
                <div className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 w-32 h-32"></div>
                  <div className="rounded-full bg-gray-200 w-40 h-40 z-10"></div>
                  <div className="rounded-full bg-gray-200 w-32 h-32"></div>
                </div>
              </div>
              <p className="text-sm mt-8 max-w-md mx-auto">
                Thank you for being a part of our special event. 
                We look forward to celebrating with you!
              </p>
            </motion.div>
          </section>
        );
    }
  }

  return (
    <section
      className="py-16 text-center rounded-lg shadow-md"
      style={{
        background: `linear-gradient(to bottom, ${theme.primary}20, ${theme.secondary}20)`,
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="mb-4">
            <img
              src="/assets/thank-you.png"
              alt="Thank you"
              className="h-32 mx-auto"
            />
          </div>
          <p
            className="text-lg max-w-lg mx-auto"
            style={{ color: theme.primary }}
          >
            Thank you for being a part of our special event. We look forward
            to celebrating with you!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default EventThankYou;

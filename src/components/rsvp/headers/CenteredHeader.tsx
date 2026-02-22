
import React from "react";
import { motion } from "framer-motion";
import { ThemeColor, ThemeLayout } from "@/types/theme";
import { cn } from "@/lib/utils";

interface CenteredHeaderProps {
  event: any;
  theme: ThemeColor;
  layout: ThemeLayout;
  setFullscreenImage: (url: string | null) => void;
}

const CenteredHeader: React.FC<CenteredHeaderProps> = ({
  event,
  theme,
  layout,
  setFullscreenImage,
}) => {
  // Helper functions for style handling
  const getImageContainerClasses = () => {
    return cn(
      "relative mx-auto overflow-hidden shadow-2xl",
      layout.imageStyle,
      "w-64 h-64 sm:w-80 sm:h-80"
    );
  };

  const getImageBorderStyles = () => {
    return {
      borderWidth: "4px",
      borderStyle: "solid",
      borderColor: `${theme.primary}80`,
    };
  };

  const getTitleClasses = () => {
    return cn(
      "text-4xl sm:text-5xl md:text-6xl",
      layout.fontFamily.title,
      "text-white drop-shadow-lg"
    );
  };

  return (
    <motion.div
      className="relative z-10 mb-8"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="relative">
        {/* Image Container */}
        <div
          className={getImageContainerClasses()}
          style={getImageBorderStyles()}
        >
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setFullscreenImage(event.image_url)}
          />
        </div>

        {/* Decorative Elements */}
        {layout.decorations.includes("floral-circle") && (
          <div className="absolute -inset-8 z-[-1] opacity-70">
            <img
              src="/assets/floral-circle.png"
              alt="Decorative frame"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Title Section */}
      <div className="text-center mt-6">
        <motion.h1
          className={getTitleClasses()}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {event.title}
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default CenteredHeader;

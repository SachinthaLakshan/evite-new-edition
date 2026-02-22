
import React from "react";
import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { ThemeColor, ThemeLayout } from "@/types/theme";

interface SideBySideHeaderProps {
  event: any;
  theme: ThemeColor;
  layout: ThemeLayout;
  setFullscreenImage: (url: string | null) => void;
}

const SideBySideHeader: React.FC<SideBySideHeaderProps> = ({
  event,
  theme,
  layout,
  setFullscreenImage,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="relative">
        <div
          className={`overflow-hidden shadow-2xl mx-auto ${layout.imageStyle}`}
          style={{
            borderWidth: "4px",
            borderStyle: "solid",
            borderColor: `${theme.primary}80`,
          }}
        >
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setFullscreenImage(event.image_url)}
          />
        </div>
        {layout.decorations.includes("geometric") && (
          <div className="absolute -z-10 inset-0 -m-8 bg-gradient-to-r from-[#000]/5 to-[#fff]/5 rounded-lg"></div>
        )}
      </div>
      <div className="text-center md:text-left">
        <motion.h1
          className={`text-4xl sm:text-5xl md:text-6xl ${layout.fontFamily.title} text-white drop-shadow-lg`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {event.title}
        </motion.h1>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-white" />
            <span className="text-white">
              {new Date(event.date).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2 text-white" />
            <span className="text-white">{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBySideHeader;

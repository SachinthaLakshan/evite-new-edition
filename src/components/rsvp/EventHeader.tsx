
import React from "react";
import { motion } from "framer-motion";
import { Heart, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeColor, ThemeLayout } from "@/types/theme";
import BannerHeader from "./headers/BannerHeader";
import SideBySideHeader from "./headers/SideBySideHeader";
import CenteredHeader from "./headers/CenteredHeader";

interface EventHeaderProps {
  event: any;
  theme: ThemeColor;
  layout: ThemeLayout;
  setFullscreenImage: (url: string | null) => void;
}

const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  theme,
  layout,
  setFullscreenImage,
}) => {
  // Vertical layout header (Banner style)
  if (layout.headerStyle === "banner") {
    return <BannerHeader event={event} theme={theme} layout={layout} setFullscreenImage={setFullscreenImage} />;
  }

  // Render the header content based on layout style
  const renderHeaderContent = () => {
    switch (layout.headerStyle) {
      case "side-by-side":
        return <SideBySideHeader event={event} theme={theme} layout={layout} setFullscreenImage={setFullscreenImage} />;
      case "centered":
      default:
        return <CenteredHeader event={event} theme={theme} layout={layout} setFullscreenImage={setFullscreenImage} />;
    }
  };

  return (
    <header
      className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-6"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${event.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {renderHeaderContent()}

      {/* Call to Action Buttons */}
      <motion.div
        className="flex gap-4 mt-8 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Button
          className="backdrop-blur-sm shadow-lg border"
          style={{
            backgroundColor: `${theme.primary}80`,
            borderColor: `${theme.primary}20`,
            color: "white",
          }}
          onClick={() => window.open(`${event.location_url}`, "_blank")}
        >
          <MapPinIcon className="w-5 h-5 mr-2" />
          Location
        </Button>
        <Button
          className="backdrop-blur-sm shadow-lg border"
          style={{
            backgroundColor: `${theme.secondary}80`,
            borderColor: `${theme.secondary}20`,
            color: "white",
          }}
          onClick={() =>
            document
              .getElementById("rsvp-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Heart className="w-5 h-5 mr-2" />
          RSVP
        </Button>
      </motion.div>
    </header>
  );
};

export default EventHeader;


import React from "react";
import { motion } from "framer-motion";
import { Share2, Music, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeColor, ThemeLayout } from "@/types/theme";

interface BannerHeaderProps {
  event: any;
  theme: ThemeColor;
  layout: ThemeLayout;
  setFullscreenImage: (url: string | null) => void;
}

const BannerHeader: React.FC<BannerHeaderProps> = ({
  event,
  theme,
  layout,
  setFullscreenImage,
}) => {
  return (
    <header className="relative py-12 px-6">
      <div className="w-full max-w-xl mx-auto">
        {/* Logo */}
        <div className="absolute top-4 left-4 z-10">
          <img 
            src="/lovable-uploads/d3366035-ac87-4470-befd-d75e1fd01bbf.png" 
            alt="Evite logo" 
            className="h-12 w-auto"
          />
        </div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-3">
          <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-gray-700" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm">
            <Music className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
        
        {/* Main Image */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setFullscreenImage(event.image_url)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">Event Image</span>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-6 right-4 z-10 flex gap-3">
          <Button variant="outline" size="lg" className="rounded-full bg-white shadow-lg px-8">
            RSVP Now
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-white shadow-lg">
            <MapPinIcon className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BannerHeader;

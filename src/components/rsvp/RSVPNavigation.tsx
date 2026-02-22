"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2Icon, Music2, MicOff, Loader2 } from "lucide-react";
import { ThemeColor } from "@/types/theme";

interface RSVPNavigationProps {
  isPlaying: boolean;
  toggleMusic: () => void;
  theme: ThemeColor;
  shareCurrentPage: () => Promise<void>;
  isSharing: boolean;
}

const RSVPNavigation: React.FC<RSVPNavigationProps> = ({
  isPlaying,
  toggleMusic,
  theme,
  shareCurrentPage,
  isSharing,
}) => {
  const router = useRouter();

  return (
    <>
      {/* Brand Logo Header */}
      <div className="fixed top-4 left-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md"
        >
          <img
            src="/assets/logo.png"
            alt="Evite Logo"
            className="h-10 w-auto"
            onClick={() => router.push("/")}
          />
        </motion.div>
      </div>

      {/* Music Control */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white/90"
          style={{
            color: theme.primary,
          }}
          onClick={shareCurrentPage}
          disabled={isSharing}
        >
          {isSharing ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          ) : (
            <Share2Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white/90"
          style={{
            color: theme.primary,
          }}
          onClick={toggleMusic}
        >
          {isPlaying ? (
            <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Music2 className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-4 left-4 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <motion.a
          href="https://evite.lk"
          target="_blank"
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 text-xs text-white p-1.5 rounded-full shadow-md"
          style={{
            backgroundColor: `${theme.primary}CC`,
            backdropFilter: "blur(4px)",
          }}
        >
          <img src="/assets/logo.png" alt="Brand Mark" className="h-4 w-auto" />
          <span>Created by Evite.lk</span>
        </motion.a>
      </div>
    </>
  );
};

export default RSVPNavigation;

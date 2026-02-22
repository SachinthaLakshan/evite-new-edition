
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface FullscreenImageProps {
  image: string | null;
  onClose: () => void;
}

const FullscreenImage: React.FC<FullscreenImageProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Event"
          className="w-full h-full object-contain"
        />
        <button
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 backdrop-blur-sm transition-colors"
          onClick={onClose}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FullscreenImage;

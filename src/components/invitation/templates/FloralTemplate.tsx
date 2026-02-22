import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface FloralTemplateProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
}

const FloralTemplate: React.FC<FloralTemplateProps> = ({
  config,
  guestName,
  eventData,
}) => {
  const { couple_names, custom_text, styling, guest_name_position } = config;

  const renderGuestName = (position: string) => {
    if (!guestName || guest_name_position !== position) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6"
        style={{ color: styling.text_color }}
      >
        <p className="text-xl italic">Dear {guestName},</p>
      </motion.div>
    );
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-b from-pink-50 to-white rounded-3xl shadow-2xl overflow-hidden"
      style={{ fontFamily: styling.font_family }}
    >
      {/* Floral decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <img src="/assets/floral-circle.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 transform rotate-90">
        <img src="/assets/floral-circle.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20 transform -rotate-90">
        <img src="/assets/floral-circle.png" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 transform rotate-180">
        <img src="/assets/floral-circle.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="relative p-16 space-y-8">
        {/* Top guest name */}
        {renderGuestName('top')}

        {/* Header guest name */}
        {renderGuestName('header')}

        {/* Floral divider top */}
        <div className="flex justify-center">
          <img src="/assets/floral-divider.png" alt="" className="h-8 opacity-60" />
        </div>

        {/* Main message */}
        {custom_text.main_message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-lg italic"
            style={{ color: styling.text_color }}
          >
            {custom_text.main_message}
          </motion.p>
        )}

        {/* Couple names with floral styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <h1
            className="text-5xl font-serif italic"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person1}
          </h1>
          <div className="flex items-center justify-center gap-6">
            <div
              className="w-16 h-px"
              style={{ backgroundColor: styling.secondary_color }}
            />
            <span className="text-3xl" style={{ color: styling.text_color }}>
              ❀
            </span>
            <div
              className="w-16 h-px"
              style={{ backgroundColor: styling.secondary_color }}
            />
          </div>
          <h1
            className="text-5xl font-serif italic"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person2}
          </h1>
        </motion.div>

        {/* Center guest name */}
        {renderGuestName('center')}

        {/* Floral divider middle */}
        <div className="flex justify-center">
          <img src="/assets/floral-divider.png" alt="" className="h-8 opacity-60" />
        </div>

        {/* Event details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-3"
          style={{ color: styling.text_color }}
        >
          <p className="text-xl font-medium">
            {new Date(eventData.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-lg">{eventData.location}</p>
        </motion.div>

        {/* Additional info */}
        {custom_text.additional_info && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-base italic"
            style={{ color: styling.text_color }}
          >
            {custom_text.additional_info}
          </motion.p>
        )}

        {/* Bottom guest name */}
        {renderGuestName('bottom')}
      </div>
    </div>
  );
};

export default FloralTemplate;

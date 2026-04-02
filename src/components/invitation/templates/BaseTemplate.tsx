import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface BaseTemplateProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    time?: string;
    location: string;
    bride_name?: string;
    groom_name?: string;
  };
}

const BaseTemplate: React.FC<BaseTemplateProps> = ({
  config,
  guestName,
  eventData,
}) => {
  const { custom_text, styling, guest_name_position, background_image } = config;
  const brideName = eventData.bride_name || "Bride";
  const groomName = eventData.groom_name || "Groom";

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
      className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-cover bg-center"
      style={{ 
        fontFamily: styling.font_family,
        backgroundImage: background_image ? `url(${background_image})` : 'none',
        backgroundColor: !background_image ? 'white' : 'transparent',
        aspectRatio: '1/1.4', // Default aspect ratio for portrait invitations
      }}
    >
      {/* Semi-transparent overlay to ensure text readability if needed */}
      <div className="absolute inset-0 bg-white/10" />

      <div className="relative px-24 py-12 flex flex-col h-full items-center">
        {/* Absolute Top - Guest Name position: top */}
        <div className="w-full">
          {renderGuestName('top')}
        </div>

        {/* Top Content Area */}
        <div className="flex-1 flex flex-col justify-center w-full space-y-4">
          {/* Header Guest Name - near main message */}
          {renderGuestName('header')}

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
        </div>

        {/* Middle Section - Focal Point (Couple Names) */}
        <div className="w-full py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-6"
          >
            <h1
              className="text-5xl font-serif italic leading-tight"
              style={{ color: styling.primary_color }}
            >
              {brideName}
            </h1>
            
            <div className="flex items-center justify-center gap-6">
              <div
                className="w-16 h-px"
                style={{ backgroundColor: styling.secondary_color }}
              />
              <span className="text-3xl" style={{ color: styling.text_color }}>
                &
              </span>
              <div
                className="w-16 h-px"
                style={{ backgroundColor: styling.secondary_color }}
              />
            </div>

            <h1
              className="text-5xl font-serif italic leading-tight"
              style={{ color: styling.primary_color }}
            >
              {groomName}
            </h1>
          </motion.div>
        </div>

        {/* Bottom Content Area */}
        <div className="flex-1 flex flex-col justify-center w-full space-y-4">
          {/* Center guest name - near event details */}
          {renderGuestName('center')}

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

            <p className="text-lg pt-2">{eventData.location}</p>
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
        </div>

        {/* Absolute Bottom - Guest Name position: bottom */}
        <div className="w-full">
          {renderGuestName('bottom')}
        </div>
      </div>
    </div>
  );
};

export default BaseTemplate;

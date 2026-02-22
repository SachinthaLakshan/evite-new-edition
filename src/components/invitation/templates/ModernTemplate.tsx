import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface ModernTemplateProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({
  config,
  guestName,
  eventData,
}) => {
  const { couple_names, custom_text, styling, guest_name_position } = config;

  const renderGuestName = (position: string) => {
    if (!guestName || guest_name_position !== position) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
        style={{ color: styling.text_color }}
      >
        <p className="text-xl font-light">Dear {guestName},</p>
      </motion.div>
    );
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{ fontFamily: styling.font_family }}
    >
      {/* Geometric accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${styling.primary_color}, ${styling.secondary_color})`,
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
        }}
      />

      <div className="relative p-16 space-y-10">
        {/* Top guest name */}
        {renderGuestName('top')}

        {/* Header guest name */}
        {renderGuestName('header')}

        {/* Main message */}
        {custom_text.main_message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-light tracking-wide"
            style={{ color: styling.text_color }}
          >
            {custom_text.main_message}
          </motion.p>
        )}

        {/* Couple names - Modern stacked layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h1
            className="text-6xl font-thin tracking-wider"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person1.toUpperCase()}
          </h1>
          <div className="flex items-center gap-4">
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: styling.secondary_color }}
            />
            <span
              className="text-3xl font-light"
              style={{ color: styling.text_color }}
            >
              &
            </span>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: styling.secondary_color }}
            />
          </div>
          <h1
            className="text-6xl font-thin tracking-wider"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person2.toUpperCase()}
          </h1>
        </motion.div>

        {/* Center guest name */}
        {renderGuestName('center')}

        {/* Event details with modern styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pl-8 border-l-2"
          style={{ borderColor: styling.primary_color }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Date
            </p>
            <p className="text-xl font-light" style={{ color: styling.text_color }}>
              {new Date(eventData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              Venue
            </p>
            <p className="text-xl font-light" style={{ color: styling.text_color }}>
              {eventData.location}
            </p>
          </div>
        </motion.div>

        {/* Additional info */}
        {custom_text.additional_info && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-base font-light italic"
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

export default ModernTemplate;

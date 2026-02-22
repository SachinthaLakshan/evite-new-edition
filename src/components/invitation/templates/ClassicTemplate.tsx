import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface ClassicTemplateProps {
  config: InvitationConfig;
  guestName?: string;
  eventData: {
    title: string;
    date: string;
    location: string;
  };
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  config,
  guestName,
  eventData,
}) => {
  const { couple_names, custom_text, styling, guest_name_position } = config;

  const renderGuestName = (position: string) => {
    if (!guestName || guest_name_position !== position) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-4"
        style={{ color: styling.text_color }}
      >
        <p className="text-lg font-medium">Dear {guestName},</p>
      </motion.div>
    );
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{ fontFamily: styling.font_family }}
    >
      {/* Decorative border */}
      <div
        className="absolute inset-0 border-8 rounded-lg pointer-events-none"
        style={{ borderColor: styling.primary_color }}
      />

      <div className="relative p-12 space-y-8">
        {/* Top guest name */}
        {renderGuestName('top')}

        {/* Header guest name */}
        {renderGuestName('header')}

        {/* Decorative top element */}
        <div className="flex justify-center">
          <div
            className="w-24 h-1 rounded-full"
            style={{ backgroundColor: styling.secondary_color }}
          />
        </div>

        {/* Main message */}
        {custom_text.main_message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-lg"
            style={{ color: styling.text_color }}
          >
            {custom_text.main_message}
          </motion.p>
        )}

        {/* Couple names */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h1
            className="text-5xl font-bold"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person1}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div
              className="w-12 h-0.5"
              style={{ backgroundColor: styling.secondary_color }}
            />
            <span className="text-2xl" style={{ color: styling.text_color }}>
              &
            </span>
            <div
              className="w-12 h-0.5"
              style={{ backgroundColor: styling.secondary_color }}
            />
          </div>
          <h1
            className="text-5xl font-bold"
            style={{ color: styling.primary_color }}
          >
            {couple_names.person2}
          </h1>
        </motion.div>

        {/* Center guest name */}
        {renderGuestName('center')}

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

        {/* Decorative bottom element */}
        <div className="flex justify-center">
          <div
            className="w-24 h-1 rounded-full"
            style={{ backgroundColor: styling.secondary_color }}
          />
        </div>

        {/* Bottom guest name */}
        {renderGuestName('bottom')}
      </div>
    </div>
  );
};

export default ClassicTemplate;

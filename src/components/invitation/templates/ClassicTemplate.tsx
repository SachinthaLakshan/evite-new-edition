import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface ClassicTemplateProps {
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

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  config,
  guestName,
  eventData,
}) => {
  const { custom_text, styling, guest_name_position } = config;
  const brideName = eventData.bride_name || "Bride";
  const groomName = eventData.groom_name || "Groom";

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
      className="relative w-full max-w-2xl mx-auto bg-[#faf8f5] rounded-xl shadow-2xl overflow-hidden"
      style={{ fontFamily: styling.font_family }}
    >
      {/* Decorative border */}
      <div className="absolute inset-4 border bg-transparent pointer-events-none rounded-lg" style={{ borderColor: styling.primary_color, borderWidth: '2px', opacity: 0.3 }} />
      <div className="absolute inset-6 border bg-transparent pointer-events-none rounded-lg" style={{ borderColor: styling.primary_color, borderWidth: '1px', opacity: 0.5 }} />

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
            className="text-6xl font-light tracking-wide"
            style={{ color: styling.primary_color }}
          >
            {brideName}
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
            className="text-6xl font-light tracking-wide"
            style={{ color: styling.primary_color }}
          >
            {groomName}
          </h1>
        </motion.div>

        {/* Center guest name */}
        {renderGuestName('center')}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-3"
          style={{ color: styling.text_color }}
        >
          <p className="text-xl font-medium tracking-widest uppercase text-sm">
            {new Date(eventData.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {eventData.time && (
            <p className="text-lg opacity-80">{eventData.time}</p>
          )}
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

import React from "react";
import { motion } from "framer-motion";
import { InvitationConfig } from "@/types/invitation";

interface MinimalTemplateProps {
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

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
        style={{ color: styling.text_color }}
      >
        <p className="text-sm uppercase tracking-widest">Dear {guestName},</p>
      </motion.div>
    );
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] overflow-hidden border border-gray-100"
      style={{ fontFamily: styling.font_family }}
    >
      <div className="absolute inset-2 border border-black/5 rounded-xl pointer-events-none" />
      <div className="relative p-20 space-y-12">
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
            className="text-sm uppercase tracking-widest text-center"
            style={{ color: styling.text_color }}
          >
            {custom_text.main_message}
          </motion.p>
        )}

        {/* Couple names - Minimal centered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <h1
            className="text-4xl font-light tracking-wide"
            style={{ color: styling.primary_color }}
          >
            {brideName}
          </h1>
          <div className="flex items-center justify-center">
            <div
              className="w-8 h-px"
              style={{ backgroundColor: styling.text_color }}
            />
          </div>
          <h1
            className="text-4xl font-light tracking-wide"
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
          className="text-center space-y-6"
        >
          <div className="space-y-2">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: styling.text_color, opacity: 0.6 }}
            >
              When
            </p>
            <p className="text-lg font-light" style={{ color: styling.text_color }}>
              {new Date(eventData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {eventData.time && (
              <p className="text-md font-light" style={{ color: styling.text_color, opacity: 0.8 }}>
                {eventData.time}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: styling.text_color, opacity: 0.6 }}
            >
              Where
            </p>
            <p className="text-lg font-light" style={{ color: styling.text_color }}>
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
            className="text-center text-sm"
            style={{ color: styling.text_color, opacity: 0.8 }}
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

export default MinimalTemplate;

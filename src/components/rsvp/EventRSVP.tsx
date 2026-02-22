
import React from "react";
import { motion } from "framer-motion";
import { ThemeColor } from "@/types/theme";
import VerificationForm from "./forms/VerificationForm";
import RSVPForm from "./forms/RSVPForm";
import MinimalRSVP from "./MinimalRSVP";

interface EventRSVPProps {
  event: any;
  theme: ThemeColor;
  sectionVariants: any;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
  attendee: any;
  setAttendee: (value: any) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  verifyAttendee: (value?: string) => void;
}

const EventRSVP: React.FC<EventRSVPProps> = ({
  event,
  theme,
  sectionVariants,
  isVerified,
  attendee,
  setAttendee,
  identifier,
  setIdentifier,
  verifyAttendee,
}) => {
  const isGreyTheme = theme.background === "#F1F1F1";

  // Render the minimal grey theme version
  if (isGreyTheme) {
    return (
      <MinimalRSVP 
        sectionVariants={sectionVariants}
        attendee={attendee}
        setAttendee={setAttendee}
      />
    );
  }

  // Render the regular theme version
  return (
    <section
      className="py-16"
      id="rsvp-section"
      style={{
        backgroundImage: isVerified
          ? "none"
          : "url('/assets/floral-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          className="rounded-lg p-8"
          style={{
            backgroundColor: isVerified ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.9)",
          }}
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          {!isVerified ? (
            <VerificationForm 
              identifier={identifier}
              setIdentifier={setIdentifier}
              verifyAttendee={verifyAttendee}
            />
          ) : (
            <RSVPForm 
              attendee={attendee}
              setAttendee={setAttendee}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default EventRSVP;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { ThemeColor } from "@/types/theme";
import { DiagonalDecoration } from "@/components/theme-decorations/DiagonalDecoration";
import EventHeader from "@/components/rsvp/EventHeader";
import EventMessage from "@/components/rsvp/EventMessage";
import EventCountdown from "@/components/rsvp/EventCountdown";
import EventSchedule from "@/components/rsvp/EventSchedule";
import EventRSVP from "@/components/rsvp/EventRSVP";
import EventThankYou from "@/components/rsvp/EventThankYou";
import EventFooter from "@/components/rsvp/EventFooter";
import FullscreenImage from "@/components/rsvp/FullscreenImage";
import PersonalizedInvitation from "@/components/rsvp/PersonalizedInvitation";

interface DiagonalLayoutProps {
  event: any;
  isLoadingEvent: boolean;
  theme: ThemeColor;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
  attendee: any;
  setAttendee: (value: any) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  fullscreenImage: string | null;
  setFullscreenImage: (url: string | null) => void;
  verifyAttendee: (value?: string) => void;
  sectionVariants: any;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const DiagonalLayout: React.FC<DiagonalLayoutProps> = ({
  event,
  isLoadingEvent,
  theme,
  isVerified,
  setIsVerified,
  attendee,
  setAttendee,
  identifier,
  setIdentifier,
  fullscreenImage,
  setFullscreenImage,
  verifyAttendee,
  sectionVariants,
  audioRef,
}) => {
  if (isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-purple-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-purple-800">
            Loading your invitation...
          </h1>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100">
        <div className="text-center space-y-4">
          <X className="w-12 h-12 text-red-600 mx-auto" />
          <h1 className="text-2xl font-bold text-red-800">Event not found</h1>
          <p className="text-gray-600">
            This event may have been cancelled or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-[#F1F1F1] min-h-screen overflow-x-hidden flex flex-col"
      style={{ fontFamily: "sans-serif" }}
    >
      {/* Wave background and decorations */}
      <DiagonalDecoration />

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <FullscreenImage
            image={fullscreenImage}
            onClose={() => setFullscreenImage(null)}
          />
        )}
      </AnimatePresence>

      {/* Event content */}
      <div className="flex-grow">
        {/* Personalized Invitation Card */}
        {event.invitation_config && (
          <PersonalizedInvitation
            invitationConfig={event.invitation_config}
            guestName={attendee?.name}
            eventData={{
              title: event.title,
              date: event.date,
              location: event.location,
            }}
            sectionVariants={sectionVariants}
          />
        )}

        {/* Header with event image */}
        <EventHeader
          event={event}
          theme={theme}
          layout={theme.layout!}
          setFullscreenImage={setFullscreenImage}
        />

        {/* Content sections */}
        <div className="max-w-lg mx-auto px-4 space-y-12">
          {/* Our Message Section */}
          <EventMessage
            event={event}
            theme={theme}
            sectionVariants={sectionVariants}
          />

          {/* Countdown Section */}
          <EventCountdown
            event={event}
            theme={theme}
            sectionVariants={sectionVariants}
          />

          {/* Schedule Section */}
          <EventSchedule
            event={event}
            theme={theme}
            sectionVariants={sectionVariants}
          />

          {/* RSVP Section */}
          <EventRSVP
            event={event}
            theme={theme}
            sectionVariants={sectionVariants}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            attendee={attendee}
            setAttendee={setAttendee}
            identifier={identifier}
            setIdentifier={setIdentifier}
            verifyAttendee={verifyAttendee}
          />

          {/* Thank You Section */}
          <EventThankYou theme={theme} sectionVariants={sectionVariants} />
        </div>
      </div>

      {/* Brand Footer */}
      <EventFooter theme={theme} />

      {/* Audio Player */}
      <audio ref={audioRef} loop>
        <source src="/soft-background-music.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default DiagonalLayout;

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useRSVP } from "@/hooks/useRSVP";
import LegacyClassicLayout from "@/components/rsvp/layouts/LegacyClassicLayout";

const PublicRSVP = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("eventId");
  const attendeeId = searchParams.get("attendeeId");

  // Use the custom hook to manage all RSVP state and functionality
  const {
    event,
    isLoadingEvent,
    identifier,
    setIdentifier,
    isVerified,
    attendee,
    setAttendee,
    isPlaying,
    audioRef,
    toggleMusic,
    verifyAttendee,
  } = useRSVP(id, attendeeId);

  if (!isLoadingEvent && event && !event.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Active</h1>
          <p className="text-gray-600 mb-6">
            This event is currently pending activation and cannot receive RSVP responses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LegacyClassicLayout
      event={event}
      isLoadingEvent={isLoadingEvent}
      isVerified={isVerified}
      attendee={attendee}
      setAttendee={setAttendee}
      identifier={identifier}
      setIdentifier={setIdentifier}
      verifyAttendee={verifyAttendee}
      isPlaying={isPlaying}
      toggleMusic={toggleMusic}
      audioRef={audioRef}
    />
  );
};

export default PublicRSVP;

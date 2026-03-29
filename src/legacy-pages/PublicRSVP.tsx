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

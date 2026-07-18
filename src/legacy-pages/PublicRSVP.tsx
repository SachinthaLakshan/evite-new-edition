"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useRSVP } from "@/hooks/useRSVP";
import LegacyClassicLayout from "@/components/rsvp/layouts/LegacyClassicLayout";
import LavenderLayout from "@/components/rsvp/layouts/LavenderLayout";
import SageLayout from "@/components/rsvp/layouts/SageLayout";
import RedRoseLayout from "@/components/rsvp/layouts/RedRoseLayout";
import RedRoseClassicLayout from "@/components/rsvp/layouts/RedRoseClassicLayout";

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

  // Render the selected layout (defaulting to LegacyClassicLayout for compatibility)
  if (event?.theme_id === "sage") {
    return (
      <SageLayout
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
  }

  if (event?.theme_id === "lavender") {
    return (
      <LavenderLayout
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
  }

  if (event?.theme_id === "redrose") {
    return (
      <RedRoseLayout
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
  }

  if (event?.theme_id === "redroseclassic") {
    return (
      <RedRoseClassicLayout
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

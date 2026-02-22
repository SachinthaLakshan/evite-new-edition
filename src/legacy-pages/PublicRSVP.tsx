"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useRSVP } from "@/hooks/useRSVP";
import VerticalLayout from "@/components/rsvp/layouts/VerticalLayout";
import CircularLayout from "@/components/rsvp/layouts/CircularLayout";
import DiagonalLayout from "@/components/rsvp/layouts/DiagonalLayout";
import StackedLayout from "@/components/rsvp/layouts/StackedLayout";
import { verticalGreyTheme } from "@/lib/theme/vertical-theme";
import { circularGreyTheme } from "@/lib/theme/circular-theme";
import { diagonalGreyTheme } from "@/lib/theme/diagonal-theme";
import { stackedGreyTheme } from "@/lib/theme/stacked-theme";

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
    setIsVerified,
    attendee,
    setAttendee,
    isPlaying,
    audioRef,
    fullscreenImage,
    setFullscreenImage,
    themeStyles,
    isSharing,
    toggleMusic,
    verifyAttendee,
    shareCurrentPage,
    getAnimationVariants,
  } = useRSVP(id, attendeeId);

  // Get animation variants based on theme
  const sectionVariants = getAnimationVariants();

  // Determine which theme to use based on event.theme_id
  const getThemeForLayout = () => {
    if (!event) return verticalGreyTheme;

    switch (event.theme_id) {
      case "circular":
        return circularGreyTheme;
      case "diagonal":
        return diagonalGreyTheme;
      case "stacked":
        return stackedGreyTheme;
      case "vertical":
      default:
        return verticalGreyTheme;
    }
  };

  const theme = getThemeForLayout();

  // Render the appropriate layout based on theme
  const renderLayout = () => {
    if (!event) return null;

    switch (event.theme_id) {
      case "circular":
        return (
          <CircularLayout
            event={event}
            isLoadingEvent={isLoadingEvent}
            theme={theme}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            attendee={attendee}
            setAttendee={setAttendee}
            identifier={identifier}
            setIdentifier={setIdentifier}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
            verifyAttendee={verifyAttendee}
            sectionVariants={sectionVariants}
            audioRef={audioRef}
          />
        );
      case "diagonal":
        return (
          <DiagonalLayout
            event={event}
            isLoadingEvent={isLoadingEvent}
            theme={theme}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            attendee={attendee}
            setAttendee={setAttendee}
            identifier={identifier}
            setIdentifier={setIdentifier}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
            verifyAttendee={verifyAttendee}
            sectionVariants={sectionVariants}
            audioRef={audioRef}
          />
        );
      case "stacked":
        return (
          <StackedLayout
            event={event}
            isLoadingEvent={isLoadingEvent}
            theme={theme}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            attendee={attendee}
            setAttendee={setAttendee}
            identifier={identifier}
            setIdentifier={setIdentifier}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
            verifyAttendee={verifyAttendee}
            sectionVariants={sectionVariants}
            audioRef={audioRef}
          />
        );
      case "vertical":
      default:
        return (
          <VerticalLayout
            event={event}
            isLoadingEvent={isLoadingEvent}
            theme={theme}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            attendee={attendee}
            setAttendee={setAttendee}
            identifier={identifier}
            setIdentifier={setIdentifier}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
            verifyAttendee={verifyAttendee}
            sectionVariants={sectionVariants}
            audioRef={audioRef}
          />
        );
    }
  };

  return renderLayout();
};

export default PublicRSVP;

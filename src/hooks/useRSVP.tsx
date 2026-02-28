import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createShortUrl } from "@/lib/url-shortener";
import { getThemeStyles, getThemeLayout } from "@/lib/theme-utils";
import { ThemeColor, ThemeLayout } from "@/types/theme";

export const useRSVP = (eventId: string | null, attendeeId: string | null) => {
  const [identifier, setIdentifier] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [attendee, setAttendee] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [themeStyles, setThemeStyles] = useState<ThemeColor | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoVerified = useRef(false);

  // Fetch event data - fixing useQuery usage to match @tanstack/react-query v5
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["public-event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Event fetch error:", error);
        throw error;
      }

      return data;
    },
    enabled: !!eventId,
    retry: false,
  });

  // Auto-verify when attendeeId is provided via the invite link
  useEffect(() => {
    if (hasAutoVerified.current) return;
    if (!eventId || !attendeeId) return;

    hasAutoVerified.current = true;
    verifyAttendee();
  }, [eventId, attendeeId]);

  // Update theme styles when event data is loaded
  useEffect(() => {
    if (event) {
      setThemeStyles(getThemeStyles(event.theme_id));
    }
  }, [event]);

  // Toggle background music
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Verify attendee
  const verifyAttendee = async (identifierValue?: string) => {
    try {
      const valueToCheck = identifierValue || identifier;

      let query = supabase
        .from("attendees")
        .select("*")
        .eq("event_id", eventId);

      if (attendeeId) {
        query = query.eq("id", attendeeId);
      } else if (valueToCheck) {
        query = query.or(
          `email.eq.${valueToCheck},whatsapp_number.eq.${valueToCheck}`,
        );
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Verification error:", error);
        toast.error("Verification failed. Please try again.");
        return;
      }

      if (!data) {
        toast.error("Invitation not found. Please check your details.");
        return;
      }

      setAttendee(data);
      setIsVerified(true);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
    }
  };

  // Share current page
  const shareCurrentPage = async () => {
    try {
      setIsSharing(true);
      // Get the current URL
      const currentUrl = window.location.href;

      // Create a short URL
      const shortUrl = await createShortUrl(currentUrl);

      // If on mobile, use navigator.share
      if (navigator.share) {
        await navigator.share({
          title: event?.title || "Event Invitation",
          text: `Join me at ${event?.title || "this event"}!`,
          url: shortUrl,
        });
        toast.success("Shared successfully!");
      } else {
        // Otherwise, copy to clipboard
        await navigator.clipboard.writeText(shortUrl);
        toast.success("Short link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing page:", error);
      toast.error("Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  // Get animation variants based on theme
  const getAnimationVariants = () => {
    const layout = themeStyles?.layout || getThemeLayout("classic");

    switch (layout.animationStyle) {
      case "slide":
        return {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0, transition: { duration: 0.6 } },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
        };
      case "none":
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        };
    }
  };

  return {
    event,
    isLoadingEvent,
    identifier,
    setIdentifier,
    isVerified,
    setIsVerified,
    attendee,
    setAttendee,
    isPlaying,
    setIsPlaying,
    audioRef,
    fullscreenImage,
    setFullscreenImage,
    themeStyles,
    isSharing,
    setIsSharing,
    toggleMusic,
    verifyAttendee,
    shareCurrentPage,
    getAnimationVariants,
  };
};

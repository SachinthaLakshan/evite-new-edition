import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }

  return "";
};

/**
 * Generates a short, unique alphanumeric ID of a specified length
 */
const generateId = (length: number = 5): string => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Creates a guest-specific short URL using the invitation_links junction table
 * @param eventId The event ID
 * @param attendeeId The attendee ID
 * @returns The shortened URL e.g., /s/abc12
 */
export async function createAttendeeShortUrl(
  eventId: string,
  attendeeId: string,
): Promise<string> {
  try {
    // Generate a 5-character ID
    let shortId = generateId(5);
    
    // Set 180 days expiration by default for wedding invites
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    const { error } = await (supabase as any).from("invitation_links").insert({
      short_id: shortId,
      event_id: eventId,
      attendee_id: attendeeId,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      if (error.code === "23505") { // Collision, retry once
        shortId = generateId(5);
        const { error: retryError } = await (supabase as any).from("invitation_links").insert({
          short_id: shortId,
          event_id: eventId,
          attendee_id: attendeeId,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    const baseUrl = getBaseUrl();
    return baseUrl ? `${baseUrl}/s/${shortId}` : `/s/${shortId}`;
  } catch (error) {
    console.error("Error creating guest short URL:", error);
    const baseUrl = getBaseUrl();
    return `${baseUrl}/response?eventId=${eventId}&attendeeId=${attendeeId}`;
  }
}


/**
 * Generates and stores a short URL for sharing (Standard 8-character version)
 * @param longUrl The original long URL to shorten
 * @param expirationDays Number of days until the short URL expires (default: 30)
 * @returns The shortened URL
 */
export async function createShortUrl(
  longUrl: string,
  expirationDays = 30,
): Promise<string> {
  try {
    const shortId = nanoid(8);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const { error } = await supabase.from("short_urls").insert({
      short_id: shortId,
      original_url: longUrl,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return longUrl;
    }

    return `${baseUrl}/s/${shortId}`;
  } catch (error) {
    console.error("Error creating short URL:", error);
    return longUrl;
  }
}
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
 * Generates and stores a short URL for sharing
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
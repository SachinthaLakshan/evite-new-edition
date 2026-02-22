import { supabase } from "@/integrations/supabase/client";
import { nanoid } from "nanoid";

/**
 * Generates and stores a short URL for sharing
 * @param longUrl The original long URL to shorten
 * @param expirationDays Number of days until the short URL expires (default: 30)
 * @returns The shortened URL
 */
export async function createShortUrl(longUrl: string, expirationDays = 30): Promise<string> {
  try {
    // Generate a short unique ID
    const shortId = nanoid(8);
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    // Store the mapping in the database
    const { error } = await supabase
      .from("short_urls")
      .insert({
        short_id: shortId,
        original_url: longUrl,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
    
    if (error) throw error;
    
    // Return the shortened URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/s/${shortId}`;
  } catch (error) {
    console.error("Error creating short URL:", error);
    // If shortening fails, return the original URL
    return longUrl;
  }
} 
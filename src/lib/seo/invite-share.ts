import type { Metadata } from "next";
import { supabase } from "@/integrations/supabase/client";
import { formatMetaWeddingDate } from "@/lib/event-meta-image";
import { SITE_URL } from "./site";

export const LAVENDER_THEME_ID = "lavender";
export const LAVENDER_SHARE_IMAGE_PATH = "/meta-test.jpeg";
const LAVENDER_SHARE_IMAGE_WIDTH = 1600;
const LAVENDER_SHARE_IMAGE_HEIGHT = 844;

const DEFAULT_TITLE = "Event Invitation";
const DEFAULT_DESCRIPTION = "You are invited";

type InvitationLinkRow = {
  event_id: string;
  expires_at: string | null;
};

type InvitationLinkQuery = {
  from(table: "invitation_links"): {
    select(columns: "event_id, expires_at"): {
      eq(
        column: "short_id",
        value: string,
      ): {
        maybeSingle(): Promise<{
          data: InvitationLinkRow | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

export type InviteShare = {
  title: string;
  description: string;
  themeId: string | null;
  isLavender: boolean;
  metaImageUrl: string | null;
};

/**
 * Same host selection the invite page already uses for Open Graph URLs.
 * Social crawlers need an absolute image URL on that host.
 */
export function getPublicBaseUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  return process.env.NODE_ENV === "production" ? SITE_URL : "http://localhost:3000";
}

export function absolutePublicUrl(path: string) {
  return new URL(path, getPublicBaseUrl()).toString();
}

export function inviteShareMetadata(
  title: string,
  description: string,
  image: string,
  pagePath?: string,
  width = 1200,
  height = 630,
): Metadata {
  const imageUrl = absolutePublicUrl(image);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pagePath ? absolutePublicUrl(pagePath) : undefined,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width,
          height,
          type: "image/jpeg",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function lavenderShareMetadata(
  title: string,
  description: string,
  pagePath?: string,
): Metadata {
  return inviteShareMetadata(
    title,
    description,
    LAVENDER_SHARE_IMAGE_PATH,
    pagePath,
    LAVENDER_SHARE_IMAGE_WIDTH,
    LAVENDER_SHARE_IMAGE_HEIGHT,
  );
}

export function responseInvitePath(eventId: string, attendeeId?: string) {
  const params = new URLSearchParams({ eventId });
  if (attendeeId) params.set("attendeeId", attendeeId);
  return `/response?${params.toString()}`;
}

function eventIdFromOriginalUrl(originalUrl: string) {
  try {
    return new URL(originalUrl, getPublicBaseUrl()).searchParams.get("eventId");
  } catch {
    return null;
  }
}

async function eventIdFromInvitationLink(shortId: string) {
  const { data, error } = await (supabase as unknown as InvitationLinkQuery)
    .from("invitation_links")
    .select("event_id, expires_at")
    .eq("short_id", shortId)
    .maybeSingle();

  if (error || !data?.event_id) return null;
  return data.event_id;
}

async function eventIdFromShortUrl(shortId: string) {
  const { data, error } = await supabase
    .from("short_urls")
    .select("original_url")
    .eq("short_id", shortId)
    .maybeSingle();

  if (error || !data?.original_url) return null;
  return eventIdFromOriginalUrl(data.original_url);
}

export async function resolveInviteShareByEventId(
  eventId: string,
): Promise<InviteShare | null> {
  const { data: event, error } = await supabase
    .from("events")
    .select("title, date, theme_id, meta_image_url")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !event) return null;

  return {
    title: event.title ? `${event.title} | Invitation` : DEFAULT_TITLE,
    description: formatMetaWeddingDate(event.date || "") || DEFAULT_DESCRIPTION,
    themeId: event.theme_id,
    isLavender: event.theme_id === LAVENDER_THEME_ID,
    metaImageUrl: event.meta_image_url,
  };
}

/**
 * Shared invite links are /s/:shortId. WhatsApp and other crawlers do not run
 * the client redirect, so theme lookup has to happen while rendering that URL.
 */
export async function resolveInviteShareByShortId(
  shortId: string,
): Promise<InviteShare | null> {
  if (!shortId) return null;

  try {
    const eventId =
      (await eventIdFromInvitationLink(shortId)) ??
      (await eventIdFromShortUrl(shortId));

    if (!eventId) return null;
    return resolveInviteShareByEventId(eventId);
  } catch {
    return null;
  }
}

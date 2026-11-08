import PublicRSVP from "@/legacy-pages/PublicRSVP";
import {
  absolutePublicUrl,
  inviteShareMetadata,
  lavenderShareMetadata,
  resolveInviteShareByEventId,
  responseInvitePath,
} from "@/lib/seo/invite-share";

// Force this page to be fully dynamic so it is not prerendered at build time
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const eventId = searchParams.eventId;
  const attendeeId = searchParams.attendeeId;

  let title = "Event Invitation";
  let description = "You are invited";
  let isLavender = false;
  let metaImageUrl: string | null = null;

  try {
    if (eventId) {
      const share = await resolveInviteShareByEventId(eventId);
      if (share) {
        title = share.title;
        description = share.description;
        isLavender = share.isLavender;
        metaImageUrl = share.metaImageUrl;
      }
    }
  } catch {
    // If Supabase metadata lookup fails, fall back to defaults
  }

  if (metaImageUrl && eventId) {
    return inviteShareMetadata(
      title,
      description,
      metaImageUrl,
      responseInvitePath(eventId, attendeeId),
    );
  }

  if (isLavender && eventId) {
    return lavenderShareMetadata(
      title,
      description,
      responseInvitePath(eventId, attendeeId),
    );
  }

  const imageUrl = absolutePublicUrl("/assets/floral-bg-og.jpg");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ResponsePage() {
  return <PublicRSVP />;
}

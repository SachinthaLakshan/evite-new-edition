import { supabase } from "@/integrations/supabase/client";
import PublicRSVP from "@/legacy-pages/PublicRSVP";

// Force this page to be fully dynamic so it is not prerendered at build time
export const dynamic = "force-dynamic";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const eventId = searchParams.eventId;
  const attendeeId = searchParams.attendeeId;

  let title = "Event Invitation";
  let description = "You are invited";

  try {
    if (eventId) {
      const { data: event } = await supabase
        .from("events")
        .select("title, description")
        .eq("id", eventId)
        .maybeSingle();

      if (event?.title) {
        title = `${event.title} | Invitation`;
      }
      if (event?.description) {
        description = event.description;
      }
    }
  } catch {
    // If Supabase metadata lookup fails, fall back to defaults
  }

  const imageUrl = new URL("/assets/floral-bg.jpg", getBaseUrl()).toString();

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

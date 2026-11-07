import type { Metadata } from "next";
import Landing from "@/legacy-pages/Index";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/site";

const title = "Digital Wedding Invitations in Sri Lanka | eVite";
const description =
  "Send a mobile wedding invitation on WhatsApp, collect RSVPs, and track your checklist and budget in rupees. Made for Sri Lankan weddings. From Rs. 2,999.";
const shareDescription =
  "Mobile wedding invitations, WhatsApp RSVPs, a checklist, and a rupee budget. From Rs. 2,999.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/",
  absoluteTitle: true,
  ogTitle: "eVite | Digital Wedding Invitations for Sri Lankan Weddings",
  ogDescription: shareDescription,
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: "eVite digital wedding invitation on a phone",
});

export default function Home() {
  return (
    <>
      <JsonLd data={[faqPageJsonLd(), serviceJsonLd()]} />
      <Landing />
    </>
  );
}

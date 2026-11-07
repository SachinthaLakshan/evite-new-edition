import type { Metadata } from "next";
import Landing from "@/legacy-pages/Index";

const title = "Digital Wedding Invitations in Sri Lanka | eVite";
const description =
  "Send a mobile wedding invitation on WhatsApp, collect RSVPs, and track your checklist and budget in rupees. Made for Sri Lankan weddings. From Rs. 2,999.";
const shareImage = "https://www.evite.lk/assets/invite_mockup.png";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description:
      "Mobile wedding invitations, WhatsApp RSVPs, a checklist, and a rupee budget. From Rs. 2,999.",
    url: "https://www.evite.lk/",
    type: "website",
    images: [
      {
        url: shareImage,
        alt: "eVite digital wedding invitation on a phone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Mobile wedding invitations, WhatsApp RSVPs, a checklist, and a rupee budget. From Rs. 2,999.",
    images: [shareImage],
  },
};

export default function Home() {
  return <Landing />;
}

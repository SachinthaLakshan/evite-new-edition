import { SITE_URL } from "./site";

export type SamplePage = {
  slug: string;
  title: string;
  description: string;
  style: string;
  imagePath: string;
  livePreviewUrl?: string;
};

export const SAMPLE_PAGES: SamplePage[] = [
  {
    slug: "lavender",
    title: "Lavender Wedding Invitation",
    description:
      "Elegant lavender digital wedding invitation with RSVP, maps, and mobile-first layout for Sri Lankan weddings. From Rs. 2,999.",
    style: "Modern floral",
    imagePath: "/assets/invite-lavendra.png",
    livePreviewUrl: "https://www.evite.lk/s/ip0s7",
  },
  {
    slug: "classic",
    title: "Classic Wedding Invitation",
    description:
      "Timeless classic digital wedding invitation design with WhatsApp sharing and built-in RSVP. From Rs. 2,999.",
    style: "Classic",
    imagePath: "/assets/invite-classc.png",
    livePreviewUrl: "https://www.evite.lk/s/hSjPx",
  },
  {
    slug: "red-rose",
    title: "Red Rose Wedding Invitation",
    description:
      "Romantic red rose themed mobile wedding invitation with RSVP and event details for Sri Lankan celebrations. From Rs. 2,999.",
    style: "Romantic",
    imagePath: "/assets/invite-redrose.png",
    livePreviewUrl: "https://www.evite.lk/s/tBTDz",
  },
  {
    slug: "sage",
    title: "Sage Wedding Invitation",
    description:
      "Fresh sage digital wedding invitation with organic florals, RSVP, and maps for Sri Lankan weddings. From Rs. 2,999.",
    style: "Botanical",
    imagePath: "/assets/invite-sage.png",
    livePreviewUrl: "https://www.evite.lk/s/VsRKy",
  },
  {
    slug: "lotuspremium",
    title: "Lotus Premium Wedding Invitation",
    description:
      "Lotus Premium digital wedding invitation with a fullscreen video opener, countdown, gallery, and RSVP. From Rs. 2,999.",
    style: "Premium video",
    imagePath: "/assets/lotuspremium.jpeg",
    livePreviewUrl: "https://www.evite.lk/s/rJXH4",
  },
  {
    slug: "cozyroyale",
    title: "Cozy Royale Wedding Invitation",
    description:
      "Cozy Royale digital wedding invitation with a fullscreen video opener, sage florals, gallery, and RSVP. From Rs. 2,999.",
    style: "Cozy floral",
    imagePath: "/assets/cozyroyale.jpeg",
    livePreviewUrl: "https://www.evite.lk/s/Wmsih",
  },
];

export function getSamplePage(slug: string) {
  return SAMPLE_PAGES.find((page) => page.slug === slug);
}

export function sampleOgImage(imagePath: string) {
  return `${SITE_URL}${imagePath}`;
}

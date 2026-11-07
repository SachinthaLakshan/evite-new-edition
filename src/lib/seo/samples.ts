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
];

export function getSamplePage(slug: string) {
  return SAMPLE_PAGES.find((page) => page.slug === slug);
}

export function sampleOgImage(imagePath: string) {
  return `${SITE_URL}${imagePath}`;
}

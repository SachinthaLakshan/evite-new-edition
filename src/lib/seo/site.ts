export const SITE_URL = "https://www.evite.lk";

export const SITE_NAME = "eVite";
export const SITE_LEGAL_NAME = "eVite.lk";

export const DEFAULT_DESCRIPTION =
  "Digital wedding invitations, WhatsApp RSVPs, checklist, and budget for weddings in Sri Lanka.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/invite_mockup.png`;

export const BUSINESS = {
  email: "info@evite.lk",
  phone: "+94716561975",
  phoneDisplay: "071 656 1975",
  streetAddress: "13/3, Pilanduwa, temple road",
  addressLocality: "Warakapola",
  postalCode: "71600",
  addressRegion: "Sabaragamuwa Province",
  addressCountry: "LK",
  latitude: 7.1992,
  longitude: 80.0933,
  geoRegion: "LK-9",
  geoPlacename: "Warakapola, Sri Lanka",
  priceLow: 2999,
  priceHigh: 14999,
  currency: "LKR",
} as const;

export const PLANS = [
  {
    name: "Silver Pack",
    slug: "silver",
    price: 2999,
    description:
      "Essential digital suite with unlimited e-cards, mobile RSVP, checklist, and basic budget tracker.",
    url: `${SITE_URL}/auth?mode=signup&plan=silver`,
  },
  {
    name: "Gold Pack",
    slug: "gold",
    price: 7999,
    description:
      "Premium digital plus print bundle with custom music, RSVP analytics, and printed cards.",
    url: `${SITE_URL}/auth?mode=signup&plan=gold`,
  },
  {
    name: "Platinum Pack",
    slug: "platinum",
    price: 14999,
    description:
      "Complete wedding experience with full custom design, advanced budget tools, and printed cards and cake boxes.",
    url: `${SITE_URL}/auth?mode=signup&plan=platinum`,
  },
] as const;

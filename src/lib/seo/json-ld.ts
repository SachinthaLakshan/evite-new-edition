import { HOME_FAQ } from "./faq";
import { BUSINESS, PLANS, SITE_LEGAL_NAME, SITE_NAME, SITE_URL } from "./site";
import type { SamplePage } from "./samples";
import { sampleOgImage } from "./samples";

const organizationId = `${SITE_URL}/#organization`;
const localBusinessId = `${SITE_URL}/#localbusiness`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.png`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressRegion: BUSINESS.addressRegion,
      addressCountry: BUSINESS.addressCountry,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
      contactType: "customer service",
      availableLanguage: ["English", "Sinhala"],
      areaServed: "LK",
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": localBusinessId,
    name: SITE_LEGAL_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/assets/invite_mockup.png`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    description: DEFAULT_SERVICE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressRegion: BUSINESS.addressRegion,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    priceRange: `Rs. ${BUSINESS.priceLow.toLocaleString("en-LK")} - Rs. ${BUSINESS.priceHigh.toLocaleString("en-LK")}`,
    currenciesAccepted: BUSINESS.currency,
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en",
    description: "Create beautiful digital wedding invitations for Sri Lankan weddings.",
    publisher: { "@id": organizationId },
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Digital Wedding Invitations",
    provider: { "@id": organizationId },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    serviceType: "Digital Wedding Invitation",
    description: DEFAULT_SERVICE_DESCRIPTION,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: BUSINESS.currency,
      lowPrice: String(BUSINESS.priceLow),
      highPrice: String(BUSINESS.priceHigh),
      offerCount: String(PLANS.length),
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: String(plan.price),
        priceCurrency: BUSINESS.currency,
        description: plan.description,
        url: plan.url,
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(sample: SamplePage) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sample.title,
    description: sample.description,
    image: sampleOgImage(sample.imagePath),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: BUSINESS.currency,
      price: String(BUSINESS.priceLow),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/auth?mode=signup`,
    },
  };
}

const DEFAULT_SERVICE_DESCRIPTION =
  "Digital wedding invitations for Sri Lankan weddings with WhatsApp sharing, RSVP tracking, wedding checklist, and budget tools.";

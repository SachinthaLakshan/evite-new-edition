import type { Metadata } from "next";
import {
  BUSINESS,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SITE_URL,
} from "./site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
};

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;
}

export function createPageMetadata({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = "eVite digital wedding invitation on a phone",
  type = "website",
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const resolvedTitle = absoluteTitle ? title : title;
  const openGraphTitle = ogTitle ?? title;
  const openGraphDescription = ogDescription ?? description;

  return {
    title: absoluteTitle ? { absolute: resolvedTitle } : resolvedTitle,
    description,
    alternates: { canonical: path === "/" ? "/" : path },
    authors: [{ name: SITE_NAME }],
    creator: SITE_LEGAL_NAME,
    publisher: SITE_LEGAL_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "geo.region": BUSINESS.geoRegion,
      "geo.placename": BUSINESS.geoPlacename,
      "geo.position": `${BUSINESS.latitude};${BUSINESS.longitude}`,
      ICBM: `${BUSINESS.latitude}, ${BUSINESS.longitude}`,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url,
      siteName: SITE_NAME,
      locale: "en_LK",
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description: openGraphDescription,
      images: [ogImage],
    },
  };
}

export const rootLayoutMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: SITE_NAME }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  other: {
    "geo.region": BUSINESS.geoRegion,
    "geo.placename": BUSINESS.geoPlacename,
    "geo.position": `${BUSINESS.latitude};${BUSINESS.longitude}`,
    ICBM: `${BUSINESS.latitude}, ${BUSINESS.longitude}`,
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [{ url: "/assets/logo.png", type: "image/png" }],
    apple: "/assets/logo.png",
  },
  manifest: "/manifest.webmanifest",
};

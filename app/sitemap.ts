import type { MetadataRoute } from "next";
import { SAMPLE_PAGES, sampleOgImage } from "@/lib/seo/samples";
import { SITE_URL } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const core: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const samples: MetadataRoute.Sitemap = SAMPLE_PAGES.map((sample) => ({
    url: `${SITE_URL}/samples/${sample.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [sampleOgImage(sample.imagePath)],
  }));

  return [...core, ...samples];
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eVite",
    short_name: "eVite",
    description:
      "Digital wedding invitations, WhatsApp RSVPs, checklist, and budget for weddings in Sri Lanka.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6ef",
    theme_color: "#fbf6ef",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

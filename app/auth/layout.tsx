import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up & Login",
  description:
    "Create your eVite account to start a digital wedding invitation, pick a Silver, Gold, or Platinum pack, and manage RSVPs on WhatsApp.",
  path: "/auth",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

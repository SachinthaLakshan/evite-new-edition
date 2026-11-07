import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.evite.lk"),
  title: {
    default: "eVite",
    template: "%s | eVite",
  },
  description:
    "Digital wedding invitations, WhatsApp RSVPs, checklist, and budget for weddings in Sri Lanka.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <link href="https://fonts.googleapis.com/css2?family=MuseoModerno:wght@600&family=Parisienne&family=Send+Flowers&display=swap" rel="stylesheet"/>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

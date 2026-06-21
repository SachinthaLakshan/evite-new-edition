"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-purple-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="eVite Logo"
              width={80}
              height={80}
              className="h-10 w-auto"
            />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-purple-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Privacy Policy</h1>
              <p className="text-sm text-slate-400 mt-1">Last Updated: June 21, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            <p>
              At <strong>eVite</strong>, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share information when you use our website, digital wedding invite services, and planning dashboard (including the Wedding Checklist and Budget Calculator).
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when creating an account, building invites, or planning your budget, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Data:</strong> Contact information, username, password, email address.</li>
                <li><strong>Event Data:</strong> Bride and Groom names, wedding dates, locations, event photos, agenda, and registry details.</li>
                <li><strong>Planning Tools Data:</strong> Checklist items and their statuses, budget estimates, vendor details, and transaction histories.</li>
                <li><strong>Guest Data:</strong> Attendee names, email addresses, RSVP selections, and contact numbers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
              <p>We use the collected information for the following core purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To host, personalize, and maintain your digital wedding invitations.</li>
                <li>To enable your guests to RSVP and receive coordination updates.</li>
                <li>To run and synchronize your Wedding Checklist and Budget Calculator dashboard.</li>
                <li>To communicate transactional emails, technical notices, and service upgrades.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Information Sharing and Security</h2>
              <p>
                We do not sell your personal information. We only share data with essential infrastructure providers (like Supabase for database hosting and Vercel for web hosting) to run the services. We implement strict security measures to protect your account information and wedding details from unauthorized access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Your Rights and Data Access</h2>
              <p>
                You retain complete control of your event pages. You can update or delete your wedding dates, guest RSVP lists, and budget calculations directly through your personal dashboard at any time. If you wish to delete your account entirely, please contact us at <a href="mailto:info@evite.lk" className="text-purple-600 hover:underline">info@evite.lk</a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy periodically. We will notify you of any revisions by updating the "Last Updated" date at the top of this document.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-8 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} eVite.lk. All rights reserved.</p>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditions() {
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
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Terms & Conditions</h1>
              <p className="text-sm text-slate-400 mt-1">Last Updated: June 21, 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
            <p>
              Welcome to <strong>eVite</strong>. By accessing our website, creating digital wedding invitations, or utilizing our dashboard planning tools (Wedding Checklist and Budget Calculator), you agree to comply with and be bound by the following Terms & Conditions.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By using eVite, you confirm that you are at least 18 years of age and possess the legal authority to enter into these terms. If you do not agree to all terms, you must immediately cease using the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Description of Service</h2>
              <p>
                eVite provides an online platform that allows users to create, customize, host, and distribute digital wedding invitations. We also provide dashboard tools including guest RSVP trackers, a wedding task checklist, and a budget tracker.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. User Conduct & Content</h2>
              <p>
                You are solely responsible for all details, images, texts, and dates uploaded to your event page. You agree not to upload content that is illegal, defamatory, abusive, offensive, or violates intellectual property rights. eVite reserves the right to deactivate or delete any event page that violates these guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Pricing, Payments & Refunds</h2>
              <p>
                Certain features (like premium designs, high-volume RSVP tracking, physical print cards, and cake box bundles) are subject to payment under our Silver, Gold, or Platinum packages. All pricing listed on the website is in Rupees (Rs.) and is inclusive of applicable taxes unless stated otherwise. Payments are processed securely. Refund queries are evaluated on a case-by-case basis.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h2>
              <p>
                eVite provides its services "as is" without warranty of any kind. We are not liable for any issues arising from service interruptions, incorrect event dates uploaded by users, or technical problems on third-party mobile devices.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Governing Law</h2>
              <p>
                These Terms & Conditions are governed by the laws of Sri Lanka, and any disputes will be subject to the exclusive jurisdiction of the courts of Sri Lanka.
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

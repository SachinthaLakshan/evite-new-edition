import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { breadcrumbJsonLd, localBusinessJsonLd, organizationJsonLd, productJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SAMPLE_PAGES, getSamplePage, sampleOgImage } from "@/lib/seo/samples";

type SamplePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return SAMPLE_PAGES.map((sample) => ({ slug: sample.slug }));
}

export function generateMetadata({ params }: SamplePageProps): Metadata {
  const sample = getSamplePage(params.slug);
  if (!sample) {
    return {};
  }

  return createPageMetadata({
    title: `${sample.title} | eVite`,
    absoluteTitle: true,
    description: sample.description,
    path: `/samples/${sample.slug}`,
    ogTitle: sample.title,
    ogDescription: sample.description,
    ogImage: sampleOgImage(sample.imagePath),
    ogImageAlt: sample.title,
    type: "article",
  });
}

export default function SampleDesignPage({ params }: SamplePageProps) {
  const sample = getSamplePage(params.slug);
  if (!sample) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          localBusinessJsonLd(),
          websiteJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Samples", path: "/#active-events" },
            { name: sample.title, path: `/samples/${sample.slug}` },
          ]),
          productJsonLd(sample),
        ]}
      />
      <div className="min-h-screen bg-[#fbf6ef] text-slate-900">
        <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/">
              <Image src="/assets/logo.png" alt="eVite Logo" width={96} height={96} className="h-10 w-auto" />
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="rounded-full bg-[#ff7a3d] hover:bg-[#f0682c]">Create your invite</Button>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#9a6b32]">{sample.style} design</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{sample.title}</h1>
          <p className="mt-4 max-w-2xl text-slate-600">{sample.description}</p>

          <div className="mt-10 flex flex-col items-start gap-8 md:flex-row">
            <Image
              src={sample.imagePath}
              alt={sample.title}
              width={480}
              height={960}
              className="w-full max-w-sm rounded-3xl border border-slate-200 shadow-lg"
            />
            <div className="space-y-4">
              <p className="text-slate-600">
                Share this style on WhatsApp with RSVP, maps, and your checklist and budget in one dashboard.
              </p>
              <Link href="/auth?mode=signup">
                <Button size="lg" className="gap-2 rounded-full bg-[#ff7a3d] hover:bg-[#f0682c]">
                  Start with this design
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {sample.livePreviewUrl ? (
                <p className="text-sm text-slate-500">
                  <a href={sample.livePreviewUrl} className="font-semibold text-purple-700 hover:underline">
                    View a live sample invitation
                  </a>
                </p>
              ) : null}
              <p className="text-sm text-slate-500">
                <Link href="/#pricing" className="font-semibold text-slate-700 hover:underline">
                  Compare hosting packs
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

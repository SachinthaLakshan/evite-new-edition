import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogShell } from "@/components/blog/BlogShell";
import { Button } from "@/components/ui/button";
import { getPublishedBlogPosts } from "@/lib/blog/queries";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { BLOG_INDEX_DESCRIPTION, BLOG_OG_IMAGE } from "@/lib/seo/blog";

export const revalidate = 3600;

const title = "Wedding Invitation Blog: Tips & Guides";

export const metadata: Metadata = createPageMetadata({
  title,
  absoluteTitle: true,
  description: BLOG_INDEX_DESCRIPTION,
  path: "/blog",
  ogTitle: `${title} | eVite`,
  ogDescription: BLOG_INDEX_DESCRIPTION,
  ogImage: BLOG_OG_IMAGE,
  ogImageAlt: "eVite wedding planning blog and invitation guides",
  type: "website",
});

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <BlogShell>
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-[#9a6b32]">eVite guides</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Wedding invitation blog
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">{BLOG_INDEX_DESCRIPTION}</p>
          </div>

          {posts.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center">
              <p className="text-slate-600">New guides are on the way. Check back soon.</p>
              <Link href="/auth?mode=signup" className="mt-6 inline-block">
                <Button className="rounded-full bg-[#ff7a3d] hover:bg-[#f0682c]">
                  Start your digital invite
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              {featured ? <BlogPostCard post={featured} featured /> : null}
              {rest.length > 0 ? (
                <section>
                  <h2 className="text-xl font-bold text-slate-900">More guides</h2>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}

          <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Planning something we have not covered yet?</h2>
            <p className="mt-3 text-slate-600">
              Tell us what you would like a guide on and we will write it. For example: homecoming customs,
              building the guest list, table seating, invitation wording, or sending invites on WhatsApp.
            </p>
            <a href="mailto:info@evite.lk?subject=Blog%20topic%20suggestion" className="mt-6 inline-flex">
              <Button
                variant="outline"
                className="gap-2 rounded-full border-[#c4782a] text-[#9a6b32] hover:bg-[#fffaf3]"
              >
                <Mail className="h-4 w-4" />
                Suggest a topic
              </Button>
            </a>
          </section>
        </div>
      </BlogShell>
    </>
  );
}

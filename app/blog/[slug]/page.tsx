import type { Metadata } from "next";
import { BlogCoverImage } from "@/components/blog/BlogCoverImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogShell } from "@/components/blog/BlogShell";
import { Button } from "@/components/ui/button";
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogSlugs,
} from "@/lib/blog/queries";
import {
  formatBlogDate,
  isInvalidBlogBodyHtml,
  looksLikeSqlOrMigration,
  resolvePublicBlogTitle,
} from "@/lib/blog/utils";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { BLOG_OG_IMAGE } from "@/lib/seo/blog";

export const revalidate = 3600;
export const dynamicParams = true;

type BlogPostPageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) return {};

  const title = resolvePublicBlogTitle(post.title, post.slug, post.meta_title);
  const description =
    post.meta_description?.trim() || post.excerpt || "Wedding planning guide from eVite.lk";
  const ogImage = post.cover_image_url || BLOG_OG_IMAGE;

  return createPageMetadata({
    title: `${title} | eVite Blog`,
    absoluteTitle: true,
    description,
    path: `/blog/${post.slug}`,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogImageAlt: title,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) notFound();

  const pageTitle = resolvePublicBlogTitle(post.title, post.slug, post.meta_title);
  const seoTitle = pageTitle;
  const seoDescription = post.meta_description?.trim() || post.excerpt;
  const showExcerpt = Boolean(post.excerpt?.trim()) && !looksLikeSqlOrMigration(post.excerpt);
  const bodyIsSql = isInvalidBlogBodyHtml(post.content_html);

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: pageTitle, path: `/blog/${post.slug}` },
          ]),
          articleJsonLd(post, seoTitle, seoDescription),
        ]}
      />
      <BlogShell>
        <article className="mx-auto max-w-3xl px-6 py-10 md:py-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b32] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All guides
          </Link>

          <header className="mt-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl break-words">
              {pageTitle}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{formatBlogDate(post.published_at)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time_minutes} min read
              </span>
            </p>
            {showExcerpt ? (
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
            ) : null}
          </header>

          {post.cover_image_url ? (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
              <BlogCoverImage
                src={post.cover_image_url}
                alt={pageTitle}
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : null}

          {bodyIsSql ? (
            <p className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-slate-700 leading-relaxed">
              This guide is still being prepared. Check back soon, or create your invitation from the dashboard in
              the meantime.
            </p>
          ) : (
            <div
              className="prose prose-slate prose-lg mt-10 max-w-none prose-headings:font-bold prose-a:text-[#9a6b32] prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          )}

          <BlogPostCta />
        </article>
      </BlogShell>
    </>
  );
}

function BlogPostCta() {
  return (
    <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Ready to send your invite on WhatsApp?</h2>
      <p className="mt-2 text-slate-600">
        Create a mobile wedding invitation with RSVP, checklist, and budget tools built for Sri Lankan weddings.
      </p>
      <Link href="/auth?mode=signup" className="mt-6 inline-block">
        <Button className="rounded-full bg-[#ff7a3d] hover:bg-[#f0682c]">Create your eVite</Button>
      </Link>
    </section>
  );
}

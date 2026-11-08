import Link from "next/link";
import { Clock } from "lucide-react";
import { BlogCoverImage } from "@/components/blog/BlogCoverImage";
import type { BlogPostListItem } from "@/lib/blog/types";
import { formatBlogDate, displayBlogExcerpt, displayBlogTitle } from "@/lib/blog/utils";

type BlogPostCardProps = {
  post: BlogPostListItem;
  featured?: boolean;
};

export function BlogPostCard({ post, featured }: BlogPostCardProps) {
  const href = `/blog/${post.slug}`;
  const title = displayBlogTitle(post.title, post.slug);
  const excerpt = displayBlogExcerpt(post.excerpt);

  if (featured) {
    return (
      <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg transition-shadow hover:shadow-xl">
        <Link href={href} className="block">
          <div className="relative aspect-[16/9] w-full bg-slate-100 sm:aspect-[2/1]">
            {post.cover_image_url ? (
              <BlogCoverImage
                src={post.cover_image_url}
                alt={title}
                priority
                sizes="(max-width: 768px) 100vw, 1152px"
                className="transition-transform duration-500 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-[#f5e6d3] via-[#fffaf3] to-[#e8d4f4] text-sm font-semibold text-[#9a6b32]">
                eVite Wedding Guide
              </div>
            )}
          </div>
          <div className="p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9a6b32]">Featured guide</p>
            <h2 className="mt-3 line-clamp-3 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl group-hover:text-[#9a6b32] transition-colors break-words">
              {title}
            </h2>
            {excerpt ? (
              <p className="mt-4 line-clamp-3 text-slate-600 leading-relaxed break-words">{excerpt}</p>
            ) : null}
            <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{formatBlogDate(post.published_at)}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time_minutes} min read
              </span>
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] bg-slate-100">
          {post.cover_image_url ? (
            <BlogCoverImage
              src={post.cover_image_url}
              alt={title}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-[#f5e6d3] text-xs font-semibold text-slate-400">
              Guide
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-[#9a6b32] transition-colors break-words">
            {title}
          </h3>
          {excerpt ? (
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600 break-words">{excerpt}</p>
          ) : null}
          <p className="mt-4 text-xs text-slate-500">
            {formatBlogDate(post.published_at)} · {post.reading_time_minutes} min read
          </p>
        </div>
      </Link>
    </article>
  );
}

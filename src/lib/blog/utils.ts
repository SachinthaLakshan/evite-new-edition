export const BLOG_TITLE_MAX = 120;
export const BLOG_EXCERPT_MAX = 320;

const SQL_CONTENT_PATTERN =
  /\b(CREATE TABLE|ALTER TABLE|ENABLE ROW LEVEL SECURITY|CREATE POLICY|CREATE INDEX)\b/i;

export function looksLikeSqlOrMigration(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("--")) return true;
  return SQL_CONTENT_PATTERN.test(trimmed);
}

export function isInvalidBlogTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) return true;
  if (trimmed.length > BLOG_TITLE_MAX) return true;
  return looksLikeSqlOrMigration(trimmed);
}

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Safe headline for public blog pages when DB title is missing or mis-pasted. */
export function resolvePublicBlogTitle(
  title: string,
  slug: string,
  metaTitle?: string | null,
): string {
  const meta = metaTitle?.trim();
  if (meta && !isInvalidBlogTitle(meta)) return meta;
  if (!isInvalidBlogTitle(title)) return title.trim();
  return humanizeSlug(slug) || "Wedding guide";
}

export function isInvalidBlogBodyHtml(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 60) return false;
  return looksLikeSqlOrMigration(text) && /blog_posts/i.test(text);
}

export function displayBlogTitle(title: string, slug?: string): string {
  if (slug && isInvalidBlogTitle(title)) {
    return resolvePublicBlogTitle(title, slug);
  }
  const trimmed = title.trim();
  if (trimmed.length <= BLOG_TITLE_MAX) return trimmed;
  return `${trimmed.slice(0, BLOG_TITLE_MAX).trimEnd()}…`;
}

export function displayBlogExcerpt(excerpt: string): string {
  const trimmed = excerpt.trim();
  if (!trimmed || looksLikeSqlOrMigration(trimmed)) return "";
  if (trimmed.length <= BLOG_EXCERPT_MAX) return trimmed;
  return `${trimmed.slice(0, BLOG_EXCERPT_MAX).trimEnd()}…`;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function estimateReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

export function formatBlogDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

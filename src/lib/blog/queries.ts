import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { BlogPost, BlogPostListItem } from "./types";

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient<Database>(url, key);
}

const LIST_COLUMNS =
  "id, slug, title, excerpt, cover_image_url, published_at, reading_time_minutes";

export async function getPublishedBlogPosts(): Promise<BlogPostListItem[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getPublishedBlogPosts", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPublishedBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedBlogPostBySlug", error.message);
    return null;
  }
  return data ?? null;
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => p.slug);
}

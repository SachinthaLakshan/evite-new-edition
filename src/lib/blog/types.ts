export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  reading_time_minutes: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogPostListItem = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image_url"
  | "published_at"
  | "reading_time_minutes"
>;

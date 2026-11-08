-- Blog posts for public wedding guides / SEO content

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content_html text NOT NULL DEFAULT '',
  cover_image_url text,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_time_minutes integer NOT NULL DEFAULT 5,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx
  ON public.blog_posts (published_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_blog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
$$;

CREATE POLICY "blog_posts_public_read"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "blog_posts_admin_all"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (public.is_blog_admin())
  WITH CHECK (public.is_blog_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "blog_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_blog_admin());

CREATE POLICY "blog_images_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_blog_admin())
  WITH CHECK (bucket_id = 'blog-images' AND public.is_blog_admin());

CREATE POLICY "blog_images_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_blog_admin());

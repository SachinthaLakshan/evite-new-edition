-- Default meta image for each invitation theme. Rows are seeded here.
-- Admins replace the image; they do not add or remove themes from the app.

CREATE TABLE IF NOT EXISTS public.theme_meta_images (
  theme_id text PRIMARY KEY,
  theme_name text NOT NULL,
  image_url text,
  storage_path text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.theme_meta_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "theme_meta_images_admin_select"
  ON public.theme_meta_images
  FOR SELECT
  TO authenticated
  USING (public.is_blog_admin());

CREATE POLICY "theme_meta_images_admin_update"
  ON public.theme_meta_images
  FOR UPDATE
  TO authenticated
  USING (public.is_blog_admin())
  WITH CHECK (public.is_blog_admin());

INSERT INTO public.theme_meta_images (theme_id, theme_name)
VALUES
  ('classic', 'Classic Design'),
  ('lavender', 'Lavender Design'),
  ('sage', 'Sage Design'),
  ('redrose', 'Red Rose Design'),
  ('redroseclassic', 'Red Rose Classic'),
  ('creamclassicdesign', 'Cream Classic Design'),
  ('lotuspremium', 'Lotus Premium'),
  ('cozyroyale', 'Cozy Royale')
ON CONFLICT (theme_id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'theme-meta-images',
  'theme-meta-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "theme_meta_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'theme-meta-images');

CREATE POLICY "theme_meta_images_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'theme-meta-images' AND public.is_blog_admin());

CREATE POLICY "theme_meta_images_admin_storage_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'theme-meta-images' AND public.is_blog_admin())
  WITH CHECK (bucket_id = 'theme-meta-images' AND public.is_blog_admin());

CREATE POLICY "theme_meta_images_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'theme-meta-images' AND public.is_blog_admin());

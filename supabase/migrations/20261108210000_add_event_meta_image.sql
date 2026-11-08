-- Per-event WhatsApp share image, composed from the theme default or a couple photo.

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS meta_image_url text;

COMMENT ON COLUMN public.events.meta_image_url IS
  'Composed share image for this event. Used as the Open Graph image.';

-- Event owners need the admin-uploaded theme default while composing their own image.
CREATE POLICY "theme_meta_images_member_select"
  ON public.theme_meta_images
  FOR SELECT
  TO authenticated
  USING (true);

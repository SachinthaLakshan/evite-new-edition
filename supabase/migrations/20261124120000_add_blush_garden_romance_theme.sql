INSERT INTO public.theme_meta_images (theme_id, theme_name)
VALUES ('blushgardenromance', 'Blush Garden Romance')
ON CONFLICT (theme_id) DO NOTHING;

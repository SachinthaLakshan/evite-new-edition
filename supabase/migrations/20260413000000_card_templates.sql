-- Create card templates table
CREATE TABLE IF NOT EXISTS public.card_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  template_url text, -- Admin internal url (e.g. Canva link)
  created_at timestamptz DEFAULT now()
);

-- Update events table to link selected template and store final design
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS selected_template_id uuid REFERENCES public.card_templates(id),
ADD COLUMN IF NOT EXISTS final_card_url text;

-- Enable RLS for templates
ALTER TABLE public.card_templates ENABLE ROW LEVEL SECURITY;

-- Templates public read
CREATE POLICY "Templates public read" ON public.card_templates 
FOR SELECT TO anon, authenticated 
USING (true);

-- Templates admin manage (Check for admin role in profiles)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'card_templates' AND policyname = 'Admin manage templates'
    ) THEN
        CREATE POLICY "Admin manage templates" ON public.card_templates 
        FOR ALL TO authenticated 
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
          )
        );
    END IF;
END
$$;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS bride_name text,
ADD COLUMN IF NOT EXISTS groom_name text;


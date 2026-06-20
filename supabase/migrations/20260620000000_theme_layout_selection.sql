-- Update existing theme_ids to 'classic' if they are null or contain legacy theme names, ensuring backward compatibility.
UPDATE public.events 
SET theme_id = 'classic' 
WHERE theme_id IS NULL OR theme_id NOT IN ('classic', 'lavender');

-- Set 'classic' as the default value for new events
ALTER TABLE public.events 
ALTER COLUMN theme_id SET DEFAULT 'classic';

-- Add a comment explaining the theme_id column options
COMMENT ON COLUMN public.events.theme_id IS 'RSVP page layout design style: classic, lavender, etc.';

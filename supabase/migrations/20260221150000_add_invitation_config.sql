-- Add invitation configuration fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS invitation_config JSONB DEFAULT NULL;

-- Add guest name position to attendees table
ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS guest_name_position TEXT DEFAULT 'top',
ADD COLUMN IF NOT EXISTS custom_greeting TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.events.invitation_config IS 'Stores invitation customization: template_id, couple_names, custom_text, text_positions, styling, guest_name_position';
COMMENT ON COLUMN public.attendees.guest_name_position IS 'Position where guest name appears on invitation: top, bottom, header, center';
COMMENT ON COLUMN public.attendees.custom_greeting IS 'Personalized greeting message for this guest';

-- Migration: Add opener_style column to public.events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS opener_style VARCHAR(50) DEFAULT 'button';

COMMENT ON COLUMN public.events.opener_style IS 'Invite opener button style: button (Classic Button) or envelope (Envelope Animation)';

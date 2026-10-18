-- Migration: Add show_maybe_button column to public.events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS show_maybe_button BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.events.show_maybe_button IS 'Whether to show the Maybe RSVP button on public invitation templates';

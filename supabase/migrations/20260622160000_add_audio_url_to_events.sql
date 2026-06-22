-- Migration: Add audio_url column to public.events table
-- This stores the URL of the uploaded MP3 background music for invitations.

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.events.audio_url IS 'Stores the URL of the uploaded MP3 background music for the invitation layout';

-- Migration: Fix Public RSVP RLS Policies for Logged In Users
-- This addresses the issue where authenticated users could not view or RSVP to other people's events
-- because the public select policies were limited only to the 'anon' role.

-- 1. Update public.events SELECT policy
DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Update public.attendees SELECT policy
DROP POLICY IF EXISTS "attendees_public_read" ON public.attendees;
CREATE POLICY "attendees_public_read" ON public.attendees
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Update public.short_urls policy (so authenticated users can also shorten urls)
DROP POLICY IF EXISTS "short_urls_public_all" ON public.short_urls;
CREATE POLICY "short_urls_public_all" ON public.short_urls
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

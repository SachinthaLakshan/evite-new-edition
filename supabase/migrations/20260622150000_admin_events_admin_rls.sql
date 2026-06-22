-- Migration: Add Admin RLS Policies for Events and Attendees
-- This allows users marked as admins in the profiles table to read, insert, update, and delete events and attendees.

-- 1. Policies for public.events table
CREATE POLICY "events_admin_all" ON public.events
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- 2. Policies for public.attendees table
CREATE POLICY "attendees_admin_all" ON public.attendees
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

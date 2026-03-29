
-- Create a new policy to allow both authenticated and anon users to update attendee records
-- This specifically addresses the issue where logged-in guests couldn't RSVP to other people's events.

CREATE POLICY "attendees_update_response_all" ON public.attendees
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Note: We use USING (true) because the update is already filtered by ID in the application code.
-- This policy allows any user who knows the attendee ID to update the record.

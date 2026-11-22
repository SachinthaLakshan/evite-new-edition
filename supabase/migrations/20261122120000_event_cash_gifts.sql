-- Opt-in cash gifts via bank transfer. Existing events stay off.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS gifts_enabled boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_event_owner_or_admin(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = p_event_id
      AND (
        e.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.is_admin = true
        )
      )
  );
$$;

CREATE TABLE IF NOT EXISTS public.event_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  branch text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_bank_accounts_event_id_idx
  ON public.event_bank_accounts(event_id);

CREATE TABLE IF NOT EXISTS public.event_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_id uuid NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  bank_account_id uuid NULL REFERENCES public.event_bank_accounts(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'LKR',
  message text NULL,
  slip_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_gifts_event_id_idx ON public.event_gifts(event_id);
CREATE INDEX IF NOT EXISTS event_gifts_attendee_id_idx ON public.event_gifts(attendee_id);

ALTER TABLE public.event_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_bank_accounts_select"
  ON public.event_bank_accounts
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_event_owner_or_admin(event_id)
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND e.gifts_enabled = true
    )
  );

CREATE POLICY "event_bank_accounts_insert"
  ON public.event_bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_event_owner_or_admin(event_id));

CREATE POLICY "event_bank_accounts_update"
  ON public.event_bank_accounts
  FOR UPDATE
  TO authenticated
  USING (public.is_event_owner_or_admin(event_id))
  WITH CHECK (public.is_event_owner_or_admin(event_id));

CREATE POLICY "event_bank_accounts_delete"
  ON public.event_bank_accounts
  FOR DELETE
  TO authenticated
  USING (public.is_event_owner_or_admin(event_id));

CREATE POLICY "event_gifts_select_owner_admin"
  ON public.event_gifts
  FOR SELECT
  TO authenticated
  USING (public.is_event_owner_or_admin(event_id));

CREATE POLICY "event_gifts_insert_listed_guest"
  ON public.event_gifts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_id
        AND e.gifts_enabled = true
    )
    AND EXISTS (
      SELECT 1
      FROM public.attendees a
      WHERE a.id = attendee_id
        AND a.event_id = event_gifts.event_id
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gift-slips',
  'gift-slips',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "gift_slips_insert"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'gift-slips'
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id::text = (storage.foldername(name))[1]
        AND e.gifts_enabled = true
    )
  );

CREATE POLICY "gift_slips_select_owner_admin"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'gift-slips'
    AND public.is_event_owner_or_admin(((storage.foldername(name))[1])::uuid)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_bank_accounts TO authenticated;
GRANT SELECT ON public.event_bank_accounts TO anon;
GRANT SELECT ON public.event_gifts TO authenticated;
GRANT INSERT ON public.event_gifts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_owner_or_admin(uuid) TO anon, authenticated;

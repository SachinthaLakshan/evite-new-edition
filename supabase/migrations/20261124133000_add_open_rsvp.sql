-- Shared invitation RSVP. Off for every existing event.
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS open_rsvp BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS party_size INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS rsvp_source TEXT NULL;

COMMENT ON COLUMN public.events.open_rsvp IS 'When true, guests use one shared invitation link and submit their own RSVP. Default false keeps unique guest links.';
COMMENT ON COLUMN public.attendees.party_size IS 'People counted for an accepted reply. Existing rows stay at 1.';
COMMENT ON COLUMN public.attendees.rsvp_source IS 'open when the reply came from the shared RSVP form. Null for host-added guests.';

CREATE OR REPLACE FUNCTION public.submit_open_rsvp(
  p_event_id uuid,
  p_name text,
  p_whatsapp text,
  p_attending boolean,
  p_party_size integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event public.events%ROWTYPE;
  v_id uuid;
  v_response text;
  v_size integer;
  v_phone text;
  v_digits text;
BEGIN
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'Event is required';
  END IF;

  SELECT * INTO v_event FROM public.events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  IF v_event.open_rsvp IS NOT TRUE THEN
    RAISE EXCEPTION 'Open RSVP is not enabled for this invitation';
  END IF;
  IF v_event.is_active IS FALSE THEN
    RAISE EXCEPTION 'This invitation is not accepting replies';
  END IF;

  IF p_name IS NULL OR length(btrim(p_name)) < 2 OR length(btrim(p_name)) > 80 THEN
    RAISE EXCEPTION 'Please enter your full name';
  END IF;

  v_phone := regexp_replace(coalesce(p_whatsapp, ''), '[^0-9+]', '', 'g');
  v_digits := regexp_replace(v_phone, '\D', '', 'g');
  IF length(v_digits) < 8 OR length(v_digits) > 15 THEN
    RAISE EXCEPTION 'Please enter a valid WhatsApp number';
  END IF;
  IF left(v_phone, 1) <> '+' THEN
    v_phone := '+' || v_digits;
  END IF;

  v_response := CASE WHEN p_attending IS TRUE THEN 'yes' ELSE 'no' END;
  v_size := least(greatest(coalesce(p_party_size, 1), 1), 20);

  SELECT id INTO v_id
  FROM public.attendees
  WHERE event_id = p_event_id
    AND rsvp_source = 'open'
    AND regexp_replace(coalesce(whatsapp_number, ''), '\D', '', 'g') = v_digits
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE public.attendees
    SET name = btrim(p_name),
        whatsapp_number = v_phone,
        response = v_response,
        party_size = v_size
    WHERE id = v_id;
  ELSE
    INSERT INTO public.attendees (
      event_id, name, email, whatsapp_number, response, party_size, rsvp_source
    ) VALUES (
      p_event_id, btrim(p_name), '', v_phone, v_response, v_size, 'open'
    )
    RETURNING id INTO v_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_id,
    'response', v_response,
    'party_size', v_size
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_open_rsvp(uuid, text, text, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_open_rsvp(uuid, text, text, boolean, integer) TO anon, authenticated;

-- Each shared-link RSVP counts as one guest.
UPDATE public.attendees
SET party_size = 1
WHERE rsvp_source = 'open'
  AND party_size IS DISTINCT FROM 1;

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
        party_size = 1
    WHERE id = v_id;
  ELSE
    INSERT INTO public.attendees (
      event_id, name, email, whatsapp_number, response, party_size, rsvp_source
    ) VALUES (
      p_event_id, btrim(p_name), '', v_phone, v_response, 1, 'open'
    )
    RETURNING id INTO v_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_id,
    'response', v_response,
    'party_size', 1
  );
END;
$$;

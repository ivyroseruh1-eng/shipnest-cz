DO $$
DECLARE
  r RECORD;
  steps jsonb;
  new_steps jsonb;
  customer_state text;
  customer_city text;
  state_or_city text;
  has_dispatch boolean;
BEGIN
  FOR r IN SELECT id, customer, tracking_steps FROM public.orders WHERE status != 'Cancelled' LOOP
    steps := r.tracking_steps;
    customer_city := COALESCE(r.customer->>'city', 'Your City');
    customer_state := COALESCE(r.customer->>'state', '');
    state_or_city := CASE WHEN customer_state = '' THEN customer_city ELSE customer_state END;

    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(steps) elem
      WHERE elem->>'status' LIKE 'Dispatched to %'
    ) INTO has_dispatch;

    IF NOT has_dispatch THEN
      new_steps := '[]'::jsonb;
      FOR i IN 0..jsonb_array_length(steps) - 1 LOOP
        new_steps := new_steps || (steps->i);
        IF (steps->i->>'status') = 'Arrived at Regional Hub' THEN
          new_steps := new_steps || jsonb_build_object(
            'id', gen_random_uuid()::text,
            'status', 'Dispatched to ' || state_or_city,
            'icon', '🚛',
            'city', 'Guwahati',
            'state', 'Assam',
            'country', 'India',
            'timestamp', '',
            'completed', false
          );
        END IF;
      END LOOP;

      UPDATE public.orders SET tracking_steps = new_steps WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
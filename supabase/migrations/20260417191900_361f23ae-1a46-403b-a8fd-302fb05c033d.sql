-- 1. Add delivery_pin column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_pin text;

-- 2. Backfill existing orders with random 4-digit PIN
UPDATE public.orders
SET delivery_pin = lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
WHERE delivery_pin IS NULL OR delivery_pin = '';

-- 3. Set default for future inserts
ALTER TABLE public.orders
  ALTER COLUMN delivery_pin SET DEFAULT lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');

-- 4. Rebuild tracking_steps for non-cancelled orders to insert "Arrived at Local City" step
--    between "Moving to Regional Hub / Arrived at Regional Hub" (Guwahati) and "Out for Delivery".
--    We do this by updating each row individually using jsonb manipulation.
DO $$
DECLARE
  r RECORD;
  steps jsonb;
  new_steps jsonb;
  customer_city text;
  customer_state text;
  customer_country text;
  has_pickup boolean;
BEGIN
  FOR r IN SELECT id, customer, tracking_steps FROM public.orders WHERE status != 'Cancelled' LOOP
    steps := r.tracking_steps;
    customer_city := COALESCE(r.customer->>'city', 'Your City');
    customer_state := COALESCE(r.customer->>'state', '');
    customer_country := COALESCE(r.customer->>'country', 'India');

    -- Check if a pickup-city step already exists (idempotent)
    SELECT EXISTS (
      SELECT 1 FROM jsonb_array_elements(steps) elem
      WHERE elem->>'status' = 'Arrived at Local Delivery Hub'
    ) INTO has_pickup;

    IF NOT has_pickup THEN
      -- Build the new step
      new_steps := '[]'::jsonb;
      FOR i IN 0..jsonb_array_length(steps) - 1 LOOP
        new_steps := new_steps || (steps->i);
        -- Insert pickup step right after "Arrived at Regional Hub" (Guwahati)
        IF (steps->i->>'status') = 'Arrived at Regional Hub' THEN
          new_steps := new_steps || jsonb_build_object(
            'id', gen_random_uuid()::text,
            'status', 'Arrived at Local Delivery Hub',
            'icon', '🏪',
            'city', customer_city,
            'state', customer_state,
            'country', customer_country,
            'timestamp', '',
            'completed', false
          );
        END IF;
      END LOOP;

      UPDATE public.orders SET tracking_steps = new_steps WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
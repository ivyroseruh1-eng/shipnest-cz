
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  tracking_id TEXT NOT NULL UNIQUE,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Order Placed',
  estimated_delivery TEXT NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  tracking_steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update orders"
  ON public.orders FOR UPDATE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

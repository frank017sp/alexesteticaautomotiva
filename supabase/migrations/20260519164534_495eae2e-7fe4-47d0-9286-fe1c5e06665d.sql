
CREATE TABLE public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  price_value NUMERIC NOT NULL,
  price_hint TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.services (id, name, price, price_value, price_hint, sort_order) VALUES
  ('conv', 'Lavagem Convencional', 'R$ 70', 70, NULL, 1),
  ('det', 'Lavagem Detalhada', 'R$ 130', 130, NULL, 2),
  ('est', 'Higienização de Estofados', 'R$ 300', 300, 'A partir de', 3),
  ('sco', 'Scooter Elétrica', 'R$ 40', 40, NULL, 4);

CREATE TABLE public.closed_days (
  date DATE PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.closed_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view closed days" ON public.closed_days FOR SELECT USING (true);
CREATE POLICY "Admins can insert closed days" ON public.closed_days FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete closed days" ON public.closed_days FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

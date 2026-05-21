INSERT INTO public.services (id, name, price, price_value, price_hint, sort_order)
VALUES
  ('conv', 'Lavagem Convencional',      'R$ 70',  70,  NULL,            1),
  ('det',  'Lavagem Detalhada',         'R$ 130', 130, NULL,            2),
  ('est',  'Higienização de Estofados', 'R$ 300', 300, 'A partir de',   3),
  ('sco',  'Scooter Elétrica',          'R$ 40',  40,  NULL,            4)
ON CONFLICT (id) DO NOTHING;
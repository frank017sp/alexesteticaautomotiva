-- Atualiza os preços e serviços. Execute no banco Supabase vinculado ao Lovable.
INSERT INTO public.services (id, name, price, price_value, price_hint, sort_order)
VALUES
 ('conv','Lavagem Convencional','R$ 84,99',84.99,NULL,1),
 ('comp','Lavagem Completa','R$ 114,99',114.99,NULL,2),
 ('det_small','Lavagem Detalhada','R$ 159,99',159.99,'Carros pequenos',3),
 ('det_suv','Lavagem Detalhada','R$ 199,99',199.99,'Carros SUV',4),
 ('moto','Lavagem de Moto Simples','R$ 39,99',39.99,NULL,5),
 ('est','Lavagem de Estofados','R$ 299,99',299.99,'A partir de',6),
 ('plast','Revitalização de Plástico','R$ 24,99',24.99,NULL,7)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,price=EXCLUDED.price,price_value=EXCLUDED.price_value,price_hint=EXCLUDED.price_hint,sort_order=EXCLUDED.sort_order,updated_at=now();
-- Agendamentos antigos guardam o nome/preço, independentemente de alterações no catálogo.
DELETE FROM public.services WHERE id IN ('sco','det');

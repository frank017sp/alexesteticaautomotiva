
-- Enum de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de papéis (separada para evitar privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function para checar papel (evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Apenas admins podem visualizar a tabela de papéis
CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de agendamentos
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome text NOT NULL,
  cliente_whats text NOT NULL,
  modelo text NOT NULL,
  servico_id text NOT NULL,
  servico_nome text NOT NULL,
  servico_preco text NOT NULL,
  data_agendamento date NOT NULL,
  horario text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (data_agendamento, horario)
);

CREATE INDEX bookings_data_idx ON public.bookings (data_agendamento);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler/alterar/excluir; inserts são feitos via server function (service role)
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

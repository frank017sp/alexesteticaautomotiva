-- Explicit deny-by-default write policies on user_roles.
-- The table already has RLS enabled and a SELECT policy for admins.
-- These policies make it explicit that no client (anon or authenticated)
-- can INSERT/UPDATE/DELETE rows. Role provisioning must go through
-- trusted server-side code using the service role key.

CREATE POLICY "No client inserts on user_roles"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No client updates on user_roles"
ON public.user_roles
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No client deletes on user_roles"
ON public.user_roles
FOR DELETE
TO anon, authenticated
USING (false);
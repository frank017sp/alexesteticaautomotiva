import { createMiddleware } from "@tanstack/react-start";

// Replaces the generated attachSupabaseAuth: attaches the admin's login token when
// available, but never blocks public calls (booking, availability) if the auth
// client can't start in the browser.
export const safeAttachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch (error) {
      console.warn("Sessão indisponível; seguindo sem login.", error);
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);

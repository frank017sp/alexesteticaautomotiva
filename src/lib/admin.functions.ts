import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito");
}

// ---------- SERVICES ----------
export const listServicesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return { services: data };
});

const updateServiceSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  price: z.string().min(1).max(40),
  price_value: z.number().min(0).max(100000),
  price_hint: z.string().max(60).nullable().optional(),
});

export const updateService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateServiceSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("services")
      .update({
        name: data.name,
        price: data.price,
        price_value: data.price_value,
        price_hint: data.price_hint ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- CLOSED DAYS ----------
export const listClosedDaysPublic = createServerFn({ method: "GET" }).handler(async () => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("closed_days")
    .select("*")
    .gte("date", todayIso)
    .order("date", { ascending: true });
  if (error) throw error;
  return { closedDays: data };
});

const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(120).optional().nullable(),
});

export const addClosedDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => dateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("closed_days")
      .insert({ date: data.date, reason: data.reason ?? null });
    if (error && (error as { code?: string }).code !== "23505") throw error;
    return { ok: true };
  });

export const removeClosedDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("closed_days").delete().eq("date", data.date);
    if (error) throw error;
    return { ok: true };
  });

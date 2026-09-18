import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
});

export const getBusyTimes = createServerFn({ method: "POST" })
  .inputValidator((input) => dateSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      // A consulta é feita no servidor, sem expor chaves nem dados pessoais.
      const { data: rows, error } = await supabaseAdmin
        .from("bookings")
        .select("horario")
        .eq("data_agendamento", data.date);
      if (error) throw error;
      return {
        busy: (rows ?? []).map((row) => String(row.horario).trim().slice(0, 5)),
        error: null,
      };
    } catch (error) {
      console.error("getBusyTimes: falha ao consultar vagas no servidor", error);
      return { busy: [] as string[], error: "Disponibilidade temporariamente indisponível." };
    }
  });

const bookingSchema = z.object({
  clienteNome: z.string().trim().min(1).max(120),
  clienteWhats: z.string().trim().min(8).max(40).regex(/^[\d\s+()-]+$/, "Telefone inválido"),
  modelo: z.string().trim().min(1).max(120),
  servicoId: z.string().min(1).max(40),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horario: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    // Trust the service id only — fetch the real name/price from the DB
    // to prevent clients from spoofing fake services or prices.
    const { data: svc, error: svcError } = await supabaseAdmin
      .from("services")
      .select("name, price")
      .eq("id", data.servicoId)
      .maybeSingle();
    if (svcError) {
      console.error("createBooking service lookup error", svcError);
      return { ok: false, conflict: false, error: "Não foi possível validar o serviço." };
    }
    if (!svc) {
      return { ok: false, conflict: false, error: "Serviço inválido." };
    }
    const { data: closed } = await supabaseAdmin
      .from("closed_days")
      .select("date")
      .eq("date", data.data)
      .maybeSingle();
    if (closed) {
      return { ok: false, conflict: false, error: "Estabelecimento fechado nesta data." };
    }
    const { error } = await supabaseAdmin.from("bookings").insert({
      cliente_nome: data.clienteNome,
      cliente_whats: data.clienteWhats,
      modelo: data.modelo,
      servico_id: data.servicoId,
      servico_nome: svc.name,
      servico_preco: svc.price,
      data_agendamento: data.data,
      horario: data.horario,
    });
    if (error) {
      // 23505 = unique_violation -> slot already taken
      if ((error as { code?: string }).code === "23505") {
        return { ok: false, conflict: true, error: "Este horário acabou de ser reservado por outro cliente." };
      }
      console.error("createBooking error", error);
      return { ok: false, conflict: false, error: "Não foi possível salvar o agendamento." };
    }
    return { ok: true, conflict: false, error: null };
  });

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      throw new Error("Acesso restrito");
    }
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("data_agendamento", { ascending: true })
      .order("horario", { ascending: true });
    if (error) throw error;
    return { bookings: data };
  });

const idSchema = z.object({ id: z.string().uuid() });

export const deleteBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      throw new Error("Acesso restrito");
    }
    const { error } = await supabaseAdmin.from("bookings").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
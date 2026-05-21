import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteBooking, listBookings } from "@/lib/bookings.functions";
import {
  listServicesPublic,
  updateService,
  listClosedDaysPublic,
  addClosedDay,
  removeClosedDay,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, LogOut, Calendar, Phone, Car, Plus, Save } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin · Alex Lava-Car" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Booking = {
  id: string;
  cliente_nome: string;
  cliente_whats: string;
  modelo: string;
  servico_nome: string;
  servico_preco: string;
  data_agendamento: string;
  horario: string;
  status: string;
  created_at: string;
};

type Service = {
  id: string;
  name: string;
  price: string;
  price_value: number;
  price_hint: string | null;
  sort_order: number;
};

type ClosedDay = { date: string; reason: string | null };

function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha inválidos.");
      return;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full space-y-4 rounded-2xl border border-white/10 bg-card p-6">
          <h1 className="text-xl font-bold">Painel Alex Lava-Car</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito ao administrador.</p>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde…" : "Entrar"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel Alex Lava-Car</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </header>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="closed">Dias fechados</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-6">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="closed" className="mt-6">
          <ClosedDaysTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function BookingsTab() {
  const listFn = useServerFn(listBookings);
  const delFn = useServerFn(deleteBooking);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const load = async () => {
    setLoadingList(true);
    try {
      const res = await listFn();
      setBookings(res.bookings as Booking[]);
    } catch (err) {
      console.error(err);
      toast.error("Acesso negado ou erro ao carregar.");
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar este agendamento?")) return;
    try {
      await delFn({ data: { id } });
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Agendamento cancelado.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível cancelar.");
    }
  };

  const formatDateBR = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{bookings.length} agendamento(s)</p>
      {loadingList ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum agendamento ainda.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-xl border border-white/10 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-bold">{b.cliente_nome}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> {formatDateBR(b.data_agendamento)} · {b.horario}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <a className="underline" href={`https://wa.me/${b.cliente_whats.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      {b.cliente_whats}
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Car className="h-3.5 w-3.5" /> {b.modelo}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">{b.servico_nome}</span> · {b.servico_preco}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCancel(b.id)}>
                  <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Cancelar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ServicesTab() {
  const listFn = useServerFn(listServicesPublic);
  const updateFn = useServerFn(updateService);
  const [services, setServices] = useState<Service[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    listFn()
      .then((res) => setServices((res.services as Service[]) ?? []))
      .catch((e) => { console.error(e); toast.error("Erro ao carregar serviços."); });
  }, [listFn]);

  const updateLocal = (id: string, patch: Partial<Service>) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const save = async (s: Service) => {
    setSavingId(s.id);
    try {
      await updateFn({
        data: {
          id: s.id,
          name: s.name,
          price: s.price,
          price_value: Number(s.price_value),
          price_hint: s.price_hint ?? null,
        },
      });
      toast.success("Serviço atualizado.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Edite os preços e nomes dos serviços exibidos no site.</p>
      {services.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-card p-4 space-y-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={s.name} onChange={(e) => updateLocal(s.id, { name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Preço (texto)</Label>
              <Input value={s.price} onChange={(e) => updateLocal(s.id, { price: e.target.value })} placeholder="R$ 70" />
            </div>
            <div className="space-y-1">
              <Label>Valor (número)</Label>
              <Input
                type="number"
                value={s.price_value}
                onChange={(e) => updateLocal(s.id, { price_value: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Observação do preço (opcional)</Label>
            <Input
              value={s.price_hint ?? ""}
              onChange={(e) => updateLocal(s.id, { price_hint: e.target.value || null })}
              placeholder="Ex: A partir de"
            />
          </div>
          <Button size="sm" onClick={() => save(s)} disabled={savingId === s.id}>
            <Save className="mr-2 h-4 w-4" /> {savingId === s.id ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      ))}
    </div>
  );
}

function ClosedDaysTab() {
  const listFn = useServerFn(listClosedDaysPublic);
  const addFn = useServerFn(addClosedDay);
  const removeFn = useServerFn(removeClosedDay);
  const [days, setDays] = useState<ClosedDay[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await listFn();
      setDays((res.closedDays as ClosedDay[]) ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar dias fechados.");
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setBusy(true);
    try {
      await addFn({ data: { date: newDate, reason: newReason || null } });
      setNewDate("");
      setNewReason("");
      toast.success("Dia fechado adicionado.");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível adicionar.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (date: string) => {
    if (!confirm("Reabrir este dia?")) return;
    try {
      await removeFn({ data: { date } });
      setDays((prev) => prev.filter((d) => d.date !== date));
      toast.success("Dia reaberto.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível remover.");
    }
  };

  const formatDateBR = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-white/10 bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">Marcar dia como fechado</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Data</Label>
            <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Motivo (opcional)</Label>
            <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Ex: Feriado" />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={busy}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </form>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">{days.length} dia(s) fechado(s) próximos</p>
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum dia fechado.</p>
        ) : (
          <ul className="space-y-2">
            {days.map((d) => (
              <li key={d.date} className="flex items-center justify-between rounded-lg border border-white/10 bg-card p-3">
                <div>
                  <p className="font-semibold">{formatDateBR(d.date)}</p>
                  {d.reason && <p className="text-xs text-muted-foreground">{d.reason}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(d.date)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

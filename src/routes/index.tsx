import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createBooking, getBusyTimes } from "@/lib/bookings.functions";
import { listServicesPublic, listClosedDaysPublic } from "@/lib/admin.functions";
import { Clock, Car, Sparkles, Sofa, Bike, Check, MessageCircle, User, Phone, CarFront, Instagram, Calendar as CalIcon, Volume2, VolumeX, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";
import heroVideo from "@/assets/hero-bg.mp4";
import svcCar from "@/assets/svc-car.webp";
import svcPolisher from "@/assets/svc-polisher.webp";
import svcSofa from "@/assets/svc-sofa.webp";
import svcScooter from "@/assets/svc-scooter.webp";
import svcMoto from "@/assets/svc-moto.png";
import car1 from "@/assets/car-1.webp";
import car2 from "@/assets/car-2.webp";
import car3 from "@/assets/car-3.webp";
import car4 from "@/assets/car-4.webp";
import car5 from "@/assets/car-5.webp";
import instagramCard from "@/assets/instagram-card.webp";

const HERO_PHOTOS = [car1, car2, car3, car4, car5];

const SERVICE_VISUALS: Record<string, { icon: typeof Car; image: string }> = {
  conv: { icon: Car, image: svcCar },
  det: { icon: Sparkles, image: svcPolisher },
  est: { icon: Sofa, image: svcSofa },
  sco: { icon: Bike, image: svcScooter },
  moto: { icon: Bike, image: svcMoto },
};
const DEFAULT_VISUAL = { icon: Car, image: svcCar };


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Alex Lava-Car · Agende sua lavagem premium" },
      { name: "description", content: "Estética automotiva premium. Agende sua lavagem em menos de 2 minutos." },
      { property: "og:title", content: "Alex Lava-Car · Agende sua lavagem premium" },
      { property: "og:description", content: "Estética automotiva premium. Agende sua lavagem em menos de 2 minutos." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://alexesteticaautomotiva.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://alexesteticaautomotiva.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Alex Lava-Car",
          telephone: "+554192701937",
          url: "https://alexesteticaautomotiva.lovable.app/",
          openingHours: "Mo-Sa 08:00-18:00",
          makesOffer: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lavagem Convencional" }, price: "70", priceCurrency: "BRL" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lavagem Detalhada" }, price: "130", priceCurrency: "BRL" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Higienização de Estofados" }, price: "300", priceCurrency: "BRL" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Scooter Elétrica" }, price: "40", priceCurrency: "BRL" },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Moto" }, price: "40", priceCurrency: "BRL" },
          ],
        }),
      },
    ],
  }),
});

type Service = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  icon: typeof Car;
  image: string;
  note?: boolean;
  priceHint?: string;
};

const FALLBACK_SERVICES: Service[] = [
  { id: "conv", name: "Lavagem Convencional",       price: "R$ 70",  priceValue: 70,  icon: Car,      image: svcCar },
  { id: "det",  name: "Lavagem Detalhada",          price: "R$ 130", priceValue: 130, icon: Sparkles, image: svcPolisher },
  { id: "est",  name: "Higienização de Estofados",  price: "R$ 300", priceHint: "A partir de", priceValue: 300, icon: Sofa, image: svcSofa, note: true },
  { id: "sco",  name: "Scooter Elétrica",           price: "R$ 40",  priceValue: 40,  icon: Bike,     image: svcScooter },
  { id: "moto", name: "Moto",                        price: "R$ 40",  priceValue: 40,  icon: Bike,     image: svcMoto },
];

const WEEKDAY_TIMES = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const SUNDAY_TIMES = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function Index() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [form, setForm] = useState({ nome: "", whats: "", modelo: "" });
  const [date, setDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [time, setTime] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [busyTimes, setBusyTimes] = useState<Set<string>>(new Set());
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    if (!videoEnded) return;
    const id = window.setInterval(() => {
      setPhotoIdx((i) => (i + 1) % HERO_PHOTOS.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [videoEnded]);

  const getBusyTimesFn = useServerFn(getBusyTimes);
  const createBookingFn = useServerFn(createBooking);
  const listServicesFn = useServerFn(listServicesPublic);
  const listClosedDaysFn = useServerFn(listClosedDaysPublic);

  useEffect(() => {
    listServicesFn()
      .then((res) => {
        const mapped: Service[] = (res.services ?? []).map((row: any) => {
          const vis = SERVICE_VISUALS[row.id] ?? DEFAULT_VISUAL;
          return {
            id: row.id,
            name: row.name,
            price: row.price,
            priceValue: Number(row.price_value),
            icon: vis.icon,
            image: vis.image,
            note: !!row.price_hint,
            priceHint: row.price_hint ?? undefined,
          };
        });
        if (mapped.length) setServices(mapped);
      })
      .catch((e) => console.error("listServices", e));
    listClosedDaysFn()
      .then((res) => setClosedDays(new Set((res.closedDays ?? []).map((r: any) => r.date))))
      .catch((e) => console.error("listClosedDays", e));
  }, [listServicesFn, listClosedDaysFn]);

  const service = services.find((s) => s.id === serviceId) ?? null;


  const currentStep = useMemo(() => {
    if (!form.nome || !form.whats || !form.modelo) return 1;
    if (!date) return 2;
    if (!time) return 3;
    return 3;
  }, [form, date, time]);

  const canConfirm = serviceId && form.nome && form.whats && form.modelo && date && time;

  const formatDateBR = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const formatDateISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Carrega horários ocupados sempre que a data muda
  useEffect(() => {
    if (!date) {
      setBusyTimes(new Set());
      return;
    }
    let cancelled = false;
    setLoadingBusy(true);
    getBusyTimesFn({ data: { date: formatDateISO(date) } })
      .then((res) => {
        if (cancelled) return;
        setBusyTimes(new Set(res.busy));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoadingBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, getBusyTimesFn]);

  const handleWhatsAppRedirect = async () => {
    if (submitting) return;
    if (!serviceId || !service) {
      toast.error("Selecione um serviço primeiro.");
      scrollToServices();
      return;
    }
    if (!form.nome || !form.whats || !form.modelo) {
      toast.error("Preencha nome, WhatsApp e modelo do veículo.");
      scrollToBooking();
      return;
    }
    if (!date) {
      toast.error("Escolha uma data.");
      scrollToBooking();
      return;
    }
    if (!time) {
      toast.error("Escolha um horário.");
      scrollToBooking();
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBookingFn({
        data: {
          clienteNome: form.nome,
          clienteWhats: form.whats,
          modelo: form.modelo,
          servicoId: service.id,
          servicoNome: service.name,
          servicoPreco: service.price,
          data: formatDateISO(date),
          horario: time,
        },
      });
      if (!res.ok) {
        if (res.conflict) {
          toast.error("Esse horário acabou de ser reservado. Escolha outro, por favor.");
          // Recarrega ocupados
          const refreshed = await getBusyTimesFn({ data: { date: formatDateISO(date) } });
          setBusyTimes(new Set(refreshed.busy));
          setTime(null);
        } else {
          toast.error(res.error ?? "Não foi possível confirmar o agendamento.");
        }
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha de conexão. Tente novamente.");
      return;
    } finally {
      setSubmitting(false);
    }

    const servicoNome = service.name;
    const servicoPreco = service.price;
    const clienteNome = form.nome;
    const modeloVeiculo = form.modelo;
    const dataAgendamento = formatDateBR(date);
    const horarioAgendamento = time ?? "";

    const mensagem = `Olá, Alex! Gostaria de confirmar meu agendamento no Lava-Car.\n\n*Resumo do agendamento:*\n\n*Nome:* ${clienteNome}\n*Serviço:* ${servicoNome}\n*Valor:* ${servicoPreco}\n*Veículo:* ${modeloVeiculo}\n*Data:* ${dataAgendamento}\n*Horário:* ${horarioAgendamento}\n\nAguardo a confirmação da vaga!`;

    const url = `https://wa.me/554192701937?text=${encodeURIComponent(mensagem)}`;
    // Use location.href to avoid popup blockers after await
    window.location.href = url;
  };

  // Dynamic calendar — Alex works Mon–Sat, closed on Sundays
  const daysInMonth = new Date(viewMonth.y, viewMonth.m + 1, 0).getDate();
  const firstWeekday = new Date(viewMonth.y, viewMonth.m, 1).getDay();
  const isCurrentMonth = viewMonth.y === now.getFullYear() && viewMonth.m === now.getMonth();
  const canGoPrev =
    viewMonth.y > now.getFullYear() ||
    (viewMonth.y === now.getFullYear() && viewMonth.m > now.getMonth());

  const selectedIsToday =
    !!date &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isPastTime = (t: string) => {
    if (!selectedIsToday) return false;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m <= nowMinutes;
  };

  const scrollToBooking = () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  const scrollToServices = () => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md overflow-x-hidden text-foreground">

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            id="hero-video"
            src={heroVideo}
            autoPlay
            muted={muted}
            playsInline
            preload="metadata"
            onEnded={() => setVideoEnded(true)}
            className={`h-full w-full object-cover transition-opacity duration-700 ${videoEnded ? "opacity-0" : "opacity-100"}`}
          />
          {/* Slideshow takes over after video ends */}
          {HERO_PHOTOS.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
              style={{ opacity: videoEnded && photoIdx === i ? 1 : 0 }}
            />
          ))}
          {/* very light overlay so the photo stays vibrant */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[oklch(0.1_0.03_255/0.25)]" />
          {/* subtle vignette behind text only */}
          <div className="absolute inset-x-0 top-1/4 h-1/2" style={{ background: "radial-gradient(ellipse at 50% 50%, oklch(0.06 0.03 255 / 0.45) 0%, transparent 70%)" }} />
        </div>

        {/* short fade into the page background — keeps the photo visible */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-10"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.97 0.02 240 / 0) 0%, oklch(0.97 0.02 240 / 0.35) 45%, oklch(0.97 0.02 240 / 0.85) 80%, oklch(0.97 0.02 240) 100%)",
          }}
        />



        <div className="relative z-20 px-6 pb-10 pt-8 text-center animate-fade-up">
          <div className="relative mx-auto h-48 w-48">
            {/* glow halo */}
            <span aria-hidden className="absolute -inset-2 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, oklch(0.08 0.03 255 / 0.85) 0%, oklch(0.08 0.03 255 / 0.6) 40%, transparent 72%)" }} />
            <span aria-hidden className="absolute inset-0 rounded-full blur-2xl animate-breathe"
              style={{ background: "radial-gradient(circle, oklch(0.68 0.19 45 / 0.55) 0%, oklch(0.55 0.18 255 / 0.35) 45%, transparent 70%)" }} />
            <img
              src={logo}
              alt="Alex Lava-Car Estética Automotiva"
              className="relative h-full w-full object-contain drop-shadow-[0_4px_18px_oklch(0_0_0/0.9)] drop-shadow-[0_8px_28px_oklch(0.68_0.19_45/0.5)]"
            />
          </div>
          <h1 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-white" style={{ textShadow: "0 2px 14px oklch(0 0 0 / 0.95), 0 1px 3px oklch(0 0 0 / 0.95)" }}>
            Agende sua lavagem em{" "}
            <span
              className="font-extrabold"
              style={{
                color: "oklch(0.82 0.18 60)",
                textShadow: "0 2px 10px oklch(0 0 0 / 0.9), 0 0 18px oklch(0.7 0.19 50 / 0.55)",
              }}
            >
              menos de 2 minutos
            </span>.
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/85" style={{ textShadow: "0 1px 8px oklch(0 0 0 / 0.85)" }}>
            Estética automotiva premium · atendimento exclusivo.
          </p>

          <button
            onClick={scrollToServices}
            className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/40 bg-chrome px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-slate-900 shadow-chrome transition-transform active:scale-95"
          >
            <Clock className="h-4 w-4" strokeWidth={2.5} />
            Agendar Horário
            <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-white/60 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-70" />
          </button>
        </div>
      </header>

      {/* SERVICES */}
      <section
        id="services"
        className="px-4 pt-4 pb-10 animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.018 75) 100%)",
        }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold uppercase leading-[1.05] tracking-tight" style={{ color: "oklch(0.25 0.04 60)" }}>
            Selecione
            <br />
            <span style={{ background: "var(--gradient-orange)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              seu serviço
            </span>
          </h2>
          <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent via-burnt to-transparent" />
        </div>

        {/* Horizontal scroll snap rail */}
        <div
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {services.map((s, idx) => {
            const active = serviceId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setTimeout(scrollToBooking, 250);
                }}
                style={{ animationDelay: `${idx * 80}ms`, minWidth: "160px", minHeight: "44px" }}
                className={`group relative flex w-[44vw] max-w-[180px] shrink-0 snap-start flex-col items-center overflow-hidden rounded-[22px] p-[1.5px] text-center transition-all duration-300 animate-fade-up ${
                  active ? "scale-[1.03]" : "hover:-translate-y-1"
                }`}
              >
                {/* soft frame */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-[22px] transition-opacity duration-300"
                  style={{
                    background: active
                      ? "linear-gradient(140deg, oklch(0.78 0.18 55), oklch(0.62 0.2 38) 50%, oklch(0.78 0.18 55))"
                      : "linear-gradient(140deg, oklch(0.9 0.03 70), oklch(0.82 0.05 65) 50%, oklch(0.9 0.03 70))",
                  }}
                />
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-2 rounded-[28px] blur-xl animate-breathe"
                    style={{ background: "radial-gradient(ellipse at center, oklch(0.7 0.19 50 / 0.35), transparent 70%)" }}
                  />
                )}

                {/* card body — light & airy */}
                <span className="relative z-10 flex w-full flex-col items-center rounded-[21px] px-3 pb-4 pt-3"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(0.995 0.003 75) 0%, oklch(0.97 0.012 75) 100%)",
                    boxShadow:
                      "inset 0 1px 0 oklch(1 0 0 / 0.9), 0 8px 22px -14px oklch(0.4 0.08 60 / 0.35)",
                  }}
                >
                  <span
                    className="mb-1 block min-h-[2.2rem] text-[12px] font-bold uppercase leading-tight tracking-wide"
                    style={{ color: active ? "oklch(0.45 0.18 45)" : "oklch(0.28 0.04 60)" }}
                  >
                    {s.name}
                  </span>

                  <span className="relative my-1 flex h-28 w-full items-center justify-center">
                    <span
                      aria-hidden
                      className="absolute inset-x-4 bottom-1 h-2 rounded-full blur-md"
                      style={{
                        background: active
                          ? "radial-gradient(ellipse, oklch(0.7 0.19 50 / 0.45), transparent 70%)"
                          : "radial-gradient(ellipse, oklch(0.3 0.04 60 / 0.25), transparent 70%)",
                      }}
                    />
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      width={200}
                      height={150}
                      className={`relative h-28 w-auto object-contain transition-transform duration-500 ${
                        active ? "scale-110" : "group-hover:scale-105"
                      }`}
                      style={{ filter: active ? "drop-shadow(0 6px 12px oklch(0.7 0.19 50 / 0.45))" : "drop-shadow(0 4px 8px oklch(0.3 0.04 60 / 0.25))" }}
                    />
                  </span>

                  {s.priceHint && (
                    <span className="mt-2 block text-[9px] font-medium uppercase tracking-[0.18em]" style={{ color: "oklch(0.5 0.04 60)" }}>
                      {s.priceHint}
                    </span>
                  )}
                  <span
                    className={`mt-1 block text-xl font-extrabold tracking-tight ${s.priceHint ? "" : "mt-3"}`}
                    style={{
                      background: "var(--gradient-orange)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      textShadow: active ? "0 0 18px oklch(0.7 0.19 50 / 0.35)" : undefined,
                    }}
                  >
                    {s.price}
                  </span>
                </span>

                {active && (
                  <span className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-burnt shadow-orange ring-2 ring-white">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                  </span>
                )}

                <span className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[22px]">
                  <span className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
                </span>
              </button>
            );
          })}
        </div>

        {/* scroll hint */}
        <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          ← deslize para ver mais →
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-sm italic" style={{ color: "oklch(0.4 0.04 60)" }}>
          *O valor final depende do nível de sujidade e será avaliado presencialmente.
        </p>
      </section>

      {/* BOOKING PANEL */}
      <section
        id="booking"
        className="animate-fade-up"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.94 0.018 75) 0%, oklch(0.96 0.014 75) 100%)",
        }}
      >
        <div className="mx-2 sm:mx-3 overflow-hidden rounded-[28px] border border-[oklch(0.78_0.05_70/0.35)] bg-white p-4 sm:p-5 shadow-[0_20px_50px_-20px_oklch(0.4_0.08_60/0.3)] relative">
          {/* brushed chrome top edge */}
          <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.18_245)] to-transparent" />
          <span aria-hidden className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.18_245/0.4)] to-transparent" />

          {/* STEPPER */}
          <div className="mb-6 flex items-center justify-center">
            {[
              { n: 1, label: "Dados" },
              { n: 2, label: "Data" },
              { n: 3, label: "Horário" },
            ].map(({ n, label }, i) => {
              const done = currentStep > n;
              const active = currentStep === n;
              return (
                <div key={n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                        done || active ? "text-slate-900" : "text-muted-foreground"
                      }`}
                      style={{
                        background: done || active
                          ? "var(--gradient-orange)"
                          : "oklch(0.92 0.03 245)",
                        boxShadow: done || active
                          ? "0 4px 12px -4px oklch(0.68 0.19 45 / 0.6)"
                          : "inset 0 0 0 1px oklch(0.55 0.12 245 / 0.3)",
                      }}
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${active || done ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`mx-2 mb-5 h-px w-6 sm:mx-3 sm:w-10 ${currentStep > n ? "bg-burnt" : "bg-[oklch(0.55_0.12_245/0.2)]"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* FORM */}
          <div className="space-y-3">
            <Field icon={User}     label="Nome"            value={form.nome}   onChange={(v) => setForm({ ...form, nome: v })}   placeholder="Como podemos te chamar" />
            <Field icon={Phone}    label="WhatsApp"        value={form.whats}  onChange={(v) => setForm({ ...form, whats: v })}  placeholder="(00) 00000-0000" inputMode="tel" />
            <Field icon={CarFront} label="Modelo do veículo" value={form.modelo} onChange={(v) => setForm({ ...form, modelo: v })} placeholder="Ex: Civic prata" />

            <p className="flex items-start gap-2 pt-1 text-[11px] leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-burnt" />
              Usamos seus dados <span className="text-slate-900 font-medium">só para confirmar o agendamento no WhatsApp</span>. Sem cadastro, sem spam.
            </p>
          </div>

          {/* CALENDAR */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <CalIcon className="h-3.5 w-3.5 text-burnt" /> Escolha a data
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() => {
                    const m = viewMonth.m - 1;
                    setViewMonth(m < 0 ? { y: viewMonth.y - 1, m: 11 } : { y: viewMonth.y, m });
                  }}
                  className="rounded-full p-1 text-burnt ring-1 ring-burnt/30 transition hover:bg-[oklch(0.55_0.12_245/0.08)] disabled:opacity-30"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <p className="min-w-[110px] text-center text-sm font-bold text-burnt">
                  {MONTHS_PT[viewMonth.m]} {viewMonth.y}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const m = viewMonth.m + 1;
                    setViewMonth(m > 11 ? { y: viewMonth.y + 1, m: 0 } : { y: viewMonth.y, m });
                  }}
                  className="rounded-full p-1 text-burnt ring-1 ring-burnt/30 transition hover:bg-[oklch(0.55_0.12_245/0.08)]"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[oklch(0.55_0.12_245/0.2)] bg-[oklch(0.98_0.01_240)] p-2 sm:p-3"
              style={{ boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.6), 0 8px 20px -10px oklch(0.4 0.1 250 / 0.25)" }}>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const cell = new Date(viewMonth.y, viewMonth.m, day);
                  const isPast = cell < todayStart;
                  const isToday = cell.getTime() === todayStart.getTime();
                  const cellIso = formatDateISO(cell);
                  const isClosed = closedDays.has(cellIso);
                  const isUn = isPast || isClosed;
                  const isSel =
                    !!date &&
                    date.getFullYear() === cell.getFullYear() &&
                    date.getMonth() === cell.getMonth() &&
                    date.getDate() === day;
                  return (
                    <button
                      key={day}
                      disabled={isUn}
                      onClick={() => { setDate(cell); setTime(null); }}
                      title={isClosed ? "Estabelecimento fechado" : undefined}
                      className={`relative aspect-square rounded-full text-[13px] font-semibold transition-all ${
                        isSel
                          ? "text-slate-900 animate-breathe"
                          : isUn
                            ? `cursor-not-allowed ${isClosed ? "text-red-400 line-through" : "text-slate-300"}`
                            : isToday
                              ? "text-slate-900 ring-2 ring-burnt hover:bg-[oklch(0.55_0.12_245/0.08)]"
                              : "text-slate-700 ring-1 ring-burnt/40 hover:bg-[oklch(0.55_0.12_245/0.08)] hover:ring-burnt"
                      }`}
                      style={isSel ? { background: "var(--gradient-orange)" } : undefined}
                    >

                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TIME GRID */}
          <div className="mt-6">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              <Clock className="h-3.5 w-3.5 text-burnt" /> Horários disponíveis
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(date && date.getDay() === 0 ? SUNDAY_TIMES : WEEKDAY_TIMES).map((t) => {
                 const busy = busyTimes.has(t) || isPastTime(t) || !date || loadingBusy;
                const sel = time === t;
                return (
                  <button
                    key={t}
                    disabled={busy}
                    onClick={() => setTime(t)}
                    className={`relative rounded-xl py-2.5 text-xs font-bold transition-all ${
                      sel
                        ? "text-slate-900 animate-breathe"
                        : busy
                          ? "cursor-not-allowed text-slate-400 line-through decoration-slate-400"
                          : "text-slate-800 hover:-translate-y-0.5"
                    }`}
                    style={{
                      background: sel
                        ? "var(--gradient-orange)"
                        : "linear-gradient(160deg, oklch(0.98 0.01 240), oklch(0.93 0.03 240))",
                      boxShadow: sel
                        ? "0 8px 18px -8px oklch(0.68 0.19 45 / 0.6)"
                        : "inset 0 1px 0 oklch(1 0 0 / 0.8), inset 0 0 0 1px oklch(0.55 0.12 245 / 0.25)",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONFIRMATION */}
      <section
        className="animate-fade-up px-3 pt-5 pb-8"
        style={{
          background: "oklch(0.96 0.014 75)",
        }}
      >
        <div className="relative rounded-[24px] p-[2px]" style={{ background: "linear-gradient(140deg, oklch(0.78 0.18 50), oklch(0.5 0.18 35), oklch(0.78 0.18 50))" }}>
          <div className="rounded-[22px] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Resumo de confirmação</p>

            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-slate-900">
                {service ? service.name : "Selecione um serviço"}
              </span>
              <span className="text-2xl font-extrabold tracking-tight" style={{ background: "var(--gradient-orange)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {service ? service.price : "R$ —"}
              </span>
            </div>

            {(date || time) && (
              <p className="mt-1 text-xs text-slate-500">
                {date ? formatDateBR(date) : "—"} {time ? `· ${time}` : ""}
              </p>
            )}
            {!service && (
              <p className="mt-1 text-xs text-slate-500">A partir de R$ 70</p>
            )}

            <button
              onClick={handleWhatsAppRedirect}
              disabled={submitting}
              className="group relative mt-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(180deg, oklch(0.78 0.18 145), oklch(0.62 0.18 145))",
                boxShadow: "0 12px 30px -10px oklch(0.7 0.18 145 / 0.7), inset 0 1px 0 oklch(1 0 0 / 0.3)",
              }}
            >
              <MessageCircle className="h-5 w-5 fill-white" strokeWidth={0} />
              Confirmar via WhatsApp
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-12 bg-white/40 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </section>

      {/* INSTAGRAM + LOCATION */}
      <section className="px-4 pt-6 pb-8 space-y-5" style={{ background: "oklch(0.96 0.014 75)" }}>
        {/* Instagram card */}
        <a
          href="https://www.instagram.com/alexlavacar17?igsh=MWliODEzMjZ4cDh5bw=="
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Siga @alexlavacar17 no Instagram"
          className="group block overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-15px_oklch(0.3_0.04_60/0.35)] ring-1 ring-[oklch(0.78_0.05_70/0.3)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <img src={instagramCard} alt="Siga @alexlavacar17 no Instagram" className="w-full" loading="lazy" />
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[oklch(0.55_0.22_15)] via-[oklch(0.62_0.22_330)] to-[oklch(0.6_0.2_50)] py-3 text-sm font-bold text-white">
            <Instagram className="h-4 w-4" />
            Siga @alexlavacar17
          </div>
        </a>

        {/* Location card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-15px_oklch(0.3_0.04_60/0.35)] ring-1 ring-[oklch(0.78_0.05_70/0.3)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[oklch(0.85_0.02_70)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--gradient-orange)" }}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-900" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">Onde estamos</p>
          </div>
          <iframe
            title="Localização Alex Lava-Car"
            src="https://www.google.com/maps?q=-20.8038883,-48.8034019&z=17&output=embed"
            width="100%"
            height={300}
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-0 flex flex-col items-center gap-3 px-5 pt-6 pb-8 bg-white">

        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Alex Lava-Car · Estética Automotiva
        </p>
        <p className="text-center text-[10px] tracking-wider text-slate-500">
          feito por{" "}
          <a
            href="https://wa.me/5517991279772"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-burnt transition-colors hover:opacity-80"
          >
            Franco
          </a>
        </p>
      </footer>
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, inputMode, icon: Icon,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "text" | "tel" | "email"; icon: typeof User;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <div className="relative rounded-xl p-[1px]"
        style={{ background: "linear-gradient(135deg, oklch(0.75 0.12 245), oklch(0.55 0.18 245) 50%, oklch(0.7 0.14 245))" }}>
        <div className="relative flex items-center rounded-[11px] bg-[oklch(0.98_0.01_240)]">
          <Icon className="ml-3 h-4 w-4 text-burnt" strokeWidth={2.2} />
          <input
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>
    </label>
  );
}

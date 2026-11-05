import {
  CalendarDays,
  Home,
  MessageCircle,
  Search,
  Settings,
} from "lucide-react";

import { MetricCard } from "components/common/metric-card";
import { NEUTRAL_VARS } from "components/public/public-shell";
import { Badge } from "components/ui/badge";
import { Card } from "components/ui/card";
import { Progress } from "components/ui/progress";
import { cn } from "lib/utils";

// Telas estáticas (não interativas) que reproduzem o app real com dados de
// exemplo. Servem como "screenshot" vivo dentro do PhoneFrame da landing.

function StaticNav({ active }) {
  const items = [
    { key: "inicio", label: "Início", icon: Home },
    { key: "eventos", label: "Eventos", icon: CalendarDays },
    { key: "config", label: "Configurações", icon: Settings },
  ];
  return (
    <div className="mt-auto grid shrink-0 grid-cols-3 border-t border-border bg-surface-alt px-3 pt-2.5 pb-5">
      {items.map(({ key, label, icon: Icon }) => (
        <span
          key={key}
          className={cn(
            "flex flex-col items-center gap-1 text-[11px] font-medium",
            key === active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-[17px]" />
          {label}
        </span>
      ))}
    </div>
  );
}

// Painel do dono — visão de um evento com ocupação.
export function OwnerEventScreen() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <div className="px-5 pt-3 text-center">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          Evento
        </p>
        <h3 className="mt-3 font-display text-[26px] leading-tight font-bold tracking-[-0.03em] text-foreground">
          Jantar de Sexta
        </h3>
        <div className="mt-1 flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground">
          <span>13/11</span>
          <Badge variant="success">ativa</Badge>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard value={18} label="reservas totais" />
          <MetricCard value={64} label="pessoas" />
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Mesas ocupadas</span>
            <span className="font-display text-foreground">18/22</span>
          </div>
          <Progress value={82} className="mt-2" />
        </Card>
        <Card className="p-4">
          <p className="text-[13px] text-muted-foreground">Horários</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["19:00", "20:30", "22:00"].map((t) => (
              <span
                key={t}
                className="rounded-md bg-accent-soft px-3 py-1 font-display text-[13px] font-medium text-primary"
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
        <div className="flex h-[46px] items-center justify-center rounded-lg bg-primary text-[13px] font-bold tracking-[0.06em] text-primary-foreground uppercase">
          Copiar link
        </div>
      </div>
      <StaticNav active="eventos" />
    </div>
  );
}

const SAMPLE_RESERVATIONS = [
  { name: "Marina Alves", people: 4, time: "20:30", table: "Mesa 7" },
  { name: "Rafael Costa", people: 2, time: "19:00", table: "Mesa 2" },
  { name: "Júlia Martins", people: 6, time: "20:30", table: "Varanda 1" },
  { name: "Pedro Henrique", people: 3, time: "22:00", table: "Mesa 5" },
  { name: "Camila Rocha", people: 2, time: "19:00", table: "Mesa 1" },
];

// Painel do dono — lista de reservas com o primeiro cartão aberto.
export function OwnerReservationsScreen() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden" aria-hidden="true">
      <div className="px-5 pt-3">
        <span className="text-[12px] font-semibold text-muted-foreground">
          Próximos 30 dias
        </span>
        <h3 className="mt-3 font-display text-[30px] leading-none font-bold tracking-[-0.03em] text-ink">
          18 reservas
        </h3>
      </div>
      <div className="flex flex-col gap-3 px-5 pt-4">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-[13px] text-muted-foreground">
          <Search className="size-4" /> Buscar por nome, mesa ou telefone
        </div>
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          Reservas recentes
        </p>
        {SAMPLE_RESERVATIONS.map((r, i) => (
          <Card
            key={r.name}
            className={cn("p-3", i === 0 && "border-primary/30")}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate font-display text-[15px] font-bold text-foreground">
                {r.name}
              </span>
              <Badge variant="secondary">{r.people} pessoas</Badge>
            </div>
            <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
              13/11 | {r.time}
            </p>
            {i === 0 ? (
              <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5 text-[12px]">
                <span className="flex flex-col">
                  <span className="text-muted-foreground">mesa:</span>
                  <span className="text-foreground italic">{r.table}</span>
                </span>
                <span className="inline-flex size-[34px] items-center justify-center rounded-lg bg-success text-success-foreground">
                  <MessageCircle className="size-4" />
                </span>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaticField({ label, value, display }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-extrabold text-foreground">
        {label}
      </span>
      <span
        className={cn(
          "flex h-9 items-center rounded-lg border border-input bg-card px-3 text-[13px] text-foreground",
          display && "font-display",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// Página pública do convidado (cores neutras, como no app real).
export function GuestFormScreen() {
  return (
    <div
      className="flex flex-1 flex-col px-6"
      style={NEUTRAL_VARS}
      aria-hidden="true"
    >
      <div className="pt-6 pb-2 text-center">
        <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
          Faça sua reserva
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Jantar de Sexta · 13/11
        </p>
      </div>
      <div className="flex flex-col gap-3.5 pt-4">
        <StaticField label="Nome" value="Marina Alves" />
        <StaticField label="Celular" value="(51) 98765-4321" />
        <StaticField label="Número de pessoas" value="4" display />
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-extrabold text-foreground">
            Horário
          </span>
          <div className="flex gap-2">
            {["19:00", "20:30", "22:00"].map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-md border px-3.5 py-1.5 font-display text-[13px] font-medium",
                  t === "20:30"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2 flex h-[48px] items-center justify-center rounded-lg bg-primary text-[14px] font-bold tracking-[0.02em] text-primary-foreground uppercase">
          Enviar
        </div>
      </div>
    </div>
  );
}

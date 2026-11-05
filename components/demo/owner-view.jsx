import { useMemo, useState } from "react";
import {
  CalendarDays,
  Home,
  LayoutGrid,
  Link2,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";

import { MetricCard } from "components/common/metric-card";
import { Badge } from "components/ui/badge";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Progress } from "components/ui/progress";
import { Switch } from "components/ui/switch";
import { DEMO_RESTAURANT, occupancy } from "lib/demo";
import { formatDayMonth, formatTime, weekdayLabel } from "lib/format";
import { normalizePhone } from "lib/whatsapp";
import { cn } from "lib/utils";

const TABS = [
  { key: "inicio", label: "Reservas", icon: Home },
  { key: "evento", label: "Evento", icon: CalendarDays },
  { key: "mesas", label: "Mesas", icon: LayoutGrid },
];

function Eyebrow({ children }) {
  return (
    <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function ReservationItem({ reservation, event, open, highlighted, onToggle }) {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "cursor-pointer p-3 transition-colors outline-none focus-visible:border-ring",
        open && "border-primary/30",
        highlighted && "border-success/50 ring-3 ring-success-tint",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-display text-[15px] font-bold text-foreground">
            {reservation.guest_name}
          </span>
          {highlighted ? (
            <Badge variant="success" className="shrink-0">
              nova
            </Badge>
          ) : null}
        </span>
        <Badge variant="secondary" className="shrink-0">
          {reservation.party_size}{" "}
          {reservation.party_size === 1 ? "pessoa" : "pessoas"}
        </Badge>
      </div>
      <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">
        {formatDayMonth(event.event_date)} |{" "}
        {formatTime(reservation.reservation_time)}
      </p>
      {open ? (
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border pt-2.5 text-[12px]">
          <div className="flex gap-6">
            <span className="flex flex-col">
              <span className="text-muted-foreground">mesa:</span>
              <span className="text-foreground italic">
                {reservation.table_name}
              </span>
            </span>
            <span className="flex flex-col">
              <span className="text-muted-foreground">código:</span>
              <span className="font-display text-foreground">
                {reservation.public_token}
              </span>
            </span>
          </div>
          <span
            title="No app real, abre a conversa com o cliente no WhatsApp"
            className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground"
          >
            <MessageCircle className="size-4" />
          </span>
        </div>
      ) : null}
    </Card>
  );
}

function ReservationsTab({ state, highlightId }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(undefined);

  const sorted = useMemo(
    () => [...state.reservations].sort((a, b) => b.created_at - a.created_at),
    [state.reservations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    const digits = normalizePhone(query);
    return sorted.filter(
      (r) =>
        r.guest_name.toLowerCase().includes(q) ||
        r.table_name.toLowerCase().includes(q) ||
        (digits && normalizePhone(r.guest_phone).includes(digits)),
    );
  }, [sorted, query]);

  const effectiveOpen = openId === undefined ? sorted[0]?.id : openId;

  return (
    <>
      <div className="px-5 pt-2">
        <p className="text-[12px] font-semibold text-muted-foreground">
          {DEMO_RESTAURANT}
        </p>
        <h3 className="mt-2 font-display text-[30px] leading-none font-bold tracking-[-0.03em] text-ink">
          {state.reservations.length}{" "}
          {state.reservations.length === 1 ? "reserva" : "reservas"}
        </h3>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pt-4 pb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, mesa ou telefone"
            className="pl-9 text-[13px]"
            aria-label="Buscar reservas"
          />
        </div>
        <Eyebrow>Reservas recentes</Eyebrow>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            Nenhuma reserva encontrada.
          </p>
        ) : (
          filtered.map((r) => (
            <ReservationItem
              key={r.id}
              reservation={r}
              event={state.event}
              open={effectiveOpen === r.id}
              highlighted={highlightId === r.id}
              onToggle={() => setOpenId(effectiveOpen === r.id ? null : r.id)}
            />
          ))
        )}
      </div>
    </>
  );
}

function EventTab({ state, onOpenGuestLink }) {
  const oc = occupancy(state);
  const { event } = state;
  return (
    <div className="flex flex-1 flex-col px-5 pt-2 pb-5">
      <div className="text-center">
        <h3 className="font-display text-[26px] leading-tight font-bold tracking-[-0.03em] text-foreground">
          {event.name}
        </h3>
        <div className="mt-1 flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground">
          <span>
            {weekdayLabel(event.event_date)}, {formatDayMonth(event.event_date)}
          </span>
          <Badge variant="success">ativa</Badge>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricCard value={oc.reservations} label="reservas totais" />
        <MetricCard value={oc.people} label="pessoas" />
      </div>
      <Card className="mt-3 p-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Mesas ocupadas</span>
          <span className="font-display text-foreground">
            {oc.reservations}/{oc.totalTables}
          </span>
        </div>
        <Progress value={oc.percent} className="mt-2" />
      </Card>
      <Card className="mt-3 p-4">
        <p className="text-[13px] text-muted-foreground">Horários</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {event.event_times.map((t) => (
            <span
              key={t}
              className="rounded-md bg-accent-soft px-3 py-1 font-display text-[13px] font-medium text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      </Card>
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onOpenGuestLink}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-bold tracking-[0.06em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          <Link2 className="size-4" /> Abrir link do cliente
        </button>
      </div>
    </div>
  );
}

function TablesTab({ state, highlightTableId, onToggleTable }) {
  const byTable = useMemo(
    () => new Map(state.reservations.map((r) => [r.table_id, r])),
    [state.reservations],
  );
  const oc = occupancy(state);

  return (
    <div className="px-5 pt-2 pb-5">
      <Eyebrow>Salão · {state.event.name}</Eyebrow>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="font-display text-[26px] leading-none font-bold tracking-[-0.03em] text-ink">
          {oc.totalTables - oc.reservations} livres
        </h3>
        <span className="font-display text-[13px] text-muted-foreground">
          {oc.reservations}/{oc.totalTables} ocupadas
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {state.tables.map((t) => {
          const r = byTable.get(t.id);
          const isNew = highlightTableId === t.id;
          return (
            <Card
              key={t.id}
              className={cn(
                "p-3.5 transition-all",
                r && "border-success/25 bg-success-tint",
                !r && !t.active && "border-dashed bg-surface-alt",
                isNew && "border-success ring-3 ring-success/25",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h4
                  className={cn(
                    "min-w-0 truncate font-display text-base font-bold",
                    t.active || r ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t.name}
                </h4>
                <span className="flex shrink-0 items-center gap-1 font-display text-[13px] text-muted-foreground">
                  <Users className="size-3.5" />
                  {t.min_capacity}–{t.max_capacity}
                </span>
              </div>
              {r ? (
                <p className="mt-1.5 truncate text-[12px] font-semibold text-success">
                  {r.guest_name.split(" ")[0]} · {r.party_size}p ·{" "}
                  {formatTime(r.reservation_time)}
                </p>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {t.active ? "livre" : "desativada"}
                  </span>
                  <Switch
                    className="h-6 w-10 [&>span]:size-[18px] [&>span]:data-[state=checked]:translate-x-[18px]"
                    checked={t.active}
                    onCheckedChange={() => onToggleTable(t.id)}
                    aria-label={`${t.active ? "Desativar" : "Ativar"} ${t.name}`}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        Desative uma mesa livre para tirá-la da reserva online.
      </p>
    </div>
  );
}

export function OwnerView({
  state,
  tab,
  onTabChange,
  highlightId,
  highlightTableId,
  onOpenGuestLink,
  onToggleTable,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "inicio" ? (
          <ReservationsTab state={state} highlightId={highlightId} />
        ) : tab === "evento" ? (
          <EventTab state={state} onOpenGuestLink={onOpenGuestLink} />
        ) : (
          <TablesTab
            state={state}
            highlightTableId={highlightTableId}
            onToggleTable={onToggleTable}
          />
        )}
      </div>
      <nav className="grid shrink-0 grid-cols-3 border-t border-border bg-surface-alt px-3 pt-2.5 pb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            aria-current={tab === key ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 text-[11px] font-medium transition-colors",
              tab === key ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-[17px]" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

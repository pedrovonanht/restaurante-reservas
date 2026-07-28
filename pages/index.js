import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { TenantSwitcher } from "components/layout/tenant-switcher";
import { ReservationsDateFilter } from "components/reservations/date-filter";
import { ReservationCard } from "components/reservations/reservation-card";
import {
  CardListSkeleton,
  EmptyState,
  ErrorState,
} from "components/common/state-views";
import { Input } from "components/ui/input";
import { useQuery } from "hooks/use-query";
import { useTenant } from "context/tenant-context";
import { reservations as reservationsApi } from "lib/api";
import { resolveDateFilter, todayISO } from "lib/format";

export default function HomePage() {
  const { tenant } = useTenant();

  const [filterMode, setFilterMode] = useState("next30");
  const [customDate, setCustomDate] = useState(todayISO());
  const { from, to, label } = useMemo(
    () => resolveDateFilter(filterMode, customDate),
    [filterMode, customDate],
  );

  const { data, loading, error, refetch } = useQuery(
    () => reservationsApi.listOwner(tenant, { from, to }),
    [tenant, from, to],
    { enabled: !!tenant },
  );

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(undefined);

  const list = useMemo(() => data || [], [data]);

  const sorted = useMemo(
    () =>
      [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [list],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((r) => r.guest_name?.toLowerCase().includes(q));
  }, [sorted, query]);

  // Primeiro card aberto por padrão (um aberto por vez). `undefined` = usar o primeiro.
  const effectiveOpenId =
    openId === undefined ? (sorted[0]?.id ?? null) : openId;

  const toggle = (id) =>
    setOpenId((cur) => {
      const eff = cur === undefined ? (sorted[0]?.id ?? null) : cur;
      return eff === id ? null : id;
    });

  return (
    <AppShell>
      <header className="bg-background px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <ReservationsDateFilter
            mode={filterMode}
            label={label}
            customDate={customDate}
            onSelectPreset={setFilterMode}
            onSelectCustom={(date) => {
              setCustomDate(date);
              setFilterMode("custom");
            }}
          />
          <TenantSwitcher />
        </div>
        <h1 className="mt-4 font-display text-[34px] leading-none font-bold tracking-[-0.03em] text-ink">
          {loading ? "—" : list.length}{" "}
          <span className="text-foreground">
            {list.length === 1 ? "reserva" : "reservas"}
          </span>
        </h1>
      </header>

      <section className="flex flex-col gap-4 px-5 py-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome"
            className="pl-9"
            aria-label="Buscar reservas por nome"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            Reservas recentes
          </p>

          {loading ? (
            <CardListSkeleton count={4} />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                query ? "Nenhuma reserva encontrada" : "Nenhuma reserva ainda"
              }
              description={
                query
                  ? "Tente buscar por outro nome."
                  : "As reservas desse período aparecerão aqui."
              }
            />
          ) : (
            filtered.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                open={effectiveOpenId === reservation.id}
                onToggle={() => toggle(reservation.id)}
              />
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}

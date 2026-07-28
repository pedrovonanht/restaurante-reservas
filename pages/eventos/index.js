import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { TenantSwitcher } from "components/layout/tenant-switcher";
import { Avatar } from "components/layout/avatar";
import { EventCard } from "components/events/event-card";
import {
  CardListSkeleton,
  EmptyState,
  ErrorState,
} from "components/common/state-views";
import { Button } from "components/ui/button";
import { useQuery } from "hooks/use-query";
import { useTenant } from "context/tenant-context";
import { useAuth } from "context/auth-context";
import { events as eventsApi, tables as tablesApi } from "lib/api";
import { monthKey, monthLabel } from "lib/format";

export default function EventosPage() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(
    () => eventsApi.list(tenant),
    [tenant],
    { enabled: !!tenant },
  );
  const {
    data: tablesData,
    loading: tablesLoading,
    error: tablesError,
  } = useQuery(() => tablesApi.list(tenant), [tenant], { enabled: !!tenant });
  const tables = tablesData || [];

  const groups = useMemo(() => {
    const events = data || [];
    const map = new Map();
    for (const ev of events) {
      const key = monthKey(ev.event_date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return [...map.entries()]
      .map(([key, items]) => ({
        key,
        label: monthLabel(items[0].event_date),
        items: [...items].sort((a, b) =>
          a.event_date.localeCompare(b.event_date),
        ),
      }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [data]);

  return (
    <AppShell>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-5 py-3">
        <TenantSwitcher />
        <Avatar name={user?.username} />
      </header>

      <section className="flex flex-col gap-4 px-5 py-4">
        {!tablesLoading && !tablesError && tables.length === 0 ? (
          <div className="rounded-lg border border-primary/30 bg-accent-soft px-3 py-2.5 text-[13px] text-foreground">
            Para começar a receber reservas,{" "}
            <Link
              href="/mesas/novo"
              className="font-semibold text-primary underline underline-offset-2"
            >
              crie uma mesa
            </Link>
            .
          </div>
        ) : null}

        {loading ? (
          <CardListSkeleton count={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : groups.length === 0 ? (
          <EmptyState
            title="Nenhum evento ainda"
            description="Crie seu primeiro evento para começar a receber reservas."
            action={
              <Button asChild className="mt-1 h-11 hover:bg-primary/90">
                <Link href="/eventos/novo">Criar evento</Link>
              </Button>
            }
          />
        ) : (
          groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2.5">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                {group.label}
              </p>
              {group.items.map((ev) => (
                <EventCard key={ev.id} event={ev} href={`/eventos/${ev.id}`} />
              ))}
            </div>
          ))
        )}

        <div className="mt-2 flex flex-col items-center gap-3">
          <Button
            asChild
            className="h-12 w-full rounded-lg text-[15px] font-bold hover:bg-primary/90"
          >
            <Link href="/eventos/novo">
              <Plus className="size-4" /> Novo evento
            </Link>
          </Button>
          <Link
            href="/eventos/predefinicoes/nova"
            className="text-[13px] font-medium text-primary"
          >
            Criar predefinição de evento
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

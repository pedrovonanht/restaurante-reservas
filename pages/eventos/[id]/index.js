import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader2, Pencil } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { MetricCard } from "components/common/metric-card";
import { ErrorState } from "components/common/state-views";
import { Card } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Progress } from "components/ui/progress";
import { Button } from "components/ui/button";
import { useQuery } from "hooks/use-query";
import { useTenant } from "context/tenant-context";
import { events as eventsApi } from "lib/api";
import { formatDayMonth, formatTime, tableOccupancyPercent } from "lib/format";
import { cn } from "lib/utils";

export default function EventoDetalhePage() {
  const router = useRouter();
  const { id } = router.query;
  const { tenant } = useTenant();

  const ready = !!tenant && !!id;
  const { data, loading, error, refetch } = useQuery(
    () => eventsApi.get(tenant, id),
    [tenant, id],
    { enabled: ready },
  );

  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/${tenant}/reservas/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard indisponível — mantém o feedback visual mesmo assim */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const oc = data?.ocupation || {
    reservations: 0,
    total_capacity: 0,
    people: 0,
    empty_tables: 0,
  };
  const pct = tableOccupancyPercent(oc);
  const totalTables = oc.reservations + oc.empty_tables;

  return (
    <AppShell>
      <BackHeader
        title="Evento"
        right={
          id ? (
            <Link
              href={`/eventos/${id}/editar`}
              aria-label="Editar evento"
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Pencil className="size-[18px]" />
            </Link>
          ) : undefined
        }
      />

      <section className="flex flex-1 flex-col px-5 py-5">
        {!ready || loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : (
          <>
            <div className="text-center">
              <h1 className="font-display text-[30px] leading-tight font-bold tracking-[-0.03em] text-foreground">
                {data.name}
              </h1>
              <div className="mt-1.5 flex items-center justify-center gap-2 text-[14px] font-medium text-muted-foreground">
                <span>{formatDayMonth(data.event_date)}</span>
                <Badge variant={data.active ? "success" : "warning"}>
                  {data.active ? "ativa" : "encerrada"}
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetricCard value={oc.reservations} label="reservas totais" />
              <MetricCard value={oc.people} label="pessoas" />
            </div>

            <Card className="mt-3 p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Mesas ocupadas</span>
                <span className="font-display text-foreground">
                  {oc.reservations}/{totalTables}
                </span>
              </div>
              <Progress value={pct} className="mt-2" />
            </Card>

            {data.event_times?.length > 0 ? (
              <Card className="mt-3 p-4">
                <p className="text-[13px] text-muted-foreground">Horários</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.event_times.map((time) => (
                    <span
                      key={time}
                      className="rounded-md bg-accent-soft px-3 py-1 font-display text-[13px] font-medium text-primary"
                    >
                      {formatTime(time)}
                    </span>
                  ))}
                </div>
              </Card>
            ) : null}

            <Button
              onClick={copyLink}
              className={cn(
                "mt-auto h-[52px] w-full rounded-lg text-[14px] font-bold tracking-[0.06em] uppercase",
                copied
                  ? "bg-success-tint text-success hover:bg-success-tint"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {copied ? "Link copiado" : "Copiar link"}
            </Button>
          </>
        )}
      </section>
    </AppShell>
  );
}

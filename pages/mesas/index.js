import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { TableCard } from "components/tables/table-card";
import {
  CardListSkeleton,
  EmptyState,
  ErrorState,
} from "components/common/state-views";
import { Button } from "components/ui/button";
import { useQuery } from "hooks/use-query";
import { useTenant } from "context/tenant-context";
import { tables as tablesApi } from "lib/api";

export default function MesasPage() {
  const { tenant } = useTenant();
  const { data, loading, error, refetch } = useQuery(
    () => tablesApi.list(tenant),
    [tenant],
    { enabled: !!tenant },
  );

  const tables = data || [];
  const capacityTotals = useMemo(
    () =>
      (data || []).reduce(
        (acc, t) => ({
          min: acc.min + t.min_capacity,
          max: acc.max + t.max_capacity,
        }),
        { min: 0, max: 0 },
      ),
    [data],
  );

  return (
    <AppShell>
      <BackHeader title="Mesas" fallbackHref="/configuracoes" />

      <section className="flex flex-col gap-4 px-5 py-4">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
            Minhas mesas
          </h1>
          {tables.length > 0 ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              Total de vagas: {capacityTotals.min}–{capacityTotals.max} pessoas
            </p>
          ) : null}
        </div>

        {loading ? (
          <CardListSkeleton count={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : tables.length === 0 ? (
          <EmptyState
            title="Nenhuma mesa ainda"
            description="Crie sua primeira mesa para começar a controlar a ocupação."
            action={
              <Button asChild className="mt-1 h-11 hover:bg-primary/90">
                <Link href="/mesas/novo">Criar mesa</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                href={`/mesas/${table.id}/editar`}
              />
            ))}
          </div>
        )}

        <Button
          asChild
          className="mt-2 h-12 w-full rounded-lg text-[15px] font-bold hover:bg-primary/90"
        >
          <Link href="/mesas/novo">
            <Plus className="size-4" /> Nova mesa
          </Link>
        </Button>
      </section>
    </AppShell>
  );
}

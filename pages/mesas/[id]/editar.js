import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { ErrorState } from "components/common/state-views";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "components/ui/alert-dialog";
import { useQuery } from "hooks/use-query";
import { useMutation } from "hooks/use-mutation";
import { useTenant } from "context/tenant-context";
import { tables as tablesApi, reservations as reservationsApi } from "lib/api";
import { validateTable, hasErrors } from "lib/validate";
import { todayISO } from "lib/format";

function oneYearFromToday() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditarMesaPage() {
  const router = useRouter();
  const { id } = router.query;
  const { tenant } = useTenant();

  const ready = !!tenant && !!id;
  const {
    data: tablesData,
    loading,
    error: loadError,
    refetch,
  } = useQuery(() => tablesApi.list(tenant), [tenant], { enabled: ready });

  const table = (tablesData || []).find((t) => t.id === id);

  const { data: reservationsData } = useQuery(
    () =>
      reservationsApi.listOwner(tenant, {
        from: todayISO(),
        to: oneYearFromToday(),
      }),
    [tenant],
    { enabled: ready },
  );

  const scheduledCount = useMemo(() => {
    if (!table || !reservationsData) return 0;
    return reservationsData.filter((r) => r.table_name === table.name).length;
  }, [reservationsData, table]);

  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (table && !form) {
      // Hidratação única do formulário a partir da mesa encontrada na lista.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: table.name,
        max_capacity: String(table.max_capacity),
        min_capacity:
          table.min_capacity != null ? String(table.min_capacity) : "",
      });
    }
  }, [table, form]);

  const {
    mutate,
    loading: saving,
    error: saveError,
  } = useMutation((input) => tablesApi.update(tenant, id, input));

  const {
    mutate: deactivate,
    loading: deactivating,
    error: deactivateError,
  } = useMutation(() => tablesApi.update(tenant, id, { active: false }));

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateTable(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const input = {
      name: form.name.trim(),
      max_capacity: Number(form.max_capacity),
    };
    input.min_capacity =
      form.min_capacity !== "" ? Number(form.min_capacity) : null;

    try {
      await mutate(input);
      router.replace("/mesas");
    } catch {
      /* erro exibido abaixo via `saveError` */
    }
  }

  async function onConfirmDeactivate(e) {
    e.preventDefault();
    try {
      await deactivate();
      setDialogOpen(false);
      router.replace("/mesas");
    } catch {
      /* erro exibido no diálogo via `deactivateError`; diálogo permanece aberto */
    }
  }

  return (
    <AppShell>
      <BackHeader
        title="Editar mesa"
        titleClassName="text-[17px]"
        fallbackHref="/mesas"
      />

      {!ready || loading || !form ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <div className="px-5 py-4">
          <ErrorState error={loadError} onRetry={refetch} />
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 px-5 py-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome da mesa</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name ? (
              <p className="text-[12px] text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="max-capacity">Capacidade máxima</Label>
            <Input
              id="max-capacity"
              type="number"
              inputMode="numeric"
              min="1"
              value={form.max_capacity}
              onChange={(e) => update("max_capacity", e.target.value)}
              className="font-mono"
              aria-invalid={!!fieldErrors.max_capacity}
            />
            {fieldErrors.max_capacity ? (
              <p className="text-[12px] text-destructive">
                {fieldErrors.max_capacity}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="min-capacity">
              Capacidade mínima{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Input
              id="min-capacity"
              type="number"
              inputMode="numeric"
              min="1"
              value={form.min_capacity}
              onChange={(e) => update("min_capacity", e.target.value)}
              className="font-mono"
              aria-invalid={!!fieldErrors.min_capacity}
            />
            {fieldErrors.min_capacity ? (
              <p className="text-[12px] text-destructive">
                {fieldErrors.min_capacity}
              </p>
            ) : null}
          </div>

          {saveError ? (
            <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
              {saveError.message}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-1 h-[50px] w-full rounded-xl text-[15px] font-bold hover:bg-primary/90"
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="h-11 w-full"
              >
                Desativar mesa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desativar mesa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Desativar bloqueia a mesa para novas reservas, mas não cancela
                  as reservas já feitas.
                  {scheduledCount > 0
                    ? ` Esta mesa tem ${scheduledCount} reserva${scheduledCount === 1 ? "" : "s"} agendada${scheduledCount === 1 ? "" : "s"}.`
                    : ""}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deactivateError ? (
                <div className="mt-3 rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
                  {deactivateError.message}
                </div>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={onConfirmDeactivate}
                  disabled={deactivating}
                >
                  {deactivating ? "Desativando…" : "Desativar"}
                </AlertDialogAction>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      )}
    </AppShell>
  );
}

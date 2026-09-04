import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { ErrorState } from "components/common/state-views";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { TimeChips } from "components/events/time-chips";
import { useQuery } from "hooks/use-query";
import { useMutation } from "hooks/use-mutation";
import { useTenant } from "context/tenant-context";
import { events as eventsApi } from "lib/api";
import { validateEvent, hasErrors } from "lib/validate";
import { todayISO } from "lib/format";

export default function EditarEventoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { tenant } = useTenant();

  const ready = !!tenant && !!id;
  const {
    data,
    loading,
    error: loadError,
    refetch,
  } = useQuery(() => eventsApi.get(tenant, id), [tenant, id], {
    enabled: ready,
  });

  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (data && !form) {
      // Hidratação única do formulário a partir do evento carregado.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: data.name,
        event_date: data.event_date,
        active: data.active,
        event_times: data.event_times,
      });
    }
  }, [data, form]);

  const {
    mutate,
    loading: saving,
    error: saveError,
  } = useMutation((input) => eventsApi.update(tenant, id, input));

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateEvent(form);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const input = {
      name: form.name.trim(),
      event_date: form.event_date,
      event_times: form.event_times,
      active: form.active,
    };

    try {
      await mutate(input);
      router.replace(`/eventos/${id}`);
    } catch {
      /* erro exibido abaixo via `saveError` */
    }
  }

  return (
    <AppShell>
      <BackHeader title="Editar evento" fallbackHref={`/eventos/${id}`} />

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
            <Label htmlFor="name">Nome do evento</Label>
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
            <Label htmlFor="event-date">Data do evento</Label>
            <Input
              id="event-date"
              type="date"
              value={form.event_date}
              min={todayISO()}
              onChange={(e) => update("event_date", e.target.value)}
              className="font-display"
              aria-invalid={!!fieldErrors.event_date}
            />
            {fieldErrors.event_date ? (
              <p className="text-[12px] text-destructive">
                {fieldErrors.event_date}
              </p>
            ) : null}
          </div>

          <Card
            className={
              form.active
                ? "flex items-center justify-between gap-3 border-success/40 bg-success-tint p-3.5"
                : "flex items-center justify-between gap-3 p-3.5"
            }
          >
            <label htmlFor="event-active" className="flex-1 cursor-pointer">
              <span className="block text-[15px] font-bold text-foreground">
                Evento ativo
              </span>
              <span className="block text-[13px] text-muted-foreground">
                Aceita reservas imediatamente
              </span>
            </label>
            <Switch
              id="event-active"
              checked={form.active}
              onCheckedChange={(v) => update("active", v)}
            />
          </Card>

          <div className="flex flex-col gap-1.5">
            <Label>Horários para reserva</Label>
            <TimeChips
              value={form.event_times}
              onChange={(times) => update("event_times", times)}
              error={fieldErrors.event_times}
            />
          </div>

          {saveError ? (
            <div className="rounded-lg border border-destructive/30 bg-danger-tint px-3 py-2 text-[13px] text-destructive">
              {saveError.message}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-1 h-[50px] w-full rounded-lg text-[15px] font-bold hover:bg-primary/90"
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
      )}
    </AppShell>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { Card } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "components/ui/select";
import { Switch } from "components/ui/switch";
import { TimeChips } from "components/events/time-chips";
import { useQuery } from "hooks/use-query";
import { useMutation } from "hooks/use-mutation";
import { useTenant } from "context/tenant-context";
import { events as eventsApi, presets as presetsApi } from "lib/api";
import { validateEvent, hasErrors } from "lib/validate";
import { todayISO } from "lib/format";

export default function NovoEventoPage() {
  const router = useRouter();
  const { tenant } = useTenant();

  const { data: presetsData } = useQuery(
    () => presetsApi.list(tenant),
    [tenant],
    { enabled: !!tenant },
  );
  const presets = presetsData || [];

  const [preset, setPreset] = useState("none");
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(todayISO());
  const [active, setActive] = useState(true);
  const [times, setTimes] = useState(["19:30", "20:30"]);
  const [fieldErrors, setFieldErrors] = useState({});

  const { mutate, loading, error } = useMutation((input) =>
    eventsApi.create(tenant, input),
  );

  function onPresetChange(value) {
    setPreset(value);
    if (value === "none") return;
    const p = presets.find((x) => x.id === value);
    if (p) {
      setName(p.name);
      if (p.event_times?.length) setTimes(p.event_times);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateEvent({
      name,
      event_date: eventDate,
      event_times: times,
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const input = {
      name: name.trim(),
      event_date: eventDate,
      event_times: times,
      active,
    };
    if (preset !== "none") input.preset_id = preset;

    try {
      const created = await mutate(input);
      router.replace(`/eventos/${created.id}`);
    } catch {
      /* erro exibido abaixo via `error` */
    }
  }

  return (
    <AppShell>
      <BackHeader title="Criar evento" titleClassName="text-[17px]" />

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 px-5 py-4"
        noValidate
      >
        <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          Informações básicas
        </p>

        {presets.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <Label>Usar predefinição</Label>
            <Select value={preset} onValueChange={onPresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome do evento</Label>
          <Input
            id="name"
            placeholder="Ex. Ilha de massas"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={eventDate}
            min={todayISO()}
            onChange={(e) => setEventDate(e.target.value)}
            className="font-mono"
            aria-invalid={!!fieldErrors.event_date}
          />
          {fieldErrors.event_date ? (
            <p className="text-[12px] text-destructive">
              {fieldErrors.event_date}
            </p>
          ) : null}
        </div>

        <Card className="flex items-center justify-between gap-3 p-3.5">
          <label htmlFor="event-active" className="flex-1 cursor-pointer">
            <span className="block text-[15px] font-semibold text-foreground">
              Evento ativo
            </span>
            <span className="block text-[13px] text-muted-foreground">
              Aceita reservas imediatamente
            </span>
          </label>
          <Switch
            id="event-active"
            checked={active}
            onCheckedChange={setActive}
          />
        </Card>

        <div className="flex flex-col gap-1.5">
          <Label>Horários para reserva</Label>
          <TimeChips
            value={times}
            onChange={setTimes}
            error={fieldErrors.event_times}
          />
        </div>

        {error ? (
          <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
            {error.message}
          </div>
        ) : null}

        <Button
          type="submit"
          className="mt-1 h-[50px] w-full rounded-xl text-[15px] font-bold hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar evento"}
        </Button>
      </form>
    </AppShell>
  );
}

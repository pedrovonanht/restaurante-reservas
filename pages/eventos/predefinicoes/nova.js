import { useState } from "react";
import { useRouter } from "next/router";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { TimeChips } from "components/events/time-chips";
import { useMutation } from "hooks/use-mutation";
import { useTenant } from "context/tenant-context";
import { presets as presetsApi } from "lib/api";
import { validatePreset, hasErrors } from "lib/validate";

export default function NovaPredefinicaoPage() {
  const router = useRouter();
  const { tenant } = useTenant();

  const [name, setName] = useState("");
  const [times, setTimes] = useState(["19:30", "20:30"]);
  const [fieldErrors, setFieldErrors] = useState({});

  const { mutate, loading, error } = useMutation((input) =>
    presetsApi.create(tenant, input),
  );

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validatePreset({
      name,
      event_times: times,
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    try {
      await mutate({
        name: name.trim(),
        event_times: times,
      });
      router.replace("/eventos");
    } catch {
      /* erro exibido abaixo via `error` */
    }
  }

  return (
    <AppShell>
      <BackHeader
        title="Criar predefinição"
        titleClassName="text-[17px]"
        fallbackHref="/eventos"
      />

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 px-5 py-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome da predefinição</Label>
          <Input
            id="name"
            placeholder="Ex. Noite de massas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name ? (
            <p className="text-[12px] text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

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
          {loading ? "Criando…" : "Criar predefinição"}
        </Button>
      </form>
    </AppShell>
  );
}

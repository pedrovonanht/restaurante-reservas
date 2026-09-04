import { useState } from "react";
import { useRouter } from "next/router";

import { AppShell } from "components/layout/app-shell";
import { BackHeader } from "components/layout/back-header";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { useMutation } from "hooks/use-mutation";
import { useTenant } from "context/tenant-context";
import { tables as tablesApi } from "lib/api";
import { validateTable, hasErrors } from "lib/validate";

export default function NovaMesaPage() {
  const router = useRouter();
  const { tenant } = useTenant();

  const [name, setName] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { mutate, loading, error } = useMutation((input) =>
    tablesApi.create(tenant, input),
  );

  async function onSubmit(e) {
    e.preventDefault();
    const errors = validateTable({
      name,
      max_capacity: maxCapacity,
      min_capacity: minCapacity,
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const input = { name: name.trim(), max_capacity: Number(maxCapacity) };
    if (minCapacity !== "") input.min_capacity = Number(minCapacity);

    try {
      await mutate(input);
      router.replace("/mesas");
    } catch {
      /* erro exibido abaixo via `error` */
    }
  }

  return (
    <AppShell>
      <BackHeader title="Criar mesa" fallbackHref="/mesas" />

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 px-5 py-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome da mesa</Label>
          <Input
            id="name"
            placeholder="Ex. Mesa 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            placeholder="4"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            className="font-display"
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
            placeholder="1"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className="font-display"
            aria-invalid={!!fieldErrors.min_capacity}
          />
          {fieldErrors.min_capacity ? (
            <p className="text-[12px] text-destructive">
              {fieldErrors.min_capacity}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-danger-tint px-3 py-2 text-[13px] text-destructive">
            {error.message}
          </div>
        ) : null}

        <Button
          type="submit"
          className="mt-1 h-[50px] w-full rounded-lg text-[15px] font-bold hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Criando…" : "Criar mesa"}
        </Button>
      </form>
    </AppShell>
  );
}

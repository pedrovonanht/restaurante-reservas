import { useState } from "react";

import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { useMutation } from "hooks/use-mutation";
import { restaurants as restaurantsApi } from "lib/api";
import { validateRestaurant, hasErrors } from "lib/validate";

// Formulário reutilizável de criação de restaurante (POST /restaurants).
// Usado no tenant-switcher e no onboarding de quem ainda não tem restaurante.
export function RestaurantForm({
  onCreated,
  onCancel,
  submitLabel = "Criar restaurante",
}) {
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { mutate, loading, error } = useMutation(restaurantsApi.create);

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateRestaurant({ name });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;
    try {
      const created = await mutate({ name: name.trim() });
      onCreated?.(created);
    } catch {
      /* erro exibido abaixo via `error` */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <Input
          placeholder="Nome do restaurante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
          autoFocus
        />
        {fieldErrors.name ? (
          <p className="text-[12px] text-destructive">{fieldErrors.name}</p>
        ) : null}
      </div>
      {error ? (
        <p className="text-[12px] text-destructive">{error.message}</p>
      ) : null}
      <div className="flex gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="submit"
          className="h-11 flex-1 hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? "Criando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

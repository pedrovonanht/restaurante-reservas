import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// `<input type="time">` mostra AM/PM conforme o idioma/SO do navegador. Um campo de
// texto com máscara garante sempre o formato 24h usado no Brasil (ex.: 23:00, 12:00).
function formatTimeInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// Chips de horário editáveis. "Adicionar horário" abre um input para a pessoa
// digitar/selecionar o horário desejado (sem incremento automático).
export function TimeChips({ value = [], onChange, error }) {
  const [draft, setDraft] = useState(null);

  function remove(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function update(idx, next) {
    onChange(value.map((t, i) => (i === idx ? formatTimeInput(next) : t)));
  }

  function confirmDraft() {
    if (draft && TIME_RE.test(draft) && !value.includes(draft)) {
      onChange([...value, draft]);
      setDraft(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((time, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft py-1.5 pr-1.5 pl-3"
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={time}
                onChange={(e) => update(idx, e.target.value)}
                aria-label={`Horário ${idx + 1}`}
                className="w-[46px] bg-transparent font-display text-[13px] font-medium text-primary outline-none"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label="Remover horário"
                className="flex size-5 items-center justify-center rounded-full text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {draft !== null ? (
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="HH:MM"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(formatTimeInput(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmDraft();
              }
              if (e.key === "Escape") setDraft(null);
            }}
            className="flex-1 bg-transparent font-display text-[13px] text-foreground outline-none"
          />
          <button
            type="button"
            onClick={confirmDraft}
            aria-label="Confirmar horário"
            className="flex size-6 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            aria-label="Cancelar"
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDraft("19:30")}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" /> Adicionar horário
        </button>
      )}

      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}

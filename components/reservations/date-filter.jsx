import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "components/ui/popover";
import { cn } from "lib/utils";

const PRESETS = [
  { mode: "today", label: "Hoje" },
  { mode: "week", label: "Esta semana" },
  { mode: "month", label: "Este mês" },
];

// Filtro de período das reservas: atalhos (hoje/semana/mês) + escolha de uma
// data específica, resolvidos server-side via `reservations.listOwner({from,to})`.
export function ReservationsDateFilter({
  mode,
  label,
  customDate,
  onSelectPreset,
  onSelectCustom,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground outline-none">
        <CalendarDays className="size-3.5" />
        {label}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 p-1.5">
        <div className="flex flex-col">
          {PRESETS.map((p) => (
            <button
              key={p.mode}
              type="button"
              onClick={() => {
                onSelectPreset(p.mode);
                setOpen(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-[14px] transition-colors",
                mode === p.mode
                  ? "bg-accent-soft font-bold text-primary"
                  : "hover:bg-accent",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-1 border-t border-border pt-2">
          <label
            htmlFor="reservas-data-especifica"
            className="block px-3 pb-1 text-[12px] text-muted-foreground"
          >
            Escolher data
          </label>
          <input
            id="reservas-data-especifica"
            type="date"
            value={customDate}
            onChange={(e) => {
              if (!e.target.value) return;
              onSelectCustom(e.target.value);
              setOpen(false);
            }}
            className={cn(
              "mx-1 w-[calc(100%-8px)] rounded-lg border border-input px-2.5 py-1.5 font-display text-[13px] text-foreground outline-none",
              mode === "custom" && "border-primary",
            )}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

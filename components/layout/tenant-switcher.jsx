import { useState } from "react";
import { Check, ChevronsUpDown, Lock } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "components/ui/popover";
import { useTenant } from "context/tenant-context";
import { cn } from "lib/utils";

export function TenantSwitcher({ triggerClassName }) {
  const { restaurants, tenant, current, setTenant } = useTenant();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex min-w-0 items-center gap-1 text-[13px] font-semibold text-ink-soft outline-none",
          triggerClassName,
        )}
      >
        <span className="max-w-[170px] truncate">
          {current?.slug || current?.name || "Selecionar restaurante"}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[290px] p-0">
        <ul className="max-h-[320px] overflow-auto py-1">
          {restaurants.map((r) => {
            const selected = r.slug === tenant;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    setTenant(r.slug);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 border-b border-border-soft px-4 py-3 text-left transition-colors last:border-b-0",
                    selected ? "bg-accent-soft" : "hover:bg-accent",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {r.name}
                    </span>
                    <span className="block truncate font-display text-[11px] text-muted-foreground">
                      {r.slug}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-[22px] shrink-0 items-center justify-center rounded-md border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-center gap-2 border-t border-border-soft px-4 py-3 text-[12px] text-muted-foreground">
          <Lock className="size-3.5" /> Adicionar Restaurante
        </div>
      </PopoverContent>
    </Popover>
  );
}

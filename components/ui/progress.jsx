import * as React from "react";

import { cn } from "lib/utils";

// Barra de ocupação. `value` em 0–100.
function Progress({ value = 0, className, indicatorClassName, ...props }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[oklch(0.93_0.008_262)]",
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-primary transition-[width]",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };

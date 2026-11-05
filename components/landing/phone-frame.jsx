import { BatteryFull, Signal, Wifi } from "lucide-react";

import { cn } from "lib/utils";

// Moldura de celular usada na landing (telas estáticas) e na demo (telas
// interativas). A tela tem altura fixa e o conteúdo controla a própria rolagem.
export function PhoneFrame({
  children,
  className,
  screenClassName,
  style,
  label,
}) {
  return (
    <div
      className={cn(
        "relative w-[300px] shrink-0 rounded-[46px] bg-ink p-[10px] shadow-[0_40px_80px_-30px_rgba(22,32,58,.55)]",
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="pointer-events-none absolute top-[18px] left-1/2 z-30 h-[24px] w-[92px] -translate-x-1/2 rounded-full bg-ink" />
      <div
        className={cn(
          "relative flex h-[610px] flex-col overflow-hidden rounded-[36px] bg-background",
          screenClassName,
        )}
        style={style}
      >
        <div className="flex h-[44px] shrink-0 items-center justify-between px-7 pt-1 font-display text-[13px] font-bold text-ink">
          <span>19:42</span>
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

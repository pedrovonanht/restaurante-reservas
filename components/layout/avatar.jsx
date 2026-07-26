import { cn } from "lib/utils";

function getInitials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function Avatar({ name, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[oklch(0.86_0.03_258)] bg-[oklch(0.93_0.02_258)] text-[13px] font-semibold text-[oklch(0.45_0.14_258)]",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}

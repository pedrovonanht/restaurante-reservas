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
        "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-primary",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}

import { MessageCircle } from "lucide-react";

import { Card } from "components/ui/card";
import { formatDayMonth, formatTime } from "lib/format";
import { waLink } from "lib/whatsapp";
import { cn } from "lib/utils";

export function ReservationCard({ reservation, open, onToggle }) {
  const { guest_name, party_size, guest_phone, reservation_time, event } =
    reservation;
  const dateLabel = event?.event_date ? formatDayMonth(event.event_date) : "";
  const timeLabel = formatTime(reservation_time);
  const wa = waLink(guest_phone);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
      className={cn(
        "cursor-pointer p-3.5 transition-colors outline-none focus-visible:border-ring",
        open && "border-[oklch(0.78_0.03_262)]",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-base font-semibold text-foreground">
          {guest_name}
        </span>
        <span className="shrink-0 font-mono text-[13px] text-[oklch(0.4_0.02_262)]">
          {party_size} {party_size === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>
      <p className="mt-1 font-mono text-[12px] text-muted-foreground">
        {dateLabel}
        {timeLabel ? ` | ${timeLabel}` : ""}
      </p>

      {open ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="min-w-0 truncate text-[13px] text-muted-foreground">
            evento:{" "}
            <span className="text-foreground italic">{event?.name || "—"}</span>
          </span>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Conversar com ${guest_name} no WhatsApp`}
              className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-full border border-[oklch(0.88_0.03_155)] bg-success-tint text-success transition-colors hover:bg-[oklch(0.95_0.05_155)]"
            >
              <MessageCircle className="size-[18px]" />
            </a>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

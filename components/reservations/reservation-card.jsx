import { MessageCircle } from "lucide-react";

import { Card } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { formatDayMonth, formatTime } from "lib/format";
import { waLink } from "lib/whatsapp";
import { cn } from "lib/utils";

export function ReservationCard({ reservation, open, onToggle }) {
  const {
    guest_name,
    party_size,
    guest_phone,
    reservation_time,
    event,
    table_name,
  } = reservation;
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
        open && "border-primary/30",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate font-display text-base font-bold text-foreground">
          {guest_name}
        </span>
        <Badge variant="secondary" className="shrink-0">
          {party_size} {party_size === 1 ? "pessoa" : "pessoas"}
        </Badge>
      </div>
      <p className="mt-1 text-[12px] font-medium text-muted-foreground">
        {dateLabel}
        {timeLabel ? ` | ${timeLabel}` : ""}
      </p>

      {open ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex min-w-0 flex gap-8">
            <span className="min-w-0 truncate flex flex-col text-[13px]">
              <span className="text-muted-foreground">evento:{" "}</span>
              <span className="text-foreground italic ">
                {event?.name || "—"}
              </span>
            </span>
            {table_name ? (
              <span className="min-w-0 truncate flex flex-col text-[13px] text-muted-foreground">
                <span>mesa:{" "}</span>
                <span className="text-foreground italic">{table_name}</span>
              </span>
            ) : null}
          </div>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Conversar com ${guest_name} no WhatsApp`}
              className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground transition-colors hover:bg-success/90"
            >
              <MessageCircle className="size-[18px]" />
            </a>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Card } from "components/ui/card";
import { Progress } from "components/ui/progress";
import { formatDayMonth, occupancyPercent } from "lib/format";
import { cn } from "lib/utils";

export function EventCard({ event, href }) {
  const closed = !event.active;
  const oc = event.ocupation || {
    reservations: 0,
    capacity: event.capacity || 0,
    people: 0,
  };
  const pct = occupancyPercent(oc);

  const inner = (
    <Card
      className={cn(
        "p-3.5 transition-colors",
        closed
          ? "border-[oklch(0.92_0.008_262)] bg-[oklch(0.975_0.004_262)]"
          : "hover:border-[oklch(0.72_0.06_258)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "text-base font-semibold",
            closed ? "text-[oklch(0.5_0.02_262)]" : "text-foreground",
          )}
        >
          {event.name}
        </h3>
        <span
          className={cn(
            "shrink-0 text-[12px] font-semibold",
            closed ? "text-muted-foreground" : "text-success",
          )}
        >
          {closed ? "encerrada" : "ativa"}
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
        <CalendarDays className="size-3.5" /> {formatDayMonth(event.event_date)}
      </p>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="text-muted-foreground">Reservas</span>
        <span className="font-mono text-foreground">
          {oc.reservations}/{oc.capacity}
        </span>
      </div>
      <Progress
        value={pct}
        className="mt-1.5"
        indicatorClassName={closed ? "bg-[oklch(0.78_0.02_262)]" : undefined}
      />
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Card } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { Progress } from "components/ui/progress";
import { formatDayMonth, tableOccupancyPercent } from "lib/format";
import { cn } from "lib/utils";

export function EventCard({ event, href }) {
  const closed = !event.active;
  const oc = event.ocupation || {
    reservations: 0,
    total_capacity: 0,
    people: 0,
    empty_tables: 0,
  };
  const pct = tableOccupancyPercent(oc);
  const totalTables = oc.reservations + oc.empty_tables;

  const inner = (
    <Card
      className={cn(
        "p-3.5 transition-colors",
        closed
          ? "border-border-soft bg-surface-alt"
          : "hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "font-display text-base font-bold",
            closed ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {event.name}
        </h3>
        <Badge variant={closed ? "warning" : "success"} className="shrink-0">
          {closed ? "encerrada" : "ativa"}
        </Badge>
      </div>
      <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
        <CalendarDays className="size-3.5" /> {formatDayMonth(event.event_date)}
      </p>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="text-muted-foreground">Mesas ocupadas</span>
        <span className="font-display text-foreground">
          {oc.reservations}/{totalTables}
        </span>
      </div>
      <Progress
        value={pct}
        className="mt-1.5"
        indicatorClassName={closed ? "bg-muted-foreground/40" : undefined}
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

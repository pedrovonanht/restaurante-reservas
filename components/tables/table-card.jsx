import Link from "next/link";
import { Users } from "lucide-react";

import { Card } from "components/ui/card";

export function TableCard({ table, href }) {
  return (
    <Link href={href} className="block">
      <Card className="p-3.5 transition-colors hover:border-[oklch(0.72_0.06_258)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">
            {table.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 font-mono text-[13px] text-muted-foreground">
            <Users className="size-3.5" />
            {table.min_capacity}–{table.max_capacity}
          </span>
        </div>
      </Card>
    </Link>
  );
}

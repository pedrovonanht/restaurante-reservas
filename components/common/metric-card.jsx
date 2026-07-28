import { Card } from "components/ui/card";
import { cn } from "lib/utils";

export function MetricCard({ value, label, className }) {
  return (
    <Card className={cn("flex flex-col gap-1 p-4", className)}>
      <span className="font-display text-[32px] leading-none font-bold tracking-[-0.03em] text-foreground">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </Card>
  );
}

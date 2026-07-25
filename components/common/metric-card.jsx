import { Card } from "components/ui/card";
import { cn } from "lib/utils";

export function MetricCard({ value, label, className }) {
  return (
    <Card className={cn("flex flex-col gap-1 p-4", className)}>
      <span className="font-mono text-[32px] leading-none font-extrabold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </Card>
  );
}

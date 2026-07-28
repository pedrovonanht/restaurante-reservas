import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "components/ui/button";
import { Skeleton } from "components/ui/skeleton";
import { cn } from "lib/utils";

export function ErrorState({ error, onRetry, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-danger-tint text-destructive">
        <AlertCircle className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-display text-[16px] font-bold text-foreground">
          {error?.message || "Algo deu errado."}
        </p>
        {error?.action ? (
          <p className="text-[13px] text-muted-foreground">{error.action}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="outline" className="h-10" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-primary">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-display text-[16px] font-bold text-foreground">
          {title}
        </p>
        {description ? (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardListSkeleton({ count = 3, className }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-3.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

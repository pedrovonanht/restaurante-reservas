import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { Avatar } from "components/layout/avatar";
import { useAuth } from "context/auth-context";
import { cn } from "lib/utils";

export function BackHeader({
  title,
  fallbackHref = "/eventos",
  titleClassName,
  right,
}) {
  const router = useRouter();
  const { user } = useAuth();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1)
      router.back();
    else router.push(fallbackHref);
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-5 py-3">
      <button
        type="button"
        onClick={goBack}
        className="-ml-1 flex min-w-0 items-center gap-1.5 text-foreground outline-none"
        aria-label="Voltar"
      >
        <ArrowLeft className="size-5 shrink-0" />
        <span
          className={cn(
            "truncate font-display text-[20px] font-bold tracking-[-0.02em]",
            titleClassName,
          )}
        >
          {title}
        </span>
      </button>
      {right ?? <Avatar name={user?.username} />}
    </header>
  );
}

import Link from "next/link";
import { Utensils } from "lucide-react";

import { cn } from "lib/utils";

export function Logo({ href = "/conheca", className }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 text-foreground", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Utensils className="size-[17px]" />
      </span>
      <span className="font-display text-[19px] font-bold tracking-[-0.02em]">
        Tablefy
      </span>
    </Link>
  );
}

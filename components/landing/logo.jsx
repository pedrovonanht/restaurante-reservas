import Link from "next/link";

import { cn } from "lib/utils";

export function Logo({ href = "/conheca", className }) {
  return (
    <Link href={href} className={cn("flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/flamba-logo.png"
        alt="Flamba"
        className="h-9 w-auto mix-blend-multiply"
      />
    </Link>
  );
}

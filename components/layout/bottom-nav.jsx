import Link from "next/link";
import { useRouter } from "next/router";
import { Home, CalendarDays, Settings } from "lucide-react";

import { cn } from "lib/utils";

// Nav inferior de 3 itens (Relatórios foi removido por ora, conforme handoff).
// Criar/Detalhe de evento mantêm "Eventos" ativo (via startsWith).
const ITEMS = [
  { href: "/", label: "Início", icon: Home, isActive: (p) => p === "/" },
  {
    href: "/eventos",
    label: "Eventos",
    icon: CalendarDays,
    isActive: (p) => p.startsWith("/eventos"),
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    isActive: (p) => p.startsWith("/configuracoes"),
  },
];

export function BottomNav() {
  const { pathname } = useRouter();

  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-border bg-[oklch(0.99_0.003_262)] px-3 pt-2.5 pb-[max(22px,env(safe-area-inset-bottom))]">
      {ITEMS.map(({ href, label, icon: Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 text-[12px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

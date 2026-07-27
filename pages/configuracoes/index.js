import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight, LogOut, Table2 } from "lucide-react";

import { AppShell } from "components/layout/app-shell";
import { Avatar } from "components/layout/avatar";
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { useAuth } from "context/auth-context";
import { useTenant } from "context/tenant-context";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { current } = useTenant();

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <AppShell requireTenant={false}>
      <header className="sticky top-0 z-10 border-b border-border bg-background px-5 py-3">
        <h1 className="text-[17px] font-bold text-foreground">Configurações</h1>
      </header>

      <section className="flex flex-col gap-4 px-5 py-4">
        <Card className="flex items-center gap-3 p-4">
          <Avatar name={user?.username} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {user?.username}
            </p>
            <p className="truncate text-[13px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </Card>

        {current ? (
          <Card className="p-4">
            <p className="text-[13px] text-muted-foreground">
              Restaurante atual
            </p>
            <p className="mt-0.5 text-[15px] font-semibold text-foreground">
              {current.name}
            </p>
            <p className="font-mono text-[12px] text-muted-foreground">
              {current.slug}
            </p>
          </Card>
        ) : null}

        <Link href="/mesas">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:border-[oklch(0.72_0.06_258)]">
            <Table2 className="size-5 text-muted-foreground" />
            <span className="flex-1 text-[15px] font-semibold text-foreground">
              Mesas
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Card>
        </Link>

        <Button
          variant="outline"
          className="h-11 justify-center gap-2 text-destructive hover:bg-destructive/5"
          onClick={onLogout}
        >
          <LogOut className="size-4" /> Sair
        </Button>
      </section>
    </AppShell>
  );
}

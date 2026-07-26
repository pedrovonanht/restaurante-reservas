import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2, Lock } from "lucide-react";

import { BottomNav } from "components/layout/bottom-nav";
import { useAuth } from "context/auth-context";
import { useTenant } from "context/tenant-context";

function FullScreenLoader() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-canvas">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// Enquanto o fluxo de cobrança/subscription não existe, restaurantes são criados
// manualmente pelo administrador — a UI não permite autoatendimento.
function NoRestaurantLocked() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[oklch(0.93_0.02_258)] text-primary">
        <Lock className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          Produto em fase de testes
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Contate o administrador para começar o uso.
        </p>
      </div>
    </div>
  );
}

// Frame gateado do painel: coluna central (mobile-first) + nav inferior.
// Redireciona para /login sem sessão e mostra a mensagem de acesso restrito
// quando não há tenant. Cada página controla o próprio header e o padding do conteúdo.
export function AppShell({ children, requireTenant = true }) {
  const { user, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) return <FullScreenLoader />;

  let body;
  if (requireTenant && tenantLoading) {
    body = (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (requireTenant && !tenant) {
    body = <NoRestaurantLocked />;
  } else {
    body = children;
  }

  return (
    <div className="flex min-h-[100dvh] justify-center bg-canvas">
      <div className="relative flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-background">
        <div className="flex flex-1 flex-col">{body}</div>
        <BottomNav />
      </div>
    </div>
  );
}

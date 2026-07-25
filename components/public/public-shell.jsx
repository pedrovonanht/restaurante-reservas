// Sobrescreve --primary/--ring para um tom neutro (ink), evitando que o azul de
// marca do painel apareça nas páginas públicas de reserva (não devem destoar da
// identidade visual de nenhum restaurante). O mesmo mecanismo do dark mode
// (`.dark { --primary: ... }` em globals.css) garante que a cascata funcione.
export const NEUTRAL_VARS = {
  "--primary": "oklch(0.24 0.02 262)",
  "--primary-foreground": "oklch(0.98 0.003 262)",
  "--ring": "oklch(0.24 0.02 262)",
};

// Container central (mobile-first) para as páginas públicas de reserva do convidado.
// Sem AppShell: nenhuma autenticação, nenhum bottom nav.
export function PublicShell({
  title = "Faça sua reserva",
  subtitle,
  children,
}) {
  return (
    <div
      className="flex min-h-[100dvh] justify-center bg-canvas"
      style={NEUTRAL_VARS}
    >
      <div className="flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-background">
        <header className="px-6 pt-10 pb-2 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
        <div className="flex flex-1 flex-col px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

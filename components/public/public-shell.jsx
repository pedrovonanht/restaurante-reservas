// Sobrescreve --primary/--ring para um tom neutro (ink), evitando que o azul de
// marca do painel apareça nas páginas públicas de reserva (não devem destoar da
// identidade visual de nenhum restaurante). O mesmo mecanismo do dark mode
// (`.dark { --primary: ... }` em globals.css) garante que a cascata funcione.
export const NEUTRAL_VARS = {
  "--primary": "#16203a",
  "--primary-foreground": "#ffffff",
  "--secondary": "#efe8da",
  "--secondary-foreground": "#16203a",
  "--accent-soft": "#efe8da",
  "--accent-soft-foreground": "#16203a",
  "--ring": "#16203a",
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
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
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

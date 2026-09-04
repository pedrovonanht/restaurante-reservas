// Container centralizado (mobile-first) para as telas públicas de auth.
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[100dvh] justify-center bg-canvas">
      <div className="flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🍽️</div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {children}
        {footer ? (
          <div className="mt-6 text-center text-[13px] text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

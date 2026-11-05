import { useState, useSyncExternalStore } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";

import { AllocationExplainer } from "components/demo/allocation-explainer";
import { GuestView } from "components/demo/guest-view";
import { OwnerView } from "components/demo/owner-view";
import { Logo } from "components/landing/logo";
import { PhoneFrame } from "components/landing/phone-frame";
import { createDemoState, createReservation } from "lib/demo";
import { cn } from "lib/utils";

// A página é pré-renderizada estaticamente, mas a demo depende da data atual
// (o evento é sempre a próxima sexta). Só montamos a demo no cliente para não
// haver divergência de hidratação entre o HTML do build e o navegador.
const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Panel({ step, title, subtitle, hiddenOnMobile, children }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4",
        hiddenOnMobile && "hidden lg:flex",
      )}
    >
      <div className="text-center">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {step}
        </p>
        <p className="mt-1 font-display text-[18px] font-bold text-foreground">
          {title}
        </p>
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function DemoApp({ onReset }) {
  const [state, setState] = useState(createDemoState);
  const [mobileView, setMobileView] = useState("guest");
  const [ownerTab, setOwnerTab] = useState("inicio");
  const [formKey, setFormKey] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(null);

  async function handleSubmit(values) {
    setSubmitting(true);
    setError(null);
    await wait(600);
    try {
      const { reservation, allocation } = createReservation(state, values);
      setState((s) => ({
        ...s,
        reservations: [...s.reservations, reservation],
      }));
      setResult(reservation);
      setAttempt({ ok: true, reservation, allocation });
      setOwnerTab("mesas");
    } catch (err) {
      setError(err);
      setAttempt({
        ok: false,
        kind: err.kind,
        partySize: Number(values.party_size),
      });
    } finally {
      setSubmitting(false);
    }
  }

  function startNewReservation() {
    setResult(null);
    setError(null);
    setFormKey((k) => k + 1);
  }

  function openGuestLink() {
    if (result) startNewReservation();
    setMobileView("guest");
  }

  function toggleTable(id) {
    setState((s) => ({
      ...s,
      tables: s.tables.map((t) =>
        t.id === id ? { ...t, active: !t.active } : t,
      ),
    }));
  }

  const lastOk = attempt?.ok ? attempt : null;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20">
      <div className="flex flex-col gap-5 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-[42px]">
            Teste o Tablefy na prática.
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
            À esquerda, o que seu cliente vê ao abrir o link de reserva. À
            direita, o painel da sua equipe. Faça uma reserva e veja ela chegar
            com a mesa já escolhida.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-card px-4 text-[14px] font-semibold text-foreground transition-colors hover:border-primary/40 sm:self-auto"
        >
          <RotateCcw className="size-4" /> Reiniciar demo
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Escolha a visão"
        className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1 lg:hidden"
      >
        {[
          ["guest", "Cliente"],
          ["owner", "Restaurante"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mobileView === key}
            onClick={() => setMobileView(key)}
            className={cn(
              "h-10 rounded-md text-[14px] font-bold transition-colors",
              mobileView === key
                ? "bg-primary text-primary-foreground"
                : "text-ink-soft",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-start justify-items-center gap-10 lg:grid-cols-[auto_auto_1fr] lg:gap-8">
        <Panel
          step="1 · Cliente"
          title="Link de reserva"
          subtitle="Sem app e sem cadastro"
          hiddenOnMobile={mobileView !== "guest"}
        >
          <PhoneFrame>
            <GuestView
              event={state.event}
              formKey={formKey}
              result={result}
              error={error}
              submitting={submitting}
              onSubmit={handleSubmit}
              onNew={startNewReservation}
            />
          </PhoneFrame>
        </Panel>

        <Panel
          step="2 · Restaurante"
          title="Painel da equipe"
          subtitle="Tudo atualizado na hora"
          hiddenOnMobile={mobileView !== "owner"}
        >
          <PhoneFrame>
            <OwnerView
              state={state}
              tab={ownerTab}
              onTabChange={setOwnerTab}
              highlightId={lastOk?.reservation.id}
              highlightTableId={lastOk?.allocation.table.id}
              onOpenGuestLink={openGuestLink}
              onToggleTable={toggleTable}
            />
          </PhoneFrame>
        </Panel>

        <div className="w-full lg:pt-[76px]">
          <AllocationExplainer
            attempt={attempt}
            onSeePanel={() => setMobileView("owner")}
          />
        </div>
      </div>
    </main>
  );
}

export default function DemoPage() {
  const isClient = useIsClient();
  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <Head>
        <title>Demo interativa · Tablefy</title>
        <meta
          name="description"
          content="Faça uma reserva como cliente e veja ela chegar no painel do restaurante, com a mesa escolhida automaticamente."
        />
      </Head>
      <div className="min-h-[100dvh] bg-canvas">
        <header className="border-b border-border/70 bg-canvas">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-bold text-primary">
                Demo
              </span>
            </div>
            <Link
              href="/conheca"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-soft hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Voltar ao site
            </Link>
          </div>
        </header>
        {isClient ? (
          <DemoApp key={resetKey} onReset={() => setResetKey((k) => k + 1)} />
        ) : (
          <div className="flex justify-center py-32">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </>
  );
}

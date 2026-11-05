import Link from "next/link";
import { ArrowRight, Ban, Check, Lightbulb, Users } from "lucide-react";

import { Card } from "components/ui/card";
import { cn } from "lib/utils";

const range = (t) => `${t.min_capacity}–${t.max_capacity}`;

const TIPS = [
  "Reserve para 3 pessoas e veja qual mesa o sistema escolhe.",
  "Reserve para 12 pessoas duas vezes. Na segunda não sobra mesa e a reserva é recusada.",
  "Use o mesmo celular duas vezes para ver o bloqueio de reserva duplicada.",
  "Na aba Mesas, desative uma mesa livre e veja a alocação mudar.",
];

function OkResult({ attempt, onSeePanel }) {
  const { reservation, allocation } = attempt;
  const { table, candidates, partySize } = allocation;
  const reason =
    candidates.length === 1
      ? `A ${table.name} (${range(table)} pessoas) era a única mesa livre para um grupo de ${partySize}.`
      : `Havia ${candidates.length} mesas livres para ${partySize} pessoas. A ${table.name} é a de menor capacidade, então as maiores continuam livres para grupos maiores.`;

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-success-tint text-success">
          <Check className="size-5" />
        </span>
        <div>
          <p className="font-display text-[16px] font-bold text-foreground">
            {reservation.guest_name} · {partySize}{" "}
            {partySize === 1 ? "pessoa" : "pessoas"}
          </p>
          <p className="text-[13px] text-muted-foreground">
            Mesa alocada automaticamente
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {candidates.map((t) => (
          <span
            key={t.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-display text-[13px]",
              t.id === table.id
                ? "border-success bg-success-tint font-bold text-success"
                : "border-border bg-card text-ink-soft",
            )}
          >
            {t.name}
            <span className="flex items-center gap-0.5 text-[11px] opacity-80">
              <Users className="size-3" />
              {range(t)}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{reason}</p>
      <button
        type="button"
        onClick={onSeePanel}
        className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-primary lg:hidden"
      >
        Ver no painel do restaurante <ArrowRight className="size-4" />
      </button>
    </>
  );
}

function ErrorResult({ attempt }) {
  const noTable = attempt.kind === "no-table";
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-tint text-destructive">
        <Ban className="size-5" />
      </span>
      <div>
        <p className="font-display text-[16px] font-bold text-foreground">
          {noTable
            ? `Sem mesa livre para ${attempt.partySize} pessoas`
            : "Telefone já tem reserva nesta data"}
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
          {noTable
            ? "A reserva foi recusada em vez de virar overbooking. O cliente é avisado na hora e pode escolher outra data."
            : "O Tablefy impede que o mesmo cliente ocupe duas mesas na mesma noite."}
        </p>
      </div>
    </div>
  );
}

export function AllocationExplainer({ attempt, onSeePanel }) {
  return (
    <div className="flex w-full flex-col gap-4 lg:max-w-sm">
      <Card className="p-5">
        <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          O que aconteceu
        </p>
        <div className="mt-3">
          {!attempt ? (
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Preencha a reserva como se fosse o cliente. Ao enviar, o Tablefy
              procura as mesas livres que comportam o grupo e escolhe a de menor
              capacidade. O resultado aparece aqui e no painel do restaurante.
            </p>
          ) : attempt.ok ? (
            <OkResult attempt={attempt} onSeePanel={onSeePanel} />
          ) : (
            <ErrorResult attempt={attempt} />
          )}
        </div>
      </Card>

      <Card className="p-5">
        <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          <Lightbulb className="size-3.5" /> Experimente
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {TIPS.map((tip) => (
            <li
              key={tip}
              className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-lg bg-primary p-5 text-primary-foreground">
        <p className="font-display text-[17px] font-bold">
          Gostou? Leve para o seu restaurante.
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-primary-foreground/80">
          Na versão real, suas mesas, seus eventos e seu link próprio.
        </p>
        <Link
          href="/conheca"
          className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold underline-offset-4 hover:underline"
        >
          Conhecer o Tablefy <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

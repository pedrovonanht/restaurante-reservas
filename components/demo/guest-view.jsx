import { Check } from "lucide-react";

import { NEUTRAL_VARS } from "components/public/public-shell";
import { ReservationForm } from "components/public/reservation-form";
import { Card } from "components/ui/card";
import { DEMO_RESTAURANT } from "lib/demo";
import { formatDayMonth, formatTime, weekdayLabel } from "lib/format";

function SuccessView({ reservation, event, onNew }) {
  const rows = [
    ["Nome", reservation.guest_name],
    ["Data", formatDayMonth(event.event_date)],
    ["Horário", formatTime(reservation.reservation_time)],
    ["Pessoas", reservation.party_size],
    ["Código", reservation.public_token],
  ];
  return (
    <div className="flex flex-1 flex-col items-center gap-4 py-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-tint text-success">
        <Check className="size-7" />
      </span>
      <div>
        <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">
          Reserva confirmada
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Guarde o código para consultar sua reserva depois.
        </p>
      </div>
      <Card className="w-full p-4 text-left">
        <dl className="flex flex-col gap-2 text-[14px]">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-display font-medium text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      <button
        type="button"
        onClick={onNew}
        className="text-[13px] font-semibold text-primary underline-offset-4 hover:underline"
      >
        Fazer outra reserva
      </button>
    </div>
  );
}

export function GuestView({
  event,
  formKey,
  result,
  error,
  submitting,
  onSubmit,
  onNew,
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto" style={NEUTRAL_VARS}>
      <header className="px-6 pt-4 pb-1 text-center">
        <p className="text-[12px] font-semibold text-muted-foreground">
          {DEMO_RESTAURANT}
        </p>
        <h3 className="mt-1 font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
          Faça sua reserva
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {event.name} · {weekdayLabel(event.event_date)},{" "}
          {formatDayMonth(event.event_date)}
        </p>
      </header>
      <div className="px-6 pt-4 pb-6">
        {result ? (
          <SuccessView reservation={result} event={event} onNew={onNew} />
        ) : (
          <ReservationForm
            key={formKey}
            reservationDate={event.event_date}
            times={event.event_times}
            onSubmit={onSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

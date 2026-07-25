import { useState } from "react";

import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Button } from "components/ui/button";
import { formatTime } from "lib/format";
import { validateReservation, hasErrors } from "lib/validate";
import { cn } from "lib/utils";

// Formulário de reserva do convidado, compartilhado entre a página genérica
// (recebe `dateField` — um seletor de data) e a de evento específico (data fixa,
// sem `dateField`). `times` são os horários do evento correspondente à
// `reservationDate` atual; o horário selecionado é derivado sem efeito, igual ao
// padrão já usado em outras listas do painel (cai para `times[0]` se ficar obsoleto).
export function ReservationForm({
  reservationDate,
  times = [],
  dateField,
  onSubmit,
  submitting,
  error,
}) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const reservationTime = times.includes(selectedTime)
    ? selectedTime
    : (times[0] ?? "");

  async function handleSubmit(e) {
    e.preventDefault();
    const values = {
      guest_name: guestName,
      guest_phone: guestPhone,
      party_size: partySize,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
    };
    const errors = validateReservation(values);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {dateField}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guest-name">Nome</Label>
        <Input
          id="guest-name"
          placeholder="Seu nome"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          aria-invalid={!!fieldErrors.guest_name}
        />
        {fieldErrors.guest_name ? (
          <p className="text-[12px] text-destructive">
            {fieldErrors.guest_name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guest-phone">Celular</Label>
        <Input
          id="guest-phone"
          type="tel"
          inputMode="tel"
          placeholder="(51) 99999-9999"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          aria-invalid={!!fieldErrors.guest_phone}
        />
        {fieldErrors.guest_phone ? (
          <p className="text-[12px] text-destructive">
            {fieldErrors.guest_phone}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="party-size">Número de pessoas</Label>
        <Input
          id="party-size"
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="2"
          value={partySize}
          onChange={(e) => setPartySize(e.target.value)}
          className="font-mono"
          aria-invalid={!!fieldErrors.party_size}
        />
        {fieldErrors.party_size ? (
          <p className="text-[12px] text-destructive">
            {fieldErrors.party_size}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Horário</Label>
        <div className="flex flex-wrap gap-2">
          {times.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTime(t)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[14px] transition-colors",
                t === reservationTime
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-sunken text-foreground hover:border-primary/50",
              )}
            >
              {formatTime(t)}
            </button>
          ))}
        </div>
        {fieldErrors.reservation_time ? (
          <p className="text-[12px] text-destructive">
            {fieldErrors.reservation_time}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">
          <p>{error.message}</p>
          {error.action ? (
            <p className="mt-0.5 text-destructive/80">{error.action}</p>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        className="mt-1 h-[52px] w-full rounded-xl text-[15px] font-bold tracking-[0.02em] uppercase hover:bg-primary/90"
        disabled={submitting}
      >
        {submitting ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}

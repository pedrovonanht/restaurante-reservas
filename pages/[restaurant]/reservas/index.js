import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { PublicShell, NEUTRAL_VARS } from "components/public/public-shell";
import { ReservationForm } from "components/public/reservation-form";
import { ReservationSuccess } from "components/public/reservation-success";
import { EmptyState, ErrorState } from "components/common/state-views";
import { Label } from "components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "components/ui/select";
import { useQuery } from "hooks/use-query";
import { useMutation } from "hooks/use-mutation";
import { events as eventsApi, reservations as reservationsApi } from "lib/api";
import {
  formatDayMonth,
  titleFromSlug,
  todayISO,
  weekdayLabel,
} from "lib/format";

export default function ReservaGenericaPage() {
  const router = useRouter();
  const { restaurant } = router.query;
  const ready = !!restaurant;

  const {
    data,
    loading,
    error: loadError,
    refetch,
  } = useQuery(() => eventsApi.list(restaurant), [restaurant], {
    enabled: ready,
  });

  const upcoming = useMemo(() => {
    const today = todayISO();
    return (data || [])
      .filter((ev) => ev.event_date >= today)
      .sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [data]);

  // Data selecionada manualmente pelo convidado; sem seleção, cai na primeira
  // data disponível (derivado no render, sem efeito).
  const [selectedDate, setSelectedDate] = useState(null);
  const reservationDate = selectedDate ?? upcoming[0]?.event_date ?? "";
  const selectedEvent = upcoming.find(
    (ev) => ev.event_date === reservationDate,
  );

  const [result, setResult] = useState(null);
  const {
    mutate,
    loading: submitting,
    error: submitError,
  } = useMutation((input) => reservationsApi.create(restaurant, input));

  async function handleSubmit(values) {
    try {
      const created = await mutate({
        reservation_date: reservationDate,
        reservation_time: values.reservation_time,
        party_size: values.party_size,
        guest_name: values.guest_name,
        guest_phone: values.guest_phone,
      });
      setResult({
        guest_name: values.guest_name,
        party_size: values.party_size,
        reservation_date: reservationDate,
        reservation_time: values.reservation_time,
        public_token: created.public_token,
      });
    } catch {
      /* erro exibido abaixo via `submitError` */
    }
  }

  if (!ready || loading) {
    return (
      <PublicShell>
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell subtitle={`no restaurante ${titleFromSlug(restaurant)}`}>
      {loadError ? (
        <ErrorState error={loadError} onRetry={refetch} />
      ) : result ? (
        <ReservationSuccess reservation={result} restaurant={restaurant} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          title="Nenhuma data disponível"
          description="No momento não há eventos abertos para reserva."
        />
      ) : (
        <ReservationForm
          reservationDate={reservationDate}
          times={selectedEvent?.event_times ?? []}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={submitError}
          dateField={
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reservation-date">Data</Label>
              <Select value={reservationDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="reservation-date">
                  <SelectValue placeholder="Selecione uma data">
                    {selectedEvent
                      ? `${weekdayLabel(selectedEvent.event_date)} (${formatDayMonth(selectedEvent.event_date)})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent style={NEUTRAL_VARS}>
                  {upcoming.map((ev) => (
                    <SelectItem key={ev.event_date} value={ev.event_date}>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span>
                          {weekdayLabel(ev.event_date)} (
                          {formatDayMonth(ev.event_date)})
                        </span>
                        <span className="ml-3 truncate text-muted-foreground">
                          {ev.name}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}
    </PublicShell>
  );
}

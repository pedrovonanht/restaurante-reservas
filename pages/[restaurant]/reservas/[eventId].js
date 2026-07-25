import { useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { PublicShell } from "components/public/public-shell";
import { ReservationForm } from "components/public/reservation-form";
import { ReservationSuccess } from "components/public/reservation-success";
import { ErrorState } from "components/common/state-views";
import { useQuery } from "hooks/use-query";
import { useMutation } from "hooks/use-mutation";
import { events as eventsApi, reservations as reservationsApi } from "lib/api";
import { formatDayMonth } from "lib/format";

export default function ReservaEventoEspecificoPage() {
  const router = useRouter();
  const { restaurant, eventId } = router.query;
  const ready = !!restaurant && !!eventId;

  const {
    data: event,
    loading,
    error: loadError,
    refetch,
  } = useQuery(
    () => eventsApi.get(restaurant, eventId),
    [restaurant, eventId],
    {
      enabled: ready,
    },
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
        reservation_date: event.event_date,
        reservation_time: values.reservation_time,
        party_size: values.party_size,
        guest_name: values.guest_name,
        guest_phone: values.guest_phone,
      });
      setResult({
        guest_name: values.guest_name,
        party_size: values.party_size,
        reservation_date: event.event_date,
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

  if (loadError) {
    return (
      <PublicShell>
        <ErrorState error={loadError} onRetry={refetch} />
      </PublicShell>
    );
  }

  return (
    <PublicShell
      subtitle={`para a ${event.name} ${formatDayMonth(event.event_date)}`}
    >
      {result ? (
        <ReservationSuccess reservation={result} restaurant={restaurant} />
      ) : (
        <ReservationForm
          reservationDate={event.event_date}
          times={event.event_times}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={submitError}
        />
      )}
    </PublicShell>
  );
}

import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import { PublicShell } from "components/public/public-shell";
import { Card } from "components/ui/card";
import { ErrorState } from "components/common/state-views";
import { useQuery } from "hooks/use-query";
import { reservations as reservationsApi } from "lib/api";
import { formatTime } from "lib/format";

export default function ConsultaReservaPage() {
  const router = useRouter();
  const { restaurant, token } = router.query;
  const ready = !!restaurant && !!token;

  const { data, loading, error, refetch } = useQuery(
    () => reservationsApi.getByToken(restaurant, token),
    [restaurant, token],
    {
      enabled: ready,
    },
  );

  return (
    <PublicShell title="Sua reserva">
      {!ready || loading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card className="p-4">
          <dl className="flex flex-col gap-2 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-semibold text-foreground">
                {data.guest_name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Horário</dt>
              <dd className="font-display font-medium text-foreground">
                {formatTime(data.reservation_time)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Pessoas</dt>
              <dd className="font-display font-medium text-foreground">
                {data.party_size}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </PublicShell>
  );
}

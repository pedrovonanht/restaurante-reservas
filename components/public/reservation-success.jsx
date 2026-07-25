import Link from "next/link";
import { Check } from "lucide-react";

import { Card } from "components/ui/card";
import { formatDayMonth, formatTime } from "lib/format";

// Cartão de confirmação exibido após o POST público. `reservation` é montado a
// partir dos valores enviados pelo convidado + `public_token` retornado pela API
// (o schema `ReservationCreated` não ecoa `reservation_date`, por isso o valor
// vem do formulário, não da resposta).
export function ReservationSuccess({ reservation, restaurant }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 py-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-tint text-success">
        <Check className="size-7" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Reserva confirmada
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Guarde o link abaixo para consultar sua reserva depois.
        </p>
      </div>

      <Card className="w-full p-4 text-left">
        <dl className="flex flex-col gap-2 text-[14px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Nome</dt>
            <dd className="font-semibold text-foreground">
              {reservation.guest_name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Data</dt>
            <dd className="font-mono text-foreground">
              {formatDayMonth(reservation.reservation_date)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Horário</dt>
            <dd className="font-mono text-foreground">
              {formatTime(reservation.reservation_time)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Pessoas</dt>
            <dd className="font-mono text-foreground">
              {reservation.party_size}
            </dd>
          </div>
        </dl>
      </Card>

      <Link
        href={`/${restaurant}/reservas/consulta/${reservation.public_token}`}
        className="text-[13px] font-semibold text-primary underline-offset-4 hover:underline"
      >
        Ver minha reserva
      </Link>
    </div>
  );
}

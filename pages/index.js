import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 font-sans">
      {/* Glow de fundo */}
      <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div class="z-1 flex flex-col justify-center items-center w-120 gap-2">
        <Badge
          variant="outline"
          className=" bg-orange-400/50 text-neutral-100 text-md px-4 py-2 border-orange-300"
        >
          Em breve
        </Badge>
        <strong className="text-9xl ">🍽️</strong>
        <h1 className="text-3xl text-amber-50 z-1 font-mono tracking-tight font-bold">
          Serviço em construção
        </h1>
        <p className="text-neutral-100 text-base leading-relaxed text-center">
          Estamos construindo uma plataforma para restaurantes gerenciarem
          reservas e vouchers com facilidade. Em breve por aqui.
        </p>
      </div>
    </div>
  );
}

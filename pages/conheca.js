import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Layers,
  Link2,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TriangleAlert,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

import {
  GuestFormScreen,
  OwnerEventScreen,
  OwnerReservationsScreen,
} from "components/landing/app-screens";
import { Logo } from "components/landing/logo";
import { PhoneFrame } from "components/landing/phone-frame";
import { Card } from "components/ui/card";
import { cn } from "lib/utils";
import { waLink } from "lib/whatsapp";

// Preencha com o WhatsApp comercial (com DDD) para ativar o botão de contato.
// Vazio = o botão "Falar com a gente" não aparece.
const CONTACT_WHATSAPP = "";
const CONTACT_MESSAGE =
  "Olá! Vi o Flamba e quero levar as reservas online para o meu restaurante.";

const contactHref = CONTACT_WHATSAPP
  ? waLink(CONTACT_WHATSAPP, CONTACT_MESSAGE)
  : null;

const ctaPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90";
const ctaOutline =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-[15px] font-bold text-foreground transition-colors hover:border-primary/40";

function Eyebrow({ children, className }) {
  return (
    <p
      className={cn(
        "text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function SectionTitle({ eyebrow, title, description, center }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em] text-foreground sm:text-[40px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function IconBadge({ icon: Icon, tone = "accent" }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        tone === "accent" && "bg-accent-soft text-primary",
        tone === "danger" && "bg-danger-tint text-destructive",
        tone === "success" && "bg-success-tint text-success",
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-[14px] font-semibold text-ink-soft md:flex">
          <a href="#problema" className="hover:text-foreground">
            O problema
          </a>
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <a href="#beneficios" className="hover:text-foreground">
            Benefícios
          </a>
          <a href="#perguntas" className="hover:text-foreground">
            Perguntas
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg px-3 text-[14px] font-semibold text-ink-soft hover:text-foreground sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[14px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Testar a demo
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold text-ink-soft">
            <Sparkles className="size-3.5 text-primary" />
            Reservas online para restaurantes
          </span>
          <h1 className="mt-5 font-display text-[40px] leading-[1.02] font-bold tracking-[-0.035em] text-foreground sm:text-[56px]">
            Salão cheio, zero overbooking e menos horas no WhatsApp.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            O Flamba transforma suas reservas em um link. O cliente reserva
            sozinho em quatro campos, o sistema escolhe a mesa certa e sua
            equipe acompanha tudo pelo celular. Você para de responder mensagem
            e volta a cuidar do salão.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className={ctaPrimary}>
              Testar a demo agora <ArrowRight className="size-4" />
            </Link>
            <a href="#como-funciona" className={ctaOutline}>
              Ver como funciona
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium text-ink-soft">
            {[
              "Cliente não baixa app",
              "Reserva sem cadastro",
              "Painel 100% no celular",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-success" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft/80 blur-3xl"
          />
          <div className="relative flex items-start">
            <PhoneFrame
              label="Tela do cliente fazendo a reserva pelo link"
              className="hidden -rotate-[4deg] sm:block"
            >
              <GuestFormScreen />
            </PhoneFrame>
            <PhoneFrame
              label="Painel do restaurante mostrando a ocupação do evento"
              className="z-10 sm:mt-16 sm:-ml-20 sm:rotate-[3deg]"
            > 
            
              <OwnerEventScreen />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROBLEMS = [
  {
    icon: TriangleAlert,
    title: "Overbooking",
    text: "Na correria, alguém confirma mais reservas do que o salão comporta. O cliente chega e não tem mesa.",
  },
  {
    icon: Clock,
    title: "Horas respondendo mensagem",
    text: "Cada reserva é uma conversa: data, horário, quantas pessoas, confirmação. Multiplique pelo fim de semana.",
  },
  {
    icon: Megaphone,
    title: "Não escala com anúncios",
    text: "Quando a campanha funciona e chegam 200 mensagens, o atendimento manual vira um gargalo.",
  },
  {
    icon: UserX,
    title: "Cliente desiste no meio",
    text: "Se a resposta demora, o cliente reserva em outro lugar. Cada etapa a mais é uma reserva perdida.",
  },
];

function Problem() {
  return (
    <section id="problema" className="scroll-mt-16 bg-card py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="O problema"
          title="Reserva pelo WhatsApp custa mais caro do que parece."
          description="Mensagem por mensagem, mesa por mesa, numa planilha ou de cabeça. Funciona enquanto o movimento é pequeno. Quando o restaurante cresce, o mesmo processo começa a custar mesas vazias e clientes frustrados."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <Card key={p.title} className="p-5">
              <IconBadge icon={p.icon} tone="danger" />
              <h3 className="mt-4 font-display text-[17px] font-bold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {p.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Layers,
    title: "Cadastre suas mesas",
    text: "Uma vez só. Informe o nome e quantas pessoas cada mesa comporta.",
  },
  {
    icon: CalendarDays,
    title: "Crie a data",
    text: "Escolha o dia e os horários. Tem noite fixa toda semana? Salve uma predefinição e crie em segundos.",
  },
  {
    icon: Link2,
    title: "Compartilhe o link",
    text: "Coloque na bio do Instagram, no status do WhatsApp ou nos seus anúncios.",
  },
  {
    icon: BellRing,
    title: "Receba reservas prontas",
    text: "Cada reserva chega com a mesa já alocada e o contato do cliente a um toque.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Como funciona"
          title="Do cadastro à primeira reserva em minutos."
          description="Nada de instalação, treinamento longo ou computador no balcão. Tudo funciona pelo navegador do celular."
          center
        />
        <ol className="mt-14 grid gap-8 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-[16px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 bg-border md:block"
                  />
                ) : null}
              </div>
              <h3 className="mt-5 flex items-center gap-2 font-display text-[18px] font-bold text-foreground">
                <s.icon className="size-[18px] text-primary" />
                {s.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const MATCH_TABLES = [
  { name: "Mesa 1", range: "1–2", fits: false },
  { name: "Mesa 3", range: "2–4", fits: true, chosen: true },
  { name: "Mesa 6", range: "4–6", fits: true },
  { name: "Varanda", range: "6–10", fits: false },
];

function SmartAllocation() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <Eyebrow className="text-white/60">Alocação inteligente</Eyebrow>
          <h2 className="mt-3 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-[40px]">
            A mesa certa para cada grupo, automaticamente.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/75">
            O Flamba olha só para as mesas livres que comportam o grupo e
            escolhe a de menor capacidade. Um casal não ocupa a mesa de seis. As
            mesas grandes ficam livres para os grupos grandes e cabe mais gente
            no salão na mesma noite.
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-[15px] text-white/85">
            {[
              "Nunca aceita mais reservas do que o salão comporta",
              "Mesas desativadas ficam fora do cálculo",
              "Se não houver mesa, o cliente é avisado na hora",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[#7fd1ae]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="text-[13px] text-white/60">Nova reserva</p>
          <p className="mt-1 font-display text-[22px] font-bold">
            Família Oliveira · 3 pessoas
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MATCH_TABLES.map((t) => (
              <div
                key={t.name}
                className={cn(
                  "rounded-xl border p-3 text-center transition-colors",
                  t.chosen
                    ? "border-[#7fd1ae] bg-[#7fd1ae]/15"
                    : t.fits
                      ? "border-white/25"
                      : "border-white/10 opacity-45",
                )}
              >
                <p className="font-display text-[15px] font-bold">{t.name}</p>
                <p className="mt-1 flex items-center justify-center gap-1 font-display text-[13px] text-white/70">
                  <Users className="size-3.5" /> {t.range}
                </p>
                <p className="mt-2 text-[11px] font-extrabold tracking-[0.12em] uppercase">
                  {t.chosen ? (
                    <span className="text-[#7fd1ae]">escolhida</span>
                  ) : t.fits ? (
                    <span className="text-white/60">cabe</span>
                  ) : (
                    <span className="text-white/50">não cabe</span>
                  )}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[14px] leading-relaxed text-white/70">
            A Mesa 6 também comporta o grupo, mas fica reservada para quem
            realmente precisa dela.
          </p>
        </div>
      </div>
    </section>
  );
}

const OWNER_BENEFITS = [
  {
    icon: CalendarDays,
    title: "Ocupação de cada noite",
    text: "Quantas reservas, quantas pessoas e quantas mesas ainda estão livres.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp a um toque",
    text: "Precisa confirmar algo? Abra a conversa com o cliente direto da reserva.",
  },
  {
    icon: Search,
    title: "Encontre qualquer reserva",
    text: "Busque por nome, mesa ou telefone quando o cliente chegar na porta.",
  },
  {
    icon: UserPlus,
    title: "Toda a equipe no mesmo painel",
    text: "Dono e equipe com acesso próprio, cada um no seu celular.",
  },
  {
    icon: Building2,
    title: "Mais de uma unidade",
    text: "Gerencie vários restaurantes na mesma conta e troque entre eles em um toque.",
  },
  {
    icon: Sparkles,
    title: "Predefinições de evento",
    text: "Salve o formato das noites recorrentes e pare de digitar os mesmos horários.",
  },
];

const GUEST_BENEFITS = [
  "Reserva em quatro campos: nome, celular, pessoas e horário",
  "Sem baixar aplicativo e sem criar conta",
  "Confirmação na hora, com link para consultar a reserva",
  "Página neutra, que combina com a identidade do seu restaurante",
];

function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Benefícios"
          title="Feito para quem vive o salão."
          description="Pensado para a rotina real de um restaurante: rápido de consultar no meio do serviço e simples para qualquer pessoa da equipe."
        />

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {OWNER_BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-4">
                <IconBadge icon={b.icon} />
                <div>
                  <h3 className="font-display text-[17px] font-bold text-foreground">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                    {b.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <PhoneFrame label="Lista de reservas do painel do restaurante">
              <OwnerReservationsScreen />
            </PhoneFrame>
          </div>
        </div>

        <Card className="mt-16 grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <IconBadge icon={Smartphone} tone="success" />
            <h3 className="mt-4 font-display text-[24px] leading-tight font-bold tracking-[-0.02em] text-foreground">
              E para o seu cliente, reservar fica fácil.
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Quanto menos atrito, mais reservas. O cliente abre o link, escolhe
              o horário e pronto. Não precisa esperar ninguém responder.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {GUEST_BENEFITS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-alt px-4 py-3 text-[15px] text-foreground"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

function Origin() {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-center">
        <div>
          <Eyebrow>Nascido no salão</Eyebrow>
          <h2 className="mt-3 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em] text-foreground sm:text-[36px]">
            Criado junto com um restaurante de verdade.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
            O Flamba foi desenvolvido em parceria com o Neptunia Restaurante, a
            partir de um problema que eles tinham todo fim de semana: reservas
            demais pelo WhatsApp e mesas alocadas na mão. Cada tela foi pensada
            para o ritmo de quem está atendendo, não para quem está num
            escritório.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: ShieldCheck,
              title: "Seguro",
              text: "Senhas criptografadas e sessões protegidas para a sua equipe.",
            },
            {
              icon: Check,
              title: "Confiável",
              text: "Testes automatizados nos fluxos principais a cada atualização.",
            },
            {
              icon: Smartphone,
              title: "Mobile-first",
              text: "Desenhado primeiro para o celular, que é onde o salão acontece.",
            },
            {
              icon: Users,
              title: "Sem cadastro para o cliente",
              text: "O cliente só precisa do link. Não cria conta e não decora senha.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-surface-alt p-5"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-display text-[16px] font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Meu cliente precisa baixar algum aplicativo?",
    a: "Não. A reserva acontece numa página que abre direto do link, no navegador do celular. O cliente também não precisa criar conta.",
  },
  {
    q: "E se não houver mais mesa disponível?",
    a: "O sistema recusa a reserva na hora e avisa o cliente para tentar outra data. Ele nunca aceita mais reservas do que o seu salão comporta.",
  },
  {
    q: "Funciona para eventos e noites especiais?",
    a: "Sim. Cada data é um evento com os próprios horários. Para noites recorrentes, salve uma predefinição e crie a próxima em segundos.",
  },
  {
    q: "Posso tirar uma mesa da reserva online?",
    a: "Pode. Desative a mesa e ela sai da alocação automática. Útil para mesas reservadas para a casa ou para clientes que chegam sem reserva.",
  },
  {
    q: "Preciso de computador no restaurante?",
    a: "Não. O painel foi feito para o celular. Você cria eventos, acompanha a ocupação e fala com os clientes de qualquer lugar.",
  },
  {
    q: "Tenho mais de uma unidade. Funciona?",
    a: "Funciona. Uma mesma conta gerencia vários restaurantes, cada um com suas mesas, eventos e link de reserva.",
  },
];

function Faq() {
  return (
    <section id="perguntas" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitle
          eyebrow="Perguntas frequentes"
          title="Dúvidas comuns"
          center
        />
        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border bg-card px-5 py-4 open:border-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[16px] font-bold text-foreground [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[16px] text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <h2 className="mx-auto max-w-2xl font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-[42px]">
          Veja o Flamba funcionando agora.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-primary-foreground/80">
          Faça uma reserva como cliente e veja ela chegar no painel do
          restaurante, com a mesa já escolhida. Não precisa de login.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-bold text-primary transition-colors hover:bg-white/90"
          >
            Abrir a demo interativa <ArrowRight className="size-4" />
          </Link>
          {contactHref ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle className="size-4" /> Falar com a gente
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-[13px] text-muted-foreground sm:flex-row">
        <Logo />
        <p>Reservas online para restaurantes.</p>
        <div className="flex gap-5 font-semibold">
          <Link href="/demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function ConhecaPage() {
  return (
    <>
      <Head>
        <link rel="icon" href="/flamba-icon.png" />
        <title>Flamba · Reservas online para restaurantes</title>
        <meta
          name="description"
          content="Transforme suas reservas em um link. O cliente reserva sozinho, o Flamba escolhe a mesa certa e sua equipe acompanha tudo pelo celular."
        />
        <meta
          property="og:title"
          content="Flamba · Reservas online para restaurantes"
        />
        <meta
          property="og:description"
          content="Salão cheio, zero overbooking e menos horas no WhatsApp."
        />
      </Head>
      <div className="min-h-[100dvh] bg-canvas">
        <Nav />
        <main>
          <Hero />
          <Problem />
          <HowItWorks />
          <SmartAllocation />
          <Benefits />
          <Origin />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}

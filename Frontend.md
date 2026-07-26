# CLAUDE.md — Client web do SaaS de Reservas

Handoff para operar e continuar criando o **client** deste repositório. Leia antes de mexer no frontend.

## O que é

SaaS de reservas para restaurantes. O repo tem duas partes:

- **API** (já pronta): Next.js Pages Router em `pages/api/v1/**`, modelos em `models/`, infra/migrations em `infra/`.
- **Client** (o que evoluímos aqui): React mobile-first, mesmo app Next.js. Duas superfícies:
  - **Painel do dono** (autenticado) — gerenciar eventos, predefinições, reservas.
  - **Páginas públicas do convidado** — criar/consultar reserva, sem login.

## Regras do "modo frontend"

> Estas regras valem **quando o trabalho é desenvolver o client**. Não são proibições absolutas do repo —
> se o usuário pedir para mexer na API, aí sim.

- **Não alterar a API** (`pages/api/**`, `models/**`, `infra/**`, migrations) nem `openapi.json`
  **a menos que o usuário autorize explicitamente**. `openapi.json` é a **fonte da verdade** dos contratos —
  leia-o para entender request/response. Se faltar um dado que o client precisa, **sinalize ao usuário**
  (ele mesmo estende a API) em vez de mudar por conta própria.
- **JavaScript puro** — sem TypeScript.
- **Imports bare-path** resolvidos por `jsconfig.json` (`baseUrl:"."`): `import { cn } from "lib/utils"`,
  `import { Button } from "components/ui/button"`. **Nunca** use o alias `@/` (não existe no jsconfig; quebra o build).
- **Zero dependências novas** — resolva com o que já existe.
- **Prettier**: formate **apenas os arquivos que você criou/editou** (nunca rode `prettier --write .`, que
  reformataria `pages/api/**`). Ex.: `npx prettier --write components/... pages/eventos/...`.

## Stack

- **Next.js 16 + React 19**, Pages Router.
- **Tailwind v4 CSS-first** (sem `tailwind.config.js`): tokens em `pages/styles/globals.css` (oklch, bloco
  `@theme inline` + `:root`). Cores extras do design: `--primary` (azul de marca), `--success`, `--ink`,
  `--canvas`, `--sunken`, `--font-mono`.
- **Primitivos shadcn escritos à mão** em `components/ui/*` — padrão: `cva` + pacote unificado `radix-ui`
  (`import { Slot } from "radix-ui"`) + `cn` de `lib/utils` + atributo `data-slot`. Veja `components/ui/button.jsx`
  como referência. **Não** use `npx shadcn add` (geraria imports `@/` quebrados).
- **lucide-react** para ícones. Fontes (Plus Jakarta Sans + IBM Plex Mono) via `next/font` em `lib/fonts.js`,
  aplicadas no `<Html>` de `pages/_document.js`.

## Rodar & verificar

- **Dev**: `npm run dev` — sobe Postgres via Docker + migrations + `next dev`. Requer Docker no devcontainer.
- **Antes de terminar qualquer mudança**, rode nesta ordem:
  1. `npx eslint components lib hooks context pages`
  2. `npx prettier --write <arquivos que você tocou>`
  3. `npx next build`
- **Atenção ESLint (regras do React 19)**: reprova `react-hooks/set-state-in-effect` e escrita de ref durante
  o render. Em data-fetching/hidratação legítima, use `// eslint-disable-next-line react-hooks/set-state-in-effect`
  pontual (exemplos: `hooks/use-query.js`, `pages/eventos/[id]/editar.js`). **`next build` falha se o ESLint falhar.**
- O aviso de `outputFileTracingIncludes` no `next.config.mjs` é **pré-existente** (config do usuário) — não "consertar".

## Arquitetura (caminhos)

- **Dados** — `lib/api.js`: `apiFetch(path, opts)` prefixa `/api/v1`, manda `credentials:"include"`, e lança
  `ApiError` normalizando `{name, message, action, status_code}`. Grupos: `auth`, `restaurants`, `events`,
  `presets`, `reservations`. ⚠️ As **rotas públicas de reserva ficam fora de `/restaurants`**:
  `reservations.create`/`getByToken` batem em `/${slug}/reservations`.
- **Fetch/mutação** — `hooks/use-query.js`: `useQuery(fetcher, deps, { enabled })` → `{data, error, loading, refetch}`.
  Coloque `slug`/`id` nas `deps` (refaz a busca ao mudar) e use `enabled` para segurar até ter o slug.
  `hooks/use-mutation.js`: `useMutation(fn)` → `{mutate, loading, error}`.
- **Estado global** — `context/auth-context.jsx` (`useAuth`) + `context/tenant-context.jsx` (`useTenant`),
  ambos providers em `pages/_app.js`. O **tenant (slug do restaurante) é persistido em `localStorage`**.
- **Layout painel** — `components/layout/app-shell.jsx`: gate de auth (sem sessão → redireciona `/login`),
  sem tenant → tela "produto em fase de testes", coluna central mobile + `bottom-nav`. Header de voltar:
  `back-header.jsx` (aceita prop `right`). Troca de restaurante: `tenant-switcher.jsx`.
- **Layout público** — `components/public/public-shell.jsx`: **neutraliza a cor de marca** sobrescrevendo
  `--primary`/`--ring` para ink via `NEUTRAL_VARS` (para não destoar da marca de nenhum restaurante); sem
  auth/nav. Componentes portais (ex.: `Select`) precisam receber `style={NEUTRAL_VARS}` no content, pois o
  portal renderiza fora da árvore do shell.
- **Utilitários** — `lib/format.js` (datas/horas pt-BR, `occupancyPercent`, ranges de filtro), `lib/validate.js`
  (validadores retornam `{campo:"msg"}`; use com `hasErrors`), `lib/whatsapp.js` (`waLink`, `normalizePhone`).

## Fatos de domínio/API que o client assume

- **Auth** = cookie httpOnly `session_id` (same-origin → enviado sozinho; `credentials:"include"` por garantia).
- **Multi-tenant por slug** de restaurante; quase todo endpoint é escopado ao slug.
- `events.list(slug)` e `events.get(slug,id)` são **públicos para anônimos** (retornam `EventPublic
  {name, event_date, event_times}`, só eventos **ativos**); membros recebem `Event` completo com
  **`ocupation {reservations, capacity, people}`** — presente **só nos GET**, **ausente em POST/PATCH**.
- `reservations.listOwner(slug, {from,to})` (dono, filtra por intervalo de data do evento).
- Reserva pública: `reservations.create(slug, input)` — **`reservation_time` é obrigatório**; erros comuns:
  404 (sem evento na data), 409 (telefone duplicado), 422 (sem vaga / data no passado). `reservations.getByToken`.
- **Criação de restaurante é bloqueada de propósito na UI** (admin cria manualmente até existir billing).
  `components/restaurants/restaurant-form.jsx` e `validateRestaurant` seguem no repo para reuso futuro.

## Padrões ao adicionar features

- **Formulário**: estado controlado + `validate*` (de `lib/validate.js`) + `useMutation`. Referência:
  `pages/eventos/novo.js`.
- **Estados de tela**: `components/common/state-views.jsx` — `CardListSkeleton` (loading), `EmptyState`,
  `ErrorState` (mostra `error.message` + `error.action`).
- **Rotas dinâmicas**: `router.query` chega vazio no 1º render; derive `ready = !!slug && !!id` e guarde com
  `!ready || loading` antes de acessar `data.campo`. O `useQuery` já expõe `loading` coerente nesse frame.

## Rotas atuais

- **Painel (autenticado)**: `/`, `/eventos`, `/eventos/novo`, `/eventos/[id]` (+ `/eventos/[id]/editar`),
  `/eventos/predefinicoes/nova`, `/configuracoes`, `/login`, `/register`.
- **Público (convidado)**: `/[restaurant]/reservas` (genérica — escolhe a data), `/[restaurant]/reservas/[eventId]`
  (evento fixo), `/[restaurant]/reservas/consulta/[token]` (consulta por token).

## Pendências conhecidas

- Dark mode não desenhado (tema claro only).
- UI de listar/editar/excluir predefinições (hoje só cria).
- Nome real do restaurante nas páginas públicas — derivado do slug (`titleFromSlug`), pois não há endpoint
  público que retorne o nome.

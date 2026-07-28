# Design System — Tablefy

Especificação do design system aplicado ao client (painel do dono + páginas públicas de
reserva). Fonte de design: Figma, arquivo "PROJETO-TABLEFY", node `4-1119` ("final design
system"). A implementação viva fica em `pages/styles/globals.css` (tokens),
`lib/fonts.js`/`pages/_document.js` (fontes) e `components/ui/*` (primitivos) — em caso de
dúvida, esses arquivos são a fonte da verdade corrente; este documento descreve a intenção
por trás deles para orientar novas telas e componentes.

## Regra de ouro

**Cor nunca colore texto de conteúdo.** Títulos e nomes são sempre tinta (ink), nunca azul
ou verde. O azul (`accent`) aparece só em botões, ícones ativos e chips selecionados. O
verde (`success`) só comunica estado (ativo, ocupado, confirmado). Âmbar e vermelho são
avisos/estados destrutivos, nunca decoração.

## Cores

Fundo quente (areia), ação em azul-noite, estado em verde.

| Papel                 | Token DS        | Hex       | CSS var (`globals.css`)                      | Utilitário Tailwind                       | Uso                                              |
| --------------------- | --------------- | --------- | -------------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| Areia · fundo         | tf-bg           | `#F5F0E6` | `--canvas`, `--muted`                        | `bg-canvas`, `bg-muted`                   | Fundo da coluna externa do app (wrapper)         |
| Superfície            | tf-surface      | `#FFFFFF` | `--card`, `--popover`                        | `bg-card`, `bg-popover`                   | Cartões, inputs, popovers, sheets                |
| Superfície alt.       | tf-surface-alt  | `#FBF7EF` | `--background`, `--surface-alt`              | `bg-background`, `bg-surface-alt`         | Coluna central do app (mobile), bottom nav       |
| Borda                 | tf-border       | `#E6DFD0` | `--border`, `--input`                        | `border-border`, `border-input`           | Bordas de cartões/inputs                         |
| Borda suave           | tf-border-soft  | `#EFE8DA` | `--border-soft`                              | `border-border-soft`, `bg-border-soft`    | Divisores discretos, trilho do progress          |
| Tinta · títulos       | tf-ink          | `#16203A` | `--foreground`, `--ink`, `--card-foreground` | `text-foreground`, `text-ink`             | Títulos, nomes, texto principal                  |
| Corpo                 | tf-body         | `#4E4A43` | `--ink-soft`                                 | `text-ink-soft`                           | Texto de corpo secundário                        |
| Metadado              | tf-muted        | `#6E6A61` | `--muted-foreground`                         | `text-muted-foreground`                   | Datas, contadores, legendas                      |
| Rótulo · placeholder  | tf-faint        | `#8C877C` | (uso pontual via `text-muted-foreground`)    | —                                         | Placeholders, rótulos discretos                  |
| Azul-noite · ação     | tf-accent       | `#1B3A8F` | `--primary`, `--ring`                        | `bg-primary`, `text-primary`, `ring-ring` | Botão primário, ícones ativos, foco              |
| Azul suave            | tf-accent-soft  | `#E5E9F4` | `--secondary`, `--accent-soft`               | `bg-secondary`, `bg-accent-soft`          | Botão "Suave", chips de horário, avatar          |
| Verde · sucesso       | tf-success      | `#1F6A4F` | `--success`                                  | `bg-success`, `text-success`              | Badge "ativa", switch ligado, progress, WhatsApp |
| Verde suave           | tf-success-soft | `#E3EFE7` | `--success-tint`                             | `bg-success-tint`, `text-success`         | Fundo de badge/estado de sucesso                 |
| Âmbar · atenção       | tf-warning      | `#A9631A` | `--warning`                                  | `bg-warning`, `text-warning`              | Badge "encerrada"                                |
| Âmbar suave           | tf-warning-soft | `#F7EBDB` | `--warning-tint`                             | `bg-warning-tint`, `text-warning`         | Fundo de badge de atenção                        |
| Vermelho · destrutivo | tf-danger       | `#A32B22` | `--destructive`                              | `bg-destructive`, `text-destructive`      | Erros, ações destrutivas                         |
| Vermelho suave        | tf-danger-soft  | `#F7E2E0` | `--danger-tint`                              | `bg-danger-tint`                          | Fundo de erro/badge destrutivo                   |

**Páginas públicas de reserva** (`components/public/public-shell.jsx`, `NEUTRAL_VARS`):
sobrescrevem `--primary`/`--secondary`/`--accent-soft`/`--ring` para tons de ink (`#16203A`
/ `#EFE8DA`), mantendo a ação **neutra** — nenhum restaurante deve ver a marca Tablefy (azul)
nas telas do próprio convidado. Tipografia e superfícies do DS se aplicam normalmente.

Dark mode: fora de escopo do DS atual (o bloco `.dark` em `globals.css` mantém a paleta
shadcn neutra antiga, não a paleta Tablefy).

## Tipografia

**Space Grotesk** para nomes e números (display), **Manrope** para o resto (UI/corpo).
Ambas via `next/font/google` em `lib/fonts.js`: `fontSans` → `--font-sans` (Manrope),
`fontDisplay` → `--font-display` (Space Grotesk). `--font-mono` é redirecionado para
`--font-display` (não há fonte mono própria no DS — números usam a display).

> ⚠️ **Nota sobre o Figma**: a amostra visual do frame do DS mostra pesos "light" nos
> textos por um bug do arquivo. **Seguir a descrição textual dos papéis abaixo (700/800),
> não a renderização do exemplo.**

| Papel              | Fonte / peso      | Tamanho/linha | Tracking        | Utilitário sugerido                                               |
| ------------------ | ----------------- | ------------- | --------------- | ----------------------------------------------------------------- |
| Display            | Space Grotesk 700 | 30/33         | -3%             | `font-display text-[30px] font-bold tracking-[-0.03em]`           |
| Título de tela     | Space Grotesk 700 | 20/25         | -2%             | `font-display text-[20px] font-bold tracking-[-0.02em]`           |
| Título de cartão   | Space Grotesk 700 | 16/19         | —               | `font-display text-base font-bold` (usado em `CardTitle`)         |
| Label de campo     | Manrope 800       | 14/17         | —               | `text-[14px] font-extrabold` (usado em `components/ui/label.jsx`) |
| Corpo              | Manrope 400       | 14/22         | —               | `text-[14px] font-normal`                                         |
| Metadado           | Manrope 500       | 12/16         | —               | `text-[12px] font-medium text-muted-foreground`                   |
| Rótulo (uppercase) | Manrope 800       | 10–11         | +14% caixa alta | `text-[11px] font-extrabold tracking-[0.14em] uppercase`          |

Regra: nada abaixo de 12px, exceto rótulos maiúsculos (11px) com tracking alargado.

## Forma, espaço e elevação

- **Raio**: chips/pills `6px` (`--radius-sm`) · botões/inputs/cartões `8px`
  (`--radius-md`/`--radius-lg`, base `--radius: 0.5rem`) · folhas/modais/popovers `12px`
  (`--radius-xl`/`--radius-2xl`).
- **Espaço**: escala de 4 — `4 · 8 · 12 · 16 · 20 · 24 · 32`px. Margem lateral de tela:
  `16px` (`px-4`/`px-5` conforme o container).
- **Elevação** (quase nenhuma sombra):
  - Card: `0 1px 2px rgba(22,32,58,.04)` → var `--shadow-card`, aplicada em `Card`.
  - Sheet/modal/popover: `0 12px 32px -12px rgba(22,32,58,.28)` → var `--shadow-sheet`,
    aplicada em `AlertDialogContent`, `PopoverContent`.
- **Foco e toque**: anel de foco = borda `accent`/`ring` + anel `3px` em `accent-soft`
  (`focus-visible:ring-accent-soft`). Alvo mínimo de toque: `44×44px`. Botões de formulário
  (submit de tela cheia): altura `48–52px`.

## Inventário de componentes (`components/ui/*`)

- **Button** (`button.jsx`) — variantes: `default` (primário, azul-noite), `secondary`
  ("Suave", azul suave/texto azul), `outline` ("Secundário", branco + borda), `ghost`
  ("Fantasma"), `link` ("Sair", texto azul sublinhado no hover), `destructive` (vermelho
  suave/texto vermelho). Tamanhos: `default`, `sm`, `xs`, `lg`, `icon*`. Estado
  `disabled` = opacidade 50%. Altura de botão de formulário controlada pela página
  (`h-[48px]`–`h-[52px]`), não pelo tamanho `lg` do primitivo.
- **Input** (`input.jsx`) — branco, borda `border-input`, foco = borda `ring` + anel
  `accent-soft`, erro = `aria-invalid` (borda/anel vermelhos), `disabled` = opacidade 50%.
- **Label** (`label.jsx`) — Manrope 800, 14px, cor `text-foreground` (label de campo).
- **Card** (`card.jsx`) — branco, borda suave, sombra quase nula, raio 8px. `CardTitle` usa
  a fonte display (título de cartão).
- **Badge** (`badge.jsx`) — variantes: `default` (azul sólido), `secondary` (azul suave —
  usado para contagem, ex. "2 pessoas"), `success` (verde suave — "ativa"), `warning`
  (âmbar suave — "encerrada"), `destructive` (vermelho suave — "cancelada"), `outline`,
  `ghost`, `link`.
- **Switch** (`switch.jsx`) — ligado = **verde** (`bg-success`), desligado = cinza
  (`#d9d2c4`). Thumb branco.
- **Progress** (`progress.jsx`) — trilho `border-soft`, indicador **verde** por padrão
  (pode ser sobrescrito via `indicatorClassName`, ex. cinza para evento encerrado).
- **Select / Popover / AlertDialog** — superfícies brancas/popover, raio 8–12px conforme o
  papel (dropdown = 8px, sheet/modal = 12px), sombra `--shadow-sheet`.
- **Bottom nav** (`components/layout/bottom-nav.jsx`) — 3 itens, 64px de altura, fundo
  `surface-alt`, item ativo em `accent` (azul), inativo em `muted-foreground`.
- **Empty/Error state** (`components/common/state-views.jsx`) — ícone em quadrado
  `accent-soft`/`primary` (empty) ou `danger-tint`/`destructive` (error), título na fonte
  display, ação com `Button` primário.

## Telas de referência

O frame do Figma (`4-1119`, seção "06 · Telas aplicadas") mostra o sistema aplicado em três
telas: **Início** (hero em display, busca, lista de reservas recentes), **Visualização do
evento** (título display, métricas, progresso de ocupação, botão "Copiar link" primário) e
**Criar evento** (labels Manrope 800, campos com foco em azul, switch verde, chips de
horário, botão de submit de 48px). Use essas três telas como referência de composição ao
criar novas.

## Onde isso vive no código

- Tokens e fontes: `pages/styles/globals.css`, `lib/fonts.js`, `pages/_document.js`.
- Primitivos: `components/ui/*`.
- Papéis de tipografia aplicados ad-hoc nas páginas via `font-display`/tamanhos utilitários
  (não há classes semânticas tipo `.text-display` — siga a tabela acima ao criar telas
  novas).
- Neutralização de marca nas páginas públicas: `components/public/public-shell.jsx`
  (`NEUTRAL_VARS`).

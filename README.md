<img width="1032" height="1077" alt="speedup-croped" src="https://github.com/user-attachments/assets/ce162849-1fe0-4572-b4d0-b7da6d491b03" />


# Sobre o projeto
Um sistema (multi-tenant) de gerenciamento de reservas de mesas, desde o dashboard de gerenciamento até o link de reserva para o cliente. Foi desenvolvido em parceria com neptunia restaurante a partir de uma necessidade real de gestão das reservas. O projeto busca diminuir o trabalho manual de troca de mensagens por whatsapp e alocação de mesas automatizando o processo para o cliente bastando preencher um formulário simples para efetuar a reserva.

# O problema
Hoje em muitos restaurantes reservas são gerenciadas manualmente via whatsapp com a alocação de mesa sendo feita manualmente, esse processo gera desafios como:
1. overbooking, quando as reservas aceitas estão além da capacidade física do restaurante
2. maior tempo gasto com trocas de mensagens no whatsapp 
3. pouco escalável para campanhas de tráfego pago
4. atrito para o cliente no processo de conversão 

# A solução
O sistema realiza o fluxo abaixo:

pré-requisito: Cadastro das mesas do salão (feito uma vez somente) 

1. Criação de uma data de evento
2. Compartilhar link do evento
3. Cliente realiza reserva pelo link
4. Sistema aplica algorítimo de matching de mesas para maior eficiência possível do salão:
    1. Busca as mesas: ativas, sem reserva, e dentro da capacidade de pessoas da reserva.
    2. Procura pelo best-case-match que é uma mesa na sua capacidade máxima.
    3. Caso não encontre vai pelo best-fit-match que é a mais próxima da capacidade máxima.
5. Gera um código para o cliente como confirmação da reserva

## Arquitetura

```text
 Interface Web (Next.js)
        │
        │  requisições HTTP
        ▼
     API REST
        │
        ├── Autenticação / Sessões
        ├── Controle de acesso
        ├── Regras de negócio
        ▼
     Models
        │
        ▼
   PostgreSQL
```

---

## Tecnologias utilizadas

* **Next.js** — framework full-stack e servidor da aplicação
* **React** — construção da interface web
* **Node.js** — runtime da aplicação
* **PostgreSQL** — banco de dados relacional
* **pg** — conexão e execução de queries no PostgreSQL
* **node-pg-migrate** — criação e execução das migrações do banco
* **next-connect** — composição de handlers e middleware das rotas da API
* **Docker / Docker Compose** — execução do PostgreSQL no ambiente de desenvolvimento
* **bcryptjs** — hash seguro de senhas
* **cookie** — gerenciamento de cookies HTTP
* **dotenv / dotenv-expand** — gerenciamento de variáveis de ambiente
* **Jest** — testes automatizados, incluindo testes de integração da API
* **ESLint + Prettier** — linting e padronização do código
* **Husky + Commitlint + Commitizen** — automação e padronização do fluxo de commits
* **Tailwind CSS** — estilização da interface
* **Radix UI / shadcn** — componentes e elementos de interface
* **GitHub Actions** — automação do fluxo de CI/CD


---

## Objetivos do projeto

* Permitir que restaurantes gerenciem eventos, horários, mesas e reservas;
* Utilizar práticas de desenvolvimento próximas às encontradas em aplicações web reais, incluindo migrações, CI, linting, testes e padronização de commits.
* Disponibilizar uma experiência pública para clientes realizarem reservas sem necessidade de cadastro;
* Implementar autenticação e controle de acesso para usuários do sistema;
* Controlar permissões através de features e regras de acesso;
* Evitar conflitos de reservas e respeitar a capacidade das mesas disponíveis;
* Aplicar testes automatizados aos principais fluxos da aplicação;

A API atualmente contempla os principais domínios de **usuários, sessões, restaurantes, eventos, presets de eventos, mesas e reservas**, incluindo fluxos distintos para usuários autenticados e clientes públicos.

---

## Estrutura do projeto

```text
.
├── .devcontainer/          # Ambiente de desenvolvimento
├── .github/
│   └── workflows/          # Workflows de CI/CD
├── .husky/                 # Hooks do Git
│
├── components/             # Componentes reutilizáveis da interface
├── context/                # Contextos React
├── hooks/                  # Hooks reutilizáveis
│
├── infra/
│   ├── compose.yaml        # PostgreSQL para desenvolvimento
│   ├── migrations/         # Migrações do banco de dados
│   └── scripts/            # Scripts de infraestrutura
│
├── lib/                    # Funções e serviços compartilhados
├── models/                 # Modelos e acesso aos dados
├── pages/
│   ├── api/                # API REST
│   └── ...                 # Páginas da aplicação
│
├── tests/                  # Testes automatizados
│
├── openapi.json            # Especificação da API
├── next.config.mjs         # Configuração do Next.js
├── jest.config.cjs         # Configuração do Jest
├── package.json            # Dependências e scripts
└── .env.development        # Variáveis de ambiente de desenvolvimento
```
---

## Como executar

### Pré-requisitos

* Node.js
* npm
* Docker e Docker Compose
* Git

### Instalação

```bash
git clone https://github.com/pedrovonanht/restaurante-saas.git
cd restaurante-saas

npm install
```

Configure as variáveis de ambiente utilizadas pelo projeto em:

```text
.env.development
```

Depois, inicie a aplicação:

```bash
npm run dev
```

O comando `dev` automatiza o ambiente de desenvolvimento: inicia o PostgreSQL através do Docker Compose, aguarda o banco ficar disponível, executa as migrações pendentes e então inicia o servidor Next.js.

Para executar os testes:

```bash
npm test
```

Para verificar a formatação:

```bash
npm run lint:prettier:check
```

Para executar o ESLint:

```bash
npm run lint:eslint:check
```

---

## API

A aplicação possui uma API REST documentada através de **OpenAPI 3.0.3**.

Os principais recursos disponíveis são:

```text
/status
/migrations
/sessions
/users
/restaurants
/events
/event-presets
/tables
/reservations
```

A autenticação utiliza uma sessão associada ao cookie HTTP-only `session_id`. Rotas administrativas exigem autenticação e podem exigir determinadas features/permissões, enquanto as rotas públicas de reserva permitem que clientes realizem operações sem autenticação.

A API também mantém um formato padronizado para erros:
```
{
  "name": "NomeDoErro",
  "message": "Mensagem explicando o que aconteceu",
  "action": "Mensagem recomendando fazer alguma ação",
  "status_code": 500
}
```
---

## Modelo de negócio

O sistema foi projetado em torno do fluxo de reservas de restaurantes.

```text
Restaurante
    │
    ├── Usuários / membros
    │       ├── owner
    │       └── staff
    │
    ├── Mesas
    │       ├── capacidade mínima
    │       ├── capacidade máxima
    │       └── disponibilidade
    │
    ├── Eventos
    │       ├── data
    │       ├── horários
    │       └── preset
    │
    └── Reservas
            ├── cliente
            ├── quantidade de pessoas
            ├── horário
            ├── mesa
            └── token público
```
:information_source: **Nota:** Eventos podem possuir múltiplos horários e podem utilizar presets reutilizáveis

---

## Contribuições

Contribuições são bem-vindas.

Caso tenha sugestões, encontre algum problema ou queira propor uma melhoria, fique à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

Antes de enviar alterações, recomenda-se executar os testes e as verificações de qualidade:

```bash
npm test
npm run lint:eslint:check
npm run lint:prettier:check
```

O projeto também utiliza **Conventional Commits**, com Commitizen, Commitlint e Husky para auxiliar na padronização do fluxo de desenvolvimento.


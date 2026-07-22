# Contexto
No desenvolvimento das reservas percebi que necessitava de uma forma do restaurante configurar uma espécie de agenda, com os dias de evento/operação. Sem algo assim seria possivel alguem reservar para um dia que o restaurante não vai abrir ou etc... Então vi na necessidade de criar algo como uma tabela eventos com as datas dos eventos em questão, pensando nisso percebi que esse objeto evento poderia absorver a issue de campaings pois ela permitiria que o dono setasse datas para reservas.

# Execução
Para isso é necessário criar uma tabela events no banco de dados, com em linhas gerais os seguintes dados:
```
CREATE TABLE events (
  id            uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_date    date NOT NULL,
  event_times time[] NOT NULL, -- array de horários disponiveis ex: 19:30, 20:30...
  name          text NOT NULL,
  capacity      integer,               -- vem na criação de restaurant: max_covers
  status        text NOT NULL DEFAULT 'open',   -- open | closed
  preset_id     uuid REFERENCES event_presets(id) ON DELETE SET NULL,  -- só rastreio
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, event_date)
);
```

Agora para a UI é interessante que também seja possivel criar templates para acelerar o processo de definir a agenda, por exemplo em 1 clique atribuir que uma sexta feira é uma noite de foundue. Para criar esses presets antes vamos precisar de uma tabela seguindo mais ou menos os seguintes campos:
```
CREATE TABLE event_presets (          --  puro atalho de UI
  id            uuid PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          text NOT NULL,
  capacity      integer,               -- nullable: NULL = usa teto da sala
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

Agora quanto as endpoints eles são:
1. GET `restaurants/[restaurant]/events` devolve uma lista dos eventos daquele restaurante. Para o owner retorna informações completas, para o anonimo filtra para mostrar dados só para a página de reserva como name, event_date mostrando só as campanhas active. Já para o dono mostra mais dados incluindo o numero de reservas total associado a ele.
2. POST  `restaurants/[restaurant]/events` cria um evento.
3. PATCH  `restaurants/[restaurant]/events/[date]` permite editar informações do evento, como name, event_date ou active.

-- quanto a templates é necessário um crud comum:
POST   `/restaurants/[restaurant]/event-presets` cria event-preset
GET    `restaurants/[restaurant]/event-presets` lista presets disponiveis
PATCH `restaurants/[restaurant]/event-presets/[id]` edita campo(s) do preset
DELETE `restaurants/[restaurant]/event-presets/[id]` exclui preset

OBS. os event-presets serão resolvidos via frontend o ´/events´ sequer conhece eles, é só atalho de ui




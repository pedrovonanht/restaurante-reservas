# Contexto
Hoje no sistema as vagas de um evento são contadas por capacidade total, no entanto essa é uma forma ineficiente de contabilizar isso por conta do arranjo de mesas. Por exemplo se tenho 10 mesas de 4 pessoas poderia contabilizar que tenho 40 lugares, o que não é real pois se vierem 10 casais já lotei as 10 mesas, exemplo clássico de overbooking. Para resolver isso preciso reformular o sistema de `validateSlots` para levar em conta mesas.

#  Execução
Precisamos criar uma tabela tables, onde cada mesa tem um valor minimo e máximo de pessoas, (por exemplo uma mesa aceita no minimo 4 pessoas nela e no máximo 6). O schema pode parecer algo como:
```
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- ex: "Mesa 01", "Bancada 03"
  min_capacity INT NOT NULL,   -- ex: 2
  max_capacity INT NOT NULL,   -- ex: 4
  active BOOLEAN NOT NULL DEFAULT true,   -- era "active: BOOLEAN": sintaxe DBML vazou, e faltava NOT NULL/DEFAULT
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
  UNIQUE ( name) WHERE active
);
```
Já na tabela de reservas é necessário referenciar tables adicionando: `table_id.

Já quanto aos endpoints é necessário criar um crud simples que permita ao usuário membro daquele restaurante gerenciar as mesas:
1. POST `api/v1/restaurants/[restaurant]/tables` cria mesas pro restaurante.
2. GET `api/v1/restaurants/[restaurant]/tables` visualiza todas as mesas daquele restaurante
3. PATCH `api/v1/restaurants/[restaurant]/tables/[id]` permite editar os campos de uma mesa, inclusive "apagar" ela basicamente tornando-a inativa mas mantendo registro dela por causa das reservas já associadas a ela no DB. 

# cuidados
1. Importante verificar as respostas das outras rotas como reservations ou events em busca de pontas soltas ou mudanças ali necessárias em querys de get e principalmente update.
2. Cuidado com bug de overbooking por concorrência, dois clientes verificando se tem slots ao mesmo tempo, talvez seja overenginering agora mas se tiver solução simples para isso vale a pena implementar.



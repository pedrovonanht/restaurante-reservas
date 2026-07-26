import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/error.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function create(restaurantId, tableInputValues) {
  if (!tableInputValues?.name) {
    throw new ValidationError({
      message: "O campo `name` é obrigatório.",
      action: "Tente novamente informando um `name`",
    });
  }

  if (
    tableInputValues?.max_capacity === undefined ||
    tableInputValues?.max_capacity === null
  ) {
    throw new ValidationError({
      message: "Campo `max_capacity` é obrigatório em tables",
      action: "Tente novamente informando um `max_capacity`",
    });
  }

  const minCapacity = tableInputValues.min_capacity ?? 1;
  const maxCapacity = tableInputValues.max_capacity;

  if (minCapacity > maxCapacity) {
    throw new ValidationError({
      message: "O minimo da capacidade não pode ser maior do que o máximo",
      action: "Tente novamente informando um novo `min_capacity`",
    });
  }

  await validateUniqueName(restaurantId, tableInputValues.name);

  const result = await database.query({
    text: `INSERT INTO tables (restaurant_id, name, min_capacity, max_capacity)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
    values: [restaurantId, tableInputValues.name, minCapacity, maxCapacity],
  });

  return result.rows[0];
}

async function validateUniqueName(restaurantId, name, excludeId) {
  const result = await database.query({
    text: `SELECT id FROM tables
           WHERE restaurant_id = $1 AND LOWER(name) = LOWER($2) AND active
           ${excludeId ? "AND id != $3" : ""}`,
    values: excludeId ? [restaurantId, name, excludeId] : [restaurantId, name],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "Já existe uma mesa com essa nome.",
      action: "Tente novamente informando um outro `name`.",
    });
  }
}

async function findAllActiveByRestaurantId(restaurantId) {
  const result = await database.query({
    text: `SELECT * FROM tables WHERE restaurant_id = $1 AND active ORDER BY created_at ASC`,
    values: [restaurantId],
  });

  return result.rows;
}

async function findOneByRestaurantIdAndId(restaurantId, id) {
  if (!UUID_REGEX.test(id)) {
    return undefined;
  }

  const result = await database.query({
    text: `SELECT * FROM tables WHERE restaurant_id = $1 AND id = $2 LIMIT 1`,
    values: [restaurantId, id],
  });

  return result.rows[0];
}

async function update(restaurantId, id, tableInputValues) {
  if (!tableInputValues || Object.keys(tableInputValues).length === 0) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  const currentTable = await findOneByRestaurantIdAndId(restaurantId, id);

  if (!currentTable) {
    throw new NotFoundError({
      message: "A mesa informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  const tableWithNewValues = { ...currentTable, ...tableInputValues };

  if (tableWithNewValues.min_capacity > tableWithNewValues.max_capacity) {
    throw new ValidationError({
      message: "O minimo da capacidade não pode ser maior do que o máximo",
      action: "Tente novamente informando um novo `min_capacity`",
    });
  }

  if ("name" in tableInputValues) {
    await validateUniqueName(restaurantId, tableInputValues.name, id);
  }

  const result = await database.query({
    text: `UPDATE tables
           SET name=$1, min_capacity=$2, max_capacity=$3, active=$4, updated_at=now()
           WHERE id=$5
           RETURNING *`,
    values: [
      tableWithNewValues.name,
      tableWithNewValues.min_capacity,
      tableWithNewValues.max_capacity,
      tableWithNewValues.active,
      tableWithNewValues.id,
    ],
  });

  return result.rows[0];
}

async function findAvailableForEvent({ restaurantId, eventId, partySize }) {
  const result = await database.query({
    text: `
      SELECT t.*
      FROM tables t
      WHERE t.restaurant_id = $1
        AND t.active
        AND $2 BETWEEN t.min_capacity AND t.max_capacity
        AND NOT EXISTS (
          SELECT 1 FROM reservations r
          WHERE r.event_id = $3 AND r.table_id = t.id
        )
      ORDER BY t.max_capacity ASC, t.min_capacity DESC, t.created_at ASC
      LIMIT 1`,
    values: [restaurantId, partySize, eventId],
  });

  return result.rows[0];
}

const table = {
  create,
  findAllActiveByRestaurantId,
  findOneByRestaurantIdAndId,
  update,
  findAvailableForEvent,
};

export default table;

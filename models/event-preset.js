import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/error.js";

async function create(restaurantId, presetInputValues) {
  if (!presetInputValues?.name) {
    throw new ValidationError({
      message: "O campo `name` é obrigatório.",
      action: "Tente novamente informando um `name`",
    });
  }

  if (
    presetInputValues?.capacity === undefined ||
    presetInputValues?.capacity === null
  ) {
    throw new ValidationError({
      message: "Campo `capacity` é obrigatório em presets",
      action: "Tente novamente informando um `capacity`",
    });
  }

  const result = await database.query({
    text: `INSERT INTO event_presets (restaurant_id, name, capacity)
           VALUES ($1, $2, $3)
           RETURNING *`,
    values: [restaurantId, presetInputValues.name, presetInputValues.capacity],
  });

  return result.rows[0];
}

async function findAllByRestaurantId(restaurantId) {
  const result = await database.query({
    text: `SELECT * FROM event_presets WHERE restaurant_id = $1 ORDER BY created_at ASC`,
    values: [restaurantId],
  });

  return result.rows;
}

async function findOneByIdAndRestaurantId(id, restaurantId) {
  const result = await database.query({
    text: `SELECT * FROM event_presets WHERE id = $1 AND restaurant_id = $2 LIMIT 1`,
    values: [id, restaurantId],
  });

  return result.rows[0];
}

async function update(restaurantId, id, presetInputValues) {
  if (!presetInputValues || Object.keys(presetInputValues).length === 0) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  const currentPreset = await findOneByIdAndRestaurantId(id, restaurantId);

  if (!currentPreset) {
    throw new NotFoundError({
      message: "O preset informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  const presetWithNewValues = { ...currentPreset, ...presetInputValues };

  const result = await database.query({
    text: `UPDATE event_presets
           SET name=$1, capacity=$2, updated_at=now()
           WHERE id=$3
           RETURNING *`,
    values: [
      presetWithNewValues.name,
      presetWithNewValues.capacity,
      presetWithNewValues.id,
    ],
  });

  return result.rows[0];
}

async function remove(restaurantId, id) {
  const currentPreset = await findOneByIdAndRestaurantId(id, restaurantId);

  if (!currentPreset) {
    throw new NotFoundError({
      message: "O preset informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  await database.query({
    text: `DELETE FROM event_presets WHERE id = $1`,
    values: [id],
  });
}

const eventPreset = {
  create,
  findAllByRestaurantId,
  findOneByIdAndRestaurantId,
  update,
  remove,
};

export default eventPreset;

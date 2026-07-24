import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/error.js";

function formatEventRow(row) {
  if (!row) return row;

  return {
    ...row,
    event_date:
      row.event_date instanceof Date
        ? row.event_date.toISOString().slice(0, 10)
        : row.event_date,
    event_times: row.event_times?.map((time) =>
      typeof time === "string" ? time.slice(0, 5) : time,
    ),
  };
}

async function create(restaurantId, eventInputValues) {
  if (!eventInputValues?.name) {
    throw new ValidationError({
      message: "O campo `name` é obrigatório.",
      action: "Tente novamente informando um `name`",
    });
  }

  if (!eventInputValues?.event_date) {
    throw new ValidationError({
      message: "O campo `event_date` é obrigatório.",
      action: "Tente novamente informando um `event_date`",
    });
  }

  if (
    !eventInputValues?.event_times ||
    eventInputValues.event_times.length === 0
  ) {
    throw new ValidationError({
      message: "O campo `event_times` é obrigatório.",
      action: "Tente novamente informando um `event_times`",
    });
  }

  let capacity = eventInputValues.capacity;

  if (capacity === undefined || capacity === null) {
    const restaurantResult = await database.query({
      text: `SELECT max_covers FROM restaurants WHERE id = $1`,
      values: [restaurantId],
    });
    capacity = restaurantResult.rows[0]?.max_covers ?? null;
  }

  const result = await database.query({
    text: `INSERT INTO events (restaurant_id, event_date, event_times, name, capacity, active, preset_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
    values: [
      restaurantId,
      eventInputValues.event_date,
      eventInputValues.event_times,
      eventInputValues.name,
      capacity,
      eventInputValues.active ?? true,
      eventInputValues.preset_id ?? null,
    ],
  });
  console.log
  return formatEventRow(result.rows[0]);
}

async function findAllByRestaurantId(restaurantId) {
  const result = await database.query({
    text: `SELECT * FROM events WHERE restaurant_id = $1 ORDER BY event_date ASC`,
    values: [restaurantId],
  });

  return result.rows.map(formatEventRow);
}

async function findOneByRestaurantIdAndDate(restaurantId, eventDate) {
  const result = await database.query({
    text: `SELECT * FROM events WHERE restaurant_id = $1 AND event_date = $2 LIMIT 1`,
    values: [restaurantId, eventDate],
  });

  return formatEventRow(result.rows[0]);
}

async function update(restaurantId, currentEventDate, eventInputValues) {
  if (!eventInputValues || Object.keys(eventInputValues).length === 0) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  const currentEvent = await findOneByRestaurantIdAndDate(
    restaurantId,
    currentEventDate,
  );

  if (!currentEvent) {
    throw new NotFoundError({
      message: "O evento informado não foi encontrado no sistema.",
      action: "Verifique a `data` informada.",
    });
  }

  const eventWithNewValues = { ...currentEvent, ...eventInputValues };

  const result = await database.query({
    text: `UPDATE events
           SET name=$1, event_date=$2, event_times=$3, capacity=$4, active=$5, preset_id=$6, updated_at=now()
           WHERE id=$7
           RETURNING *`,
    values: [
      eventWithNewValues.name,
      eventWithNewValues.event_date,
      eventWithNewValues.event_times,
      eventWithNewValues.capacity,
      eventWithNewValues.active,
      eventWithNewValues.preset_id,
      eventWithNewValues.id,
    ],
  });

  return formatEventRow(result.rows[0]);
}

const event = {
  create,
  findAllByRestaurantId,
  findOneByRestaurantIdAndDate,
  update,
};

export default event;

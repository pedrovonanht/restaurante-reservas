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

function formatEventWithOcupation(row) {
  if (!row) return row;

  return {
    ...formatEventRow(row),
    ocupation: {
      reservations: Number(row.reservations_count),
      total_capacity: Number(row.total_capacity),
      people: Number(row.people_count),
      empty_tables: Number(row.empty_tables),
    },
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

  const result = await database.query({
    text: `INSERT INTO events (restaurant_id, event_date, event_times, name, active, preset_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
    values: [
      restaurantId,
      eventInputValues.event_date,
      eventInputValues.event_times,
      eventInputValues.name,
      eventInputValues.active ?? true,
      eventInputValues.preset_id ?? null,
    ],
  });
  return formatEventRow(result.rows[0]);
}

async function findAllByRestaurantId(restaurantId) {
  const result = await database.query({ //queries aninhadas para evitar abrir clients
    text: `
      SELECT
        e.*,
        COUNT(r.id)::int AS reservations_count,
        COALESCE(SUM(r.party_size), 0)::int AS people_count,
        COALESCE((
          SELECT SUM(t.max_capacity) FROM tables t
          WHERE t.restaurant_id = e.restaurant_id AND t.active
        ), 0)::int AS total_capacity,
        COALESCE((
          SELECT COUNT(*) FROM tables t
          WHERE t.restaurant_id = e.restaurant_id AND t.active
          AND NOT EXISTS (
            SELECT 1 FROM reservations r2
            WHERE r2.event_id = e.id AND r2.table_id = t.id
          )
        ), 0)::int AS empty_tables
      FROM events e
      LEFT JOIN reservations r ON r.event_id = e.id
      WHERE e.restaurant_id = $1
      GROUP BY e.id
      ORDER BY e.event_date ASC`,
    values: [restaurantId],
  });

  return result.rows.map(formatEventWithOcupation);
}

async function findOneByRestaurantIdAndId(restaurantId, id) {
  const result = await database.query({
    text: `
      SELECT
        e.*,
        COUNT(r.id)::int AS reservations_count,
        COALESCE(SUM(r.party_size), 0)::int AS people_count,
        COALESCE((
          SELECT SUM(t.max_capacity) FROM tables t
          WHERE t.restaurant_id = e.restaurant_id AND t.active
        ), 0)::int AS total_capacity,
        COALESCE((
          SELECT COUNT(*) FROM tables t
          WHERE t.restaurant_id = e.restaurant_id AND t.active
          AND NOT EXISTS (
            SELECT 1 FROM reservations r2
            WHERE r2.event_id = e.id AND r2.table_id = t.id
          )
        ), 0)::int AS empty_tables
      FROM events e
      LEFT JOIN reservations r ON r.event_id = e.id
      WHERE e.restaurant_id = $1 AND e.id = $2
      GROUP BY e.id
      LIMIT 1`,
    values: [restaurantId, id],
  });

  return formatEventWithOcupation(result.rows[0]);
}

async function findOneByRestaurantIdAndDate(restaurantId, eventDate) {
  const result = await database.query({
    text: `SELECT * FROM events WHERE restaurant_id = $1 AND event_date = $2 LIMIT 1`,
    values: [restaurantId, eventDate],
  });

  return formatEventRow(result.rows[0]);
}

async function update(restaurantId, eventId, eventInputValues) {
  if (!eventInputValues || Object.keys(eventInputValues).length === 0) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  const currentEvent = await findOneByRestaurantIdAndId(restaurantId, eventId);

  if (!currentEvent) {
    throw new NotFoundError({
      message: "O evento informado não foi encontrado no sistema.",
      action: "Verifique o `id` informado.",
    });
  }

  const eventWithNewValues = { ...currentEvent, ...eventInputValues };

  const result = await database.query({
    text: `UPDATE events
           SET name=$1, event_date=$2, event_times=$3, active=$4, preset_id=$5, updated_at=now()
           WHERE id=$6
           RETURNING *`,
    values: [
      eventWithNewValues.name,
      eventWithNewValues.event_date,
      eventWithNewValues.event_times,
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
  findOneByRestaurantIdAndId,
  findOneByRestaurantIdAndDate,
  update,
};

export default event;

import { NotFoundError, BusinessRuleError, ValidationError} from "infra/error";
import event from "models/event";
import table from "models/table";
import database from "infra/database.js"
import crypto from "node:crypto";

async function create(restaurantId, userInputValues) {
const foundEvent = await event.findOneByRestaurantIdAndDate(restaurantId, userInputValues.reservation_date)
    validateEvent(foundEvent)
    await validateUniquePhone(userInputValues.guest_phone, foundEvent.id);
    validateDate(userInputValues.reservation_date)
    validateReservationTime(userInputValues)

    const allocatedTable = await allocateTable(restaurantId, foundEvent.id, userInputValues.party_size)

    const generatedToken = crypto.randomBytes(32).toString("base64url");
    const dataObject = {...userInputValues, restaurantId: restaurantId, eventId: foundEvent.id, tableId: allocatedTable.id, public_token: generatedToken}

    try {
      const bookingObject = await runInsertQuery(dataObject)
      return bookingObject;
    } catch (error) {
      if (error.cause?.code === "23505") { // para evitar erro genérico em race condition. Precisa capturar para não virar erro genérico do try catch de database
        throw new BusinessRuleError({
          message: "O limite de reservas foi atingido para essa data.",
          action: "Tente outra data disponível.",
        });
      }
      throw error;
    }

    async function runInsertQuery(dataObject) {
    const result = await database.query({
      text: `
      INSERT INTO
      reservations (restaurant_id, event_id, table_id, party_size, public_token, guest_name, guest_phone, reservation_time)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      values: [
        dataObject.restaurantId,
        dataObject.eventId,
        dataObject.tableId,
        dataObject.party_size,
        dataObject.public_token,
        dataObject.guest_name,
        dataObject.guest_phone,
        dataObject.reservation_time
      ],
    });
    return result.rows[0];
  }

    function validateEvent(event) {
         if (event === undefined) {
        throw new NotFoundError({
        message: "Não foi encontrado um evento para essa data.",
          action: "Verifique a data e tente novamente",
        })
    }
    }
    function validateReservationTime(userInputValues) {
  const reservationTime = userInputValues?.reservation_time;

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (typeof reservationTime !== "string" || !timeRegex.test(reservationTime)) {
    throw new ValidationError({
        message: "O campo `reservation_time` é obrigatorio para reservas.",
        action: "Adicione esse campo e tente novamente."
    })
  }
  return true;
}
}

  async function validateUniquePhone (phone, eventId) {
    const result = await database.query({
    text: `SELECT 1 FROM reservations WHERE guest_phone=$1 AND event_id=$2`,
    values: [phone, eventId],
  });
  if (result.rows.length > 0) {
    throw new BusinessRuleError({
        message: "Já existe uma reserva com esse numero de telefone para essa data.",
         action: "Tente outra data disponível.",
         statusCode: 409,
    });
  }
}

function validateDate(date) {
  const reservationDate = new Date(`${date}T00:00:00`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reservationDate < today) {
    throw new ValidationError({
      message: "A `reservation_date` não pode estar no passado.",
      action: "Verifique a data e tente novamente.",
      status_code: 422,
    });
  }
}

async function allocateTable(restaurantId, eventId, partySize) {
  const availableTable = await table.findAvailableForEvent({
    restaurantId,
    eventId,
    partySize,
  });

  if (availableTable) {
    return availableTable;
  }
 
    throw new BusinessRuleError({
      message: `Não há mesa disponivel para ${partySize} pessoas`,
      action: "Tente outra data disponível.",
    });
  
}

async function findOneByRestaurantIdAndToken(restaurantId, token) {
  const result = await database.query({
    text: `SELECT * FROM reservations WHERE restaurant_id=$1 AND public_token=$2 LIMIT 1`,
    values: [restaurantId, token],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "Reserva não encontrada no sistema.",
      action: "Verifique a url e tente novamente.",
    });
  }

  return formatPublicReservation(result.rows[0]);
}

function formatPublicReservation(row) { //futuramente refatorar movendo para filteroutput
  return {
    id: row.id,
    party_size: row.party_size,
    guest_name: row.guest_name,
    reservation_time: row.reservation_time.slice(0,5),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findAllByRestaurantId(restaurantId, { from, to } = {}) {
  const values = [restaurantId];
  let filter = "";

  if (from) {
    values.push(from);
    filter += ` AND e.event_date >= $${values.length}`;
  }
  if (to) {
    values.push(to);
    filter += ` AND e.event_date <= $${values.length}`;
  }

  const result = await database.query({
    text: `
      SELECT
        r.id, r.guest_phone, r.guest_name, r.party_size, r.reservation_time,
        r.restaurant_id, r.public_token, r.created_at, r.updated_at,
        e.id AS event_id, e.event_date AS event_date, e.name AS event_name,
        t.name AS table_name
      FROM reservations r
      JOIN events e ON e.id = r.event_id
      LEFT JOIN tables t ON t.id = r.table_id
      WHERE r.restaurant_id = $1${filter}
      ORDER BY r.created_at ASC`,
    values,
  });


  return result.rows.map(formatOwnerReservation);
}

function formatOwnerReservation(row) {
  return {
    id: row.id,
    guest_phone: row.guest_phone,
    guest_name: row.guest_name,
    party_size: row.party_size,
    table_name: row.table_name,
    event: {
      id: row.event_id,
      event_date:
        row.event_date instanceof Date
          ? row.event_date.toISOString().slice(0, 10)
          : row.event_date,
      name: row.event_name,
    },
    restaurant_id: row.restaurant_id,
    reservation_time: row.reservation_time.slice(0,5),
    public_token: row.public_token,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const reservation = {
    create,
    findOneByRestaurantIdAndToken,
    findAllByRestaurantId
}

export default reservation;

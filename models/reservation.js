import { NotFoundError, BusinessRuleError, ValidationError} from "infra/error";
import event from "models/event";
import database from "infra/database.js"
import crypto from "node:crypto";

async function create(restaurantId, userInputValues) {
const foundEvent = await event.findOneByRestaurantIdAndDate(restaurantId, userInputValues.reservation_date)
    validateEvent(foundEvent)
    await validateUniquePhone(userInputValues.guest_phone, foundEvent.id);
    validateDate(userInputValues.reservation_date)
    await validateSlots(foundEvent.id, restaurantId, userInputValues.party_size)

    const generatedToken = crypto.randomBytes(32).toString("base64url");
    const dataObject = {...userInputValues, restaurantId: restaurantId, eventId: foundEvent.id, public_token: generatedToken}
    const bookingObject = await runInsertQuery(dataObject)

    return bookingObject;
    
    
    async function runInsertQuery(dataObject) {
    const result = await database.query({
      text: `
      INSERT INTO
      reservations (restaurant_id, event_id, party_size, public_token, guest_name, guest_phone)
      VALUES
      ($1, $2, $3, $4, $5, $6)  
      RETURNING *`,
      values: [
        dataObject.restaurantId,
        dataObject.eventId,
        dataObject.party_size,
        dataObject.public_token,
        dataObject.guest_name,
        dataObject.guest_phone,
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
}

  async function validateUniquePhone (phone, eventId) {
    const result = await database.query({
    text: `SELECT 1 FROM reservations WHERE guest_phone=$1 AND event_id=$2`,
    values: [phone, eventId],
  });
  if (result.rows.length > 0) {
    throw new BusinessRuleError({
        message: "O limite de reservas foi atingido para essa data.",
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

async function validateSlots (eventId, restaurantId, requestingPartySize) {
    const capacity = await database.query({
    text: `SELECT capacity FROM events WHERE id=$1 AND restaurant_id=$2`,
    values: [eventId,restaurantId],
  });

    const alredyPartySize = await database.query({
    text: `SELECT party_size FROM reservations WHERE event_id=$1 and restaurant_id=$2`,
    values: [eventId, restaurantId],
  });

  let usedCapacity = 0;
  alredyPartySize.rows.map((item) => usedCapacity+= item.party_size)
  
  if((usedCapacity + Number(requestingPartySize)) > capacity.rows[0].capacity) {
     throw new BusinessRuleError({
        message: "O limite de reservas foi atingido para essa data.",
         action: "Tente outra data disponível.",
    });
  }
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

function formatPublicReservation(row) {
  return {
    id: row.id,
    party_size: row.party_size,
    guest_name: row.guest_name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const reservation = {
    create,
    findOneByRestaurantIdAndToken
}

export default reservation;
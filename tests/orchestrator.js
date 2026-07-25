import database from "infra/database";
import retry from "async-retry";
import webserver from "infra/webserver";
import migrator from "models/migrator";
import user from "models/user.js";
import { faker } from "@faker-js/faker";
import session from "models/session";
import restaurant from "models/restaurant";
import membership from "models/membership";
import event from "models/event";
import eventPreset from "models/event-preset";
import reservation from "models/reservation";

async function clearDatabase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function waitForAllServices() {
  await waitForWebServices();

  async function waitForWebServices() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function createUser(userInputValues) {
  return await user.create({
    username: userInputValues?.username || faker.internet.username(),
    email: userInputValues?.email || faker.internet.email(),
    password: userInputValues?.password || "validPassword123",
  });
}

async function createRestaurant(userId, restaurantInputValues) { //método cria membership do user como 'owner' junto
  return await restaurant.create(userId, {
    name: restaurantInputValues.name,
    max_covers: restaurantInputValues.max_covers,
  });
}

async function createMembership({ userId, restaurantId, role }) {
  return await membership.create({
    userId: userId,
    restaurantId: restaurantId,
    role,
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function createEvent(restaurantId, eventInputValues) {
  const createdEvent = await event.create(restaurantId, eventInputValues);

  return {
    ...createdEvent,
    created_at: createdEvent.created_at.toISOString(),
    updated_at: createdEvent.updated_at.toISOString(),
  };
}

async function createEventPreset(restaurantId, presetInputValues) {
  return  await eventPreset.create(restaurantId, presetInputValues)
}

async function createReserve({ restaurantId, eventId, partySize, guestName, guestPhone, reservationTime }) {
  const events = await event.findAllByRestaurantId(restaurantId);
  const targetEvent = events.find((item) => item.id === eventId);
  
  return await reservation.create(restaurantId, {
    reservation_date: targetEvent.event_date,
    party_size: partySize,
    guest_name: guestName,
    guest_phone: guestPhone,
    reservation_time: reservationTime
  });
}

async function promoteUserToAdmin(userId) {
  const result = await database.query({
    text: `UPDATE users
           SET is_admin = true, updated_at = now()
           WHERE id = $1
           RETURNING *`,
    values: [userId],
  });

  return result.rows[0];
}

const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations,
  createUser,
  createSession,
  createMembership,
  createRestaurant,
  createEvent,
  createEventPreset,
  createReserve,
  promoteUserToAdmin,
};

export default orchestrator;

import database from "infra/database";
import retry from "async-retry";
import webserver from "infra/webserver";
import migrator from "models/migrator";
import user from "models/user.js";
import { faker } from "@faker-js/faker";
import session from "models/session";
import restaurant from "models/restaurant";
import membership from "models/membership";

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
    username: userInputValues.username || faker.internet.username(),
    email: userInputValues.email || faker.internet.email(),
    password: userInputValues.password || "validPassword123",
  });
}

async function createRestaurant(userId, restaurantInputValues) {
  return await restaurant.create(userId, {
    name: restaurantInputValues.name,
    max_covers: restaurantInputValues.max_covers,
  });
}

async function createMembership({userId, restaurantId, role}) {
  return await membership.create({
    userId: userId,
    restaurantId: restaurantId,
    role,
  });
}

async function createSession(userId) {
  return await session.create(userId);
}
const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations,
  createUser,
  createSession,
  createMembership,
  createRestaurant
};

export default orchestrator;

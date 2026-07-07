import database from "infra/database";
import retry from "async-retry";
import webserver from "infra/webserver";
import migrator from "models/migrator"
import user from "models/user.js"
import {faker} from "@faker-js/faker"

async function clearDatabase() {
  await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
}

async function runPendingMigrations () {
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
    password: userInputValues.password || "validPassword123"
  })
}
const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations,
  createUser
};

export default orchestrator;

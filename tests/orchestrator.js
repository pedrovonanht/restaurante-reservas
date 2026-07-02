import database from "infra/database";
import retry from "async-retry";
import webserver from "infra/webserver";
import migrator from "models/migrator"

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

const orchestrator = {
  clearDatabase,
  waitForAllServices,
  runPendingMigrations
};

export default orchestrator;

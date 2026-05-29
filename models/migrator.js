import database from "infra/database";
import { resolve } from "node:path";
import { runner as migrationRunner } from "node-pg-migrate";

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migrationSettings = {
      dbClient: dbClient,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      log: () => {},
      migrationsTable: "pgmigrations",
    };
    const listedMigrations = await migrationRunner(migrationSettings);
    return listedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
};

export default migrator;

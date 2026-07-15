import controller from "infra/controller";
import migrator from "models/migrator.js";
import authorization from "models/authorization.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(authorization.canRequest("read:migrations"), getHandler);
router.post(authorization.canRequest("create:migrations"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const listedMigrations = await migrator.listPendingMigrations();

  return response.status(200).json(listedMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  } else {
    return response.status(200).json(migratedMigrations);
  }
}

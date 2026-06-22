import controller from "infra/controller";
import database from "infra/database.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const result = await database.query({
    text: `
      SELECT
        current_setting('server_version') AS version,
        current_setting('max_connections')::int AS max_conections,
        (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database()) AS used_conections
    `,
  });

  const { version, max_conections, used_conections } = result.rows[0];

  return response.status(200).json({
    version,
    max_conections,
    used_conections,
    updated_at: new Date().toISOString(),
  });
}

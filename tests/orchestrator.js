import database from "infra/database";
import retry from "async-retry";
import webserver from "infra/webserver";

async function clearDatabase () {
    await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;")
} 

async function waitForAllServices() {
     return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

     async function fetchStatusPage() {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      if (response.status !== 200) {
        throw Error();
      }
}}

const orchestrator = {
    clearDatabase,
    waitForAllServices
}

export default orchestrator;
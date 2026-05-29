import database from "infra/database";

async function clearDatabase () {
    await database.query("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;")
} 

const orchestrator = {
    clearDatabase
}

export default orchestrator;
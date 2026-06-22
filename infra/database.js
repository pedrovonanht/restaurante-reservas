import pg from "pg";
import { ServiceError } from "./error";

const { Client } = pg;

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
    password: process.env.POSTGRES_PASSWORD || "local",
    ssl: process.env.NODE_ENV == "production" ? true : false,
  });

  await client.connect();
  return client;
}

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const publicErrorObject = new ServiceError({
      message: "Erro no banco de dados ou na query",
      cause: error,
    });
    throw new publicErrorObject();
  } finally {
    await client.end();
  }
}

export default { getNewClient, query };

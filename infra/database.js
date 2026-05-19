import pg from "pg";

const { Client } = pg;

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
    password: process.env.POSTGRES_PASSWORD || "local",
  });

  await client.connect();
  return client;
}

async function query(queryObject) {
  const client = await getNewClient();

  try {
    const result = await client.query(queryObject);
    return result;
  } finally {
    await client.end();
  }
}

export default { getNewClient, query };

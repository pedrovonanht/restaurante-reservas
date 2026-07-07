import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 dias

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const result = await database.query({
    text: `INSERT INTO sessions (token, user_id, expires_at)
           VALUES ($1, $2, now() + $3::interval)
           RETURNING *`,
    values: [token, userId, `${EXPIRATION_IN_MILLISECONDS} milliseconds`],
  });

  return result.rows[0];
}

const session = { create, EXPIRATION_IN_MILLISECONDS };
export default session;

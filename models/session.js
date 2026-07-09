import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/error";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 dias

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + session.EXPIRATION_IN_MILLISECONDS);

  const result = await database.query({
    text: `INSERT INTO sessions (token, user_id, expires_at)
           VALUES ($1, $2, $3)
           RETURNING *`,
    values: [token, userId, expiresAt],
  });

  return result.rows[0];
}

async function findOneValidByToken(token) {
  const result = await database.query({
    text: `SELECT
    *
    FROM
    sessions
    WHERE
    token=$1 AND expires_at > now()
    LIMIT
    1`,
    values: [token],
  });

  if (result.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Sessão inválida.",
      action: "Verifique se o usuário está logado.",
    });
  }

  return result.rows[0];
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + session.EXPIRATION_IN_MILLISECONDS);
  const result = await database.query({
    text: `
    UPDATE 
      sessions
    SET 
      expires_at=$1, updated_at=now()
    WHERE 
      id=$2
    RETURNING 
      *
    `,
    values: [expiresAt, sessionId],
  });

  return result.rows[0];
}

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_IN_MILLISECONDS,
};
export default session;

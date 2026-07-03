import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/error.js";
import password from "models/password.js";

async function create(userInputValues) {
  if (!userInputValues.password) {
    throw new ValidationError({
      message: "O campo `password` é obrigatório.",
      action: "Tente novamente informando uma `password`",
    });
  }

  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);

  const hashedPassword = await password.hash(userInputValues.password);

  const result = await database.query({
    text: `INSERT INTO users (username, email, password)
           VALUES ($1, $2, $3)
           RETURNING *`,
    values: [userInputValues.username, userInputValues.email, hashedPassword],
  });

  return result.rows[0];
}

async function findOneByUsername(username) {
  const foundUserObject = await runSelectQuery(username);
  return foundUserObject;

  async function runSelectQuery(username) {
    console.log(username)
    const result = await database.query({
     text: `
      SELECT
      *
      FROM
      users
      WHERE
      LOWER(username) = LOWER($1)
      LIMIT
      10
      ;`,
      values: [username],
    });
    console.log(result.rows[0])
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o nome de usuário informado.",
      });
    }
    return result.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`,
    values: [username],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar essa operação!",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
    values: [email],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar essa operação!",
    });
  }
}

const user = { create, findOneByUsername };
export default user;

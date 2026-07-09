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

async function update(username, userInputValues) {
  if (!userInputValues || Object.keys(userInputValues).length === 0) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  const currentUser = await findOneByUsername(username);

  if (
    "username" in userInputValues &&
    username.toLowerCase() !== userInputValues.username.toLowerCase()
  ) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if (userInputValues.password) {
    userInputValues.password = await password.hash(userInputValues.password);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  return await runUpdateQuery(userWithNewValues);

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `UPDATE users
             SET username=$1, email=$2, password=$3, updated_at=now()
             WHERE id=$4
             RETURNING *`,
      values: [
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.id,
      ],
    });
    return result.rows[0];
  }
}

async function findOneByUsername(username) {
  const foundUserObject = await runSelectQuery(username);
  return foundUserObject;

  async function runSelectQuery(username) {
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
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o username informado.",
      });
    }
    return result.rows[0];
  }
}

async function findOneByEmail(email) {
  const foundUserObject = await runSelectQuery(email);
  return foundUserObject;

  async function runSelectQuery(email) {
    const result = await database.query({
      text: `
      SELECT
      *
      FROM
      users
      WHERE
      LOWER(email) = LOWER($1)
      LIMIT
      10
      ;`,
      values: [email],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema.",
        action: "Verifique o email informado.",
      });
    }
    return result.rows[0];
  }
}

async function findOneById(id) {
  const foundUserObject = await runSelectQuery(id);
  return foundUserObject;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
      SELECT
      *
      FROM
      users
      WHERE
      id = $1
      LIMIT
      1
      ;`,
      values: [username],
    });
    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O Id informado não foi encontrado no sistema.",
        action: "Verifique o Id informado.",
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

const user = { create, findOneByUsername, findOneByEmail, findOneById, update };
export default user;

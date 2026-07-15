import database from "infra/database.js";
import { NotFoundError } from "infra/error.js";

async function create({ restaurantId, userId, role }, transactionClient) {
  const queryRunner = transactionClient ?? database;

  const result = await queryRunner.query({
    text: `INSERT INTO memberships (restaurant_id, user_id, role)
           VALUES ($1, $2, $3)
           RETURNING *`,
    values: [restaurantId, userId, role],
  });

  return result.rows[0];
}

async function findOneByRestaurantIdAndUserId(restaurantId, userId) {
  const result = await database.query({
    text: `SELECT
    *
    FROM
    memberships
    WHERE
    restaurant_id=$1 AND user_id=$2
    LIMIT
    1`,
    values: [restaurantId, userId],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "A membership informada não foi encontrada no sistema.",
      action: "Verifique o restaurante e o usuário informados.",
    });
  }

  return result.rows[0];
}

const membership = { create, findOneByRestaurantIdAndUserId };
export default membership;

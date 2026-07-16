import database from "infra/database.js";

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

  return result.rows[0];
}

const membership = { create, findOneByRestaurantIdAndUserId };
export default membership;

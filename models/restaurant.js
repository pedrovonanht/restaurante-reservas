import database from "infra/database.js";
import { ValidationError } from "infra/error.js";
import membership from "models/membership.js";

async function create(userId, restaurantInputValues) {
  if (!restaurantInputValues?.name) {
    throw new ValidationError({
      message: "O campo `name` é obrigatório.",
      action: "Tente novamente informando um `name`",
    });
  }

  if (!restaurantInputValues?.slug) {
    throw new ValidationError({
      message: "O campo `slug` é obrigatório.",
      action: "Tente novamente informando um `slug`",
    });
  }

  if (!restaurantInputValues?.max_covers) {
    throw new ValidationError({
      message: "O campo `max_covers` é obrigatório.",
      action: "Tente novamente informando um `max_covers`",
    });
  }

  await validateUniqueSlug(restaurantInputValues.slug);

  const newRestaurant = await database.transaction(async (transactionClient) => {
    const result = await transactionClient.query({
      text: `INSERT INTO restaurants (name, slug, max_covers)
             VALUES ($1, $2, $3)
             RETURNING *`,
      values: [
        restaurantInputValues.name,
        restaurantInputValues.slug,
        restaurantInputValues.max_covers,
      ],
    });
    const createdRestaurant = result.rows[0];

    await membership.create(
      { restaurantId: createdRestaurant.id, userId, role: "owner" },
      transactionClient
    );

    return createdRestaurant;
  });

  return newRestaurant;
}

async function validateUniqueSlug(slug) {
  const result = await database.query({
    text: `SELECT id FROM restaurants WHERE LOWER(slug) = LOWER($1)`,
    values: [slug],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "O slug informado já está sendo utilizado.",
      action: "Utilize outro slug para realizar essa operação!",
    });
  }
}

const restaurant = { create };
export default restaurant;

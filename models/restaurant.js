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

  if (!restaurantInputValues?.max_covers) {
    throw new ValidationError({
      message: "O campo `max_covers` é obrigatório.",
      action: "Tente novamente informando um `max_covers`",
    });
  }

  await validateUniqueName(restaurantInputValues.name);

  const slug = slugify(restaurantInputValues.name);

  const newRestaurant = await database.transaction(async (transactionClient) => {
    const result = await transactionClient.query({
      text: `INSERT INTO restaurants (name, slug, max_covers)
             VALUES ($1, $2, $3)
             RETURNING *`,
      values: [
        restaurantInputValues.name,
        slug,
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

async function validateUniqueName(name) {
  const result = await database.query({
    text: `SELECT id FROM restaurants WHERE LOWER(name) = LOWER($1)`,
    values: [name],
  });

  if (result.rows.length > 0) {
    throw new ValidationError({
      message: "O nome informado já está sendo utilizado.",
      action: "Utilize outro nome para realizar essa operação!",
    });
  }
}

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const restaurant = { create };
export default restaurant;

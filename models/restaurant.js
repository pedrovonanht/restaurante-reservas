import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/error.js";
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

  const newRestaurant = await database.transaction(
    async (transactionClient) => {
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
        transactionClient,
      );

      return createdRestaurant;
    },
  );

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

async function findOneBySlug(slug) {
  return await runSelectQuery(slug);

  async function runSelectQuery(slug) {
    const result = await database.query({
      text: `
      SELECT
      *
      FROM
      restaurants
      WHERE
      slug=$1
      `,
      values: [slug],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O `slug` informado não foi encontrado no sistema.",
        action: "Verifique o `slug` informado.",
      });
    }
    return result.rows[0];
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

async function update(recieviedSlug, restaurantInputValues) {
  if (
    !restaurantInputValues ||
    Object.keys(restaurantInputValues).length === 0
  ) {
    throw new ValidationError({
      message: "A requisição espera um objeto, que não foi enviado.",
      action: "Verifique o corpo da requisição.",
    });
  }

  if ("name" in restaurantInputValues) {
    await validateUniqueName(restaurantInputValues.name);

    restaurantInputValues = {
      ...restaurantInputValues,
      slug: slugify(restaurantInputValues.name),
    };
  }

  const currentRestaurant = await findOneBySlug(recieviedSlug);
  const userWithNewValues = { ...currentRestaurant, ...restaurantInputValues };

  return await runUpdateQuery(userWithNewValues);

  async function runUpdateQuery(userWithNewValues) {
    const result = await database.query({
      text: `UPDATE restaurants
             SET name=$1, max_covers=$2, slug=$3, updated_at=now()
             WHERE id=$4
             RETURNING *`,
      values: [
        userWithNewValues.name,
        userWithNewValues.max_covers,
        userWithNewValues.slug,
        userWithNewValues.id,
      ],
    });
    return result.rows[0];
  }
}

const restaurant = { create, findOneBySlug, update };
export default restaurant;

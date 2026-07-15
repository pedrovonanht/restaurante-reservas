import {
  ForbiddenError,
  NotFoundError,
} from "infra/error.js";
import membership from "models/membership.js";

const ROLE_PERMISSIONS = {
  owner: ["read:restaurant", "update:restaurant"],
  staff: ["read:restaurant"],
};

const BASE_FEATURES = ["create:restaurant"];
const ADMIN_FEATURES = ["read:migrations", "create:migrations"];

function getUserFeatures(user) {
  const features = [...BASE_FEATURES];

  if (user?.is_admin) {
    features.push(...ADMIN_FEATURES);
  }

  return features;
}

function can(membershipObject, permission) {
  const rolePermissions = ROLE_PERMISSIONS[membershipObject?.role] ?? [];
  return rolePermissions.includes(permission);
}


async function requireMembership(user, restaurantId) {
  try {
    return await membership.findOneByRestaurantIdAndUserId(
      restaurantId,
      user.id,
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError({
        message: "Usuário não pode executar esta operação.",
        action: "Verifique se este usuário possui uma assinatura válida.",
        cause: error,
      });
    }

    throw error;
  }
}

function filterOutput(feature, output) {
  let filteredOutputValues = {};

  if (feature === "read:user") {
    filteredOutputValues = {
      id: output.id,
      username: output.username,
      email: output.email,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:restaurant") {
    filteredOutputValues = {
      id: output.id,
      name: output.name,
      slug: output.slug,
      max_covers: output.max_covers,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  // Força a limpeza de valores "undefined"
  return JSON.parse(JSON.stringify(filteredOutputValues));
}

const authorization = {
  can,
  requireMembership,
  filterOutput,
  getUserFeatures,
};

export default authorization;

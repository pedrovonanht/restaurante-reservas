const ROLE_PERMISSIONS = {
  owner: [
    "read:restaurant",
    "update:restaurant",
    "create:event",
    "update:event",
    "manage:event-preset",
  ],
  staff: ["read:restaurant"],
};

const BASE_FEATURES = [];
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

  if (feature === "read:event") {
    filteredOutputValues = {
      id: output.id,
      name: output.name,
      event_date: output.event_date,
      event_times: output.event_times,
      capacity: output.capacity,
      active: output.active,
      preset_id: output.preset_id,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:event:public") {
    filteredOutputValues = {
      name: output.name,
      event_date: output.event_date,
      event_times: output.event_times,
    };
  }

  if (feature === "read:event-preset") {
    filteredOutputValues = {
      id: output.id,
      name: output.name,
      capacity: output.capacity,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  // Força a limpeza de valores "undefined"
  return JSON.parse(JSON.stringify(filteredOutputValues));
}

const authorization = {
  can,
  filterOutput,
  getUserFeatures,
};

export default authorization;

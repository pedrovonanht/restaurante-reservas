const ROLE_PERMISSIONS = {
  owner: [
    "read:restaurant",
    "update:restaurant",
    "create:event",
    "update:event",
    "manage:event-preset",
    "read:event",
    "read:event:public",
    "read:table",
    "manage:table",
  ],
  staff: ["read:restaurant", "read:event", "read:table", "manage:table"],
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
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }




  if (!Array.isArray(output)) {
  if (feature === "read:event:public") {
    filteredOutputValues = {
      name: output.name,
      event_date: output.event_date,
      event_times: output.event_times,
    };
  }

   if (feature === "read:event") {
    filteredOutputValues = {
      id: output.id,
      name: output.name,
      event_date: output.event_date,
      event_times: output.event_times,
      active: output.active,
      preset_id: output.preset_id,
      ocupation: output.ocupation,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:table") {
    filteredOutputValues = {
      id: output.id,
      restaurant_id: output.restaurant_id,
      name: output.name,
      min_capacity: output.min_capacity,
      max_capacity: output.max_capacity,
      active: output.active,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }
} else {
  if (feature === "read:event:public"){
    filteredOutputValues = output
    .filter((item) => item.active)
    .map((item) => {
    return {
      name: item.name,
      event_date: item.event_date,
      event_times: item.event_times,
    };

    }

    );
  }
  if( feature === "read:event") {
    filteredOutputValues = output.map((item) => {
      return {
      id: item.id,
      name: item.name,
      event_date: item.event_date,
      event_times: item.event_times,
      active: item.active,
      preset_id: item.preset_id,
      ocupation: item.ocupation,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
    })
  }

  if (feature === "read:table") {
    filteredOutputValues = output.map((item) => {
      return {
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        min_capacity: item.min_capacity,
        max_capacity: item.max_capacity,
        active: item.active,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });
  }
  }


  if (feature === "read:event-preset") {
    filteredOutputValues = {
      id: output.id,
      name: output.name,
      event_times: output.event_times,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:restaurant:self") {
    filteredOutputValues = {
        name: output.name,
        id: output.id,
        slug: output.slug,
        role: output.role
    }
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

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("memberships", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    restaurant_id: {
      type: "uuid",
      notNull: true,
      references: "restaurants(id)",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
    },
    role: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("memberships");
};

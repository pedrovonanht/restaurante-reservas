exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("event_presets", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    restaurant_id: {
      type: "uuid",
      notNull: true,
      references: "restaurants(id)",
      onDelete: "CASCADE",
    },
    name: {
      type: "text",
      notNull: true,
    },
    capacity: {
      type: "integer",
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
  pgm.dropTable("event_presets");
};

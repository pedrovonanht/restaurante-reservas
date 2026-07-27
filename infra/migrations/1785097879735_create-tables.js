exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("tables", {
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
    min_capacity: {
      type: "integer",
      notNull: true,
      default: 1,
    },
    max_capacity: {
      type: "integer",
      notNull: true,
    },
    active: {
      type: "boolean",
      notNull: true,
      default: true,
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

  pgm.createIndex("tables", ["restaurant_id", "name"], {
    unique: true,
    where: "active",
    name: "tables_restaurant_name_active_unique",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("tables");
};

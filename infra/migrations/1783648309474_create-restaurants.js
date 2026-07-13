exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("restaurants", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "varchar",
      notNull: true,
    },
    slug: {
      type: "varchar",
      notNull: true,
      unique: true,
    },
    max_covers: {
      type: "integer",
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
  pgm.dropTable("restaurants");
};

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable(
    "events",
    {
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
      event_date: {
        type: "date",
        notNull: true,
      },
      event_times: {
        type: "time[]",
        notNull: true,
      },
      name: {
        type: "text",
        notNull: true,
      },
      capacity: {
        type: "integer",
      },
      active: {
        type: "boolean",
        notNull: true,
        default: true,
      },
      preset_id: {
        type: "uuid",
        references: "event_presets(id)",
        onDelete: "SET NULL",
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
    },
    {
      constraints: {
        unique: ["restaurant_id", "event_date"],
      },
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable("events");
};

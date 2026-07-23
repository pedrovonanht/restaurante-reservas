exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable(
    "reservations",
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
      event_id: {
        type: "uuid",
        notNull: true,
        references: "events(id)",
        onDelete: "CASCADE"
      },
      party_size: {
        type: "integer",
        notNull: true
      },
      public_token: {
        type:"text",
        notNull: "true",
        unique: true
      },
      guest_name: {
        type: "text",
        notNull: true
      },
      guest_phone: {
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
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable("reservations");
};

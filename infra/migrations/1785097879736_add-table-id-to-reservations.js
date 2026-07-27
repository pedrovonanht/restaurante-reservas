exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("reservations", {
    table_id: {
      type: "uuid",
      references: "tables(id)",
    },
  });

  pgm.createIndex("reservations", ["event_id", "table_id"], {
    unique: true,
    where: '"table_id" IS NOT NULL',
    name: "reservations_event_table_unique",
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("reservations", "table_id");
};

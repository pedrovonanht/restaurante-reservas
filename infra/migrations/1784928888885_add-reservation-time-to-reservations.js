exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("reservations", {
    reservation_time: {
        type: "time",
        notNull: true,
      },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("reservations", "reservation_time");
};

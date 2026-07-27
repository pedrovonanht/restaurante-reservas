exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumn("restaurants", "max_covers");
};

exports.down = (pgm) => {
  pgm.addColumn("restaurants", {
    max_covers: {
      type: "integer",
      notNull: true,
      default: 0,
    },
  });
};

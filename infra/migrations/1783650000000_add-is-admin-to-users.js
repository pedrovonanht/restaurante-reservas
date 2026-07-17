exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("users", {
    is_admin: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("users", "is_admin");
};

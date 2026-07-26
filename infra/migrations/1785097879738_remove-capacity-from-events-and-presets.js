exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumn("events", "capacity");
  pgm.dropColumn("event_presets", "capacity");
};

exports.down = (pgm) => {
  pgm.addColumn("events", {
    capacity: {
      type: "integer",
    },
  });

  pgm.addColumn("event_presets", {
    capacity: {
      type: "integer",
    },
  });
};

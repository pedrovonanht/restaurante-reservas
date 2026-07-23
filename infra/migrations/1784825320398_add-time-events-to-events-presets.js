exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("event_presets", {
    event_times: {
        type: "time[]",
        notNull: true,
      },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("event_presets", "event_times");
};

const chalk = require("chalk");

const getTimestamp = () =>
  new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const log = (level, color, icon, message, meta = {}) => {
  console.log(
    `${chalk[color](icon)} ${chalk.gray(getTimestamp())} ${chalk[color].bold(
      level
    )} ${chalk.white(message)}`
  );

  if (meta && Object.keys(meta).length) {
    console.dir(meta, { depth: null, colors: true }); // Allow object expansion
  }
};

const logger = {
  info: (message, meta) => log("INFO", "blue", "ℹ", message, meta),
  success: (message, meta) => log("SUCCESS", "green", "✓", message, meta),
  warn: (message, meta) => log("WARN", "yellow", "⚠", message, meta),
  error: (message, error = {}, meta) => {
    console.error(
      `${chalk.red("✖")} ${chalk.gray(getTimestamp())} ${chalk.red.bold(
        "ERROR"
      )} ${chalk.white(message)}\n${chalk.red("→")} ${chalk.red(
        error.message || error
      )}`
    );

    if (error.stack) console.error(chalk.gray(error.stack));
    if (meta && Object.keys(meta).length)
      console.dir(meta, { depth: null, colors: true });
  },
  debug: (message, meta) => log("DEBUG", "magenta", "⚙", message, meta),
};

module.exports = logger;

const chalk = require("chalk");

const getTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const formatMeta = (meta) => {
  if (Object.keys(meta).length === 0) return "";
  return "\n" + chalk.gray(JSON.stringify(meta, null, 2));
};

const logger = {
  info: (message, meta = {}) => {
    console.log(
      `${chalk.blue("ℹ")} ${chalk.gray(getTimestamp())} ${chalk.blue.bold(
        "INFO"
      )} ${chalk.white(message)}${formatMeta(meta)}`
    );
  },

  success: (message, meta = {}) => {
    console.log(
      `${chalk.green("✓")} ${chalk.gray(getTimestamp())} ${chalk.green.bold(
        "SUCCESS"
      )} ${chalk.white(message)}${formatMeta(meta)}`
    );
  },

  warn: (message, meta = {}) => {
    console.log(
      `${chalk.yellow("⚠")} ${chalk.gray(getTimestamp())} ${chalk.yellow.bold(
        "WARN"
      )} ${chalk.white(message)}${formatMeta(meta)}`
    );
  },

  error: (message, error = {}, meta = {}) => {
    const errorMessage = error.message || error;
    const errorStack = error.stack ? "\n" + chalk.gray(error.stack) : "";

    console.error(
      `${chalk.red("✖")} ${chalk.gray(getTimestamp())} ${chalk.red.bold(
        "ERROR"
      )} ${chalk.white(message)}\n${chalk.red("→")} ${chalk.red(
        errorMessage
      )}${errorStack}${formatMeta(meta)}`
    );
  },

  debug: (message, meta = {}) => {
    console.log(
      `${chalk.magenta("⚙")} ${chalk.gray(getTimestamp())} ${chalk.magenta.bold(
        "DEBUG"
      )} ${chalk.white(message)}${formatMeta(meta)}`
    );
  },
};

module.exports = logger;

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

const serializeError = (error) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
      ...(error.type && { type: error.type }),
      ...(error.name && { name: error.name }),
    };
  }
  return error;
};

const log = (level, color, icon, message, meta = {}) => {
  console.log(
    `${chalk[color](icon)} ${chalk.gray(getTimestamp())} ${chalk[color].bold(
      level
    )} ${chalk.white(message)}`
  );

  if (meta && Object.keys(meta).length) {
    console.dir(meta, { depth: null, colors: true });
  }
};

const logger = {
  info: (message, meta) => log("INFO", "blue", "ℹ", message, meta),
  success: (message, meta) => log("SUCCESS", "green", "✓", message, meta),
  warn: (message, meta) => log("WARN", "yellow", "⚠", message, meta),
  error: (message, error = {}, meta) => {
    const serializedError = serializeError(error);
    
    console.error(
      `${chalk.red("✖")} ${chalk.gray(getTimestamp())} ${chalk.red.bold(
        "ERROR"
      )} ${chalk.white(message)}`
    );
    
    console.error(chalk.red("→ Error Details:"));
    console.dir(serializedError, { depth: null, colors: true });
    
    if (meta && Object.keys(meta).length) {
      console.error(chalk.red("→ Additional Metadata:"));
      console.dir(meta, { depth: null, colors: true });
    }
  },
  debug: (message, meta) => log("DEBUG", "magenta", "⚙", message, meta),
};

module.exports = logger;

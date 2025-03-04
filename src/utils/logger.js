const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ level: "info", message, ...meta }, null, 2));
  },
  error: (message, error = {}, meta = {}) => {
    console.error(
      JSON.stringify(
        {
          level: "error",
          message,
          error: error.message || error,
          stack: error.stack,
          ...meta,
        },
        null,
        2
      )
    );
  },
};

module.exports = logger;

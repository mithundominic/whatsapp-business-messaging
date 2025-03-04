const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;

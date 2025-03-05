const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    file: "errorHandler.js",
    line: err.stack?.split("\n")[1]?.trim() || "unknown",
    stack: err.stack,
    requestId: req.id,
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
    requestId: req.id,
  });
};

module.exports = errorHandler;

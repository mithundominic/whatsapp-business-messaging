const express = require("express");
const webhookRoutes = require("./routes/webhookRoutes");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config/environment");
const logger = require("./utils/logger");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hotel Management System API");
});

app.use(webhookRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

module.exports = app;

const express = require("express");
const webhookRoutes = require("./routes/webhookRoutes");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config/environment");
const logger = require("./utils/logger");

const app = express();

// 🛑 Place Stripe Webhook Middleware BEFORE express.json()
app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }), // ✅ Preserve raw body
  (req, res, next) => {
    req.rawBody = req.body; // ✅ Ensure rawBody is captured
    next();
  }
);

// ✅ Now, Apply JSON Middleware After Webhook Handling
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

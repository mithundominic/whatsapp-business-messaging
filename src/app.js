const express = require("express");
const webhookRoutes = require("./routes/webhookRoutes");
const stripeWebhookRoutes = require("./routes/stripeWebhookRoutes");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config/environment");
const logger = require("./utils/logger");

const app = express();

// Raw body parser for Stripe webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/stripe') {
    next();
  } else {
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })(req, res, next);
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("WhatsApp Business Messaging API");
});

// WhatsApp webhook routes
app.use(webhookRoutes);

// Stripe webhook routes
app.use(stripeWebhookRoutes);

// Error handling
app.use(errorHandler);

// Start server
const port = config.port || 3000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info('Webhook endpoints:');
  logger.info(` - WhatsApp: ${config.baseUrl}/webhook/whatsapp`);
  logger.info(` - Stripe: ${config.baseUrl}/webhook/stripe`);
});

module.exports = app;

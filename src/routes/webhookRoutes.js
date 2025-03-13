const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const {
  verifyWebhook,
  handleMessage,
} = require("../controllers/webhookController");
const { handleWebhook } = require("../controllers/stripeWebhookController");

// Log incoming requests
router.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    headers: req.headers,
    ip: req.ip,
  });
  next();
});

// WhatsApp webhook verification endpoint
router.get("/webhook/whatsapp", verifyWebhook);

// WhatsApp webhook event handling endpoint
router.post("/webhook/whatsapp", handleMessage);

// Stripe webhook event handling endpoint
router.post("/webhook/stripe", handleWebhook);

module.exports = router;

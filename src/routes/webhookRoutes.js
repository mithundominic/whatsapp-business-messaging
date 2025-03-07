const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  handleMessage,
} = require("../controllers/webhookController");

// Webhook verification endpoint
router.get("/webhook/whatsapp", verifyWebhook);

// Webhook event handling endpoint
router.post("/webhook/whatsapp", handleMessage);

module.exports = router;

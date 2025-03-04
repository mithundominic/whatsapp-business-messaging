const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  handleMessage,
} = require("../controllers/webhookController");

// Webhook verification endpoint
router.get("/webhook", verifyWebhook);

// Webhook event handling endpoint
router.post("/webhook", handleMessage);

module.exports = router;

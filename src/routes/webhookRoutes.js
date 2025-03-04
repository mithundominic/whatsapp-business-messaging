const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  handleWebhook,
} = require("../controllers/webhookController");

// Webhook verification endpoint
router.get("/webhook", verifyWebhook);

// Webhook event handling endpoint
router.post("/webhook", handleWebhook);

module.exports = router;
